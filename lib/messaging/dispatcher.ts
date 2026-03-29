import { MessageChannel, MessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/lib/messaging/template-engine";
import { sendWhatsAppMessage } from "@/lib/messaging/providers/whatsapp";
import { sendTelegramMessage } from "@/lib/messaging/providers/telegram";
import { formatDate } from "@/lib/utils";
import { eventKeyForTransaction } from "@/lib/billing";
import { enqueueSync } from "@/lib/sync";

function pickContact(
  contacts: Array<{ phone: string; isPrimary: boolean; whatsappEnabled: boolean; telegramEnabled: boolean }>,
  channel: MessageChannel
) {
  if (channel === MessageChannel.NONE) return null;

  const eligible = contacts.filter((contact) => {
    if (channel === MessageChannel.WHATSAPP) return contact.whatsappEnabled;
    if (channel === MessageChannel.TELEGRAM) return contact.telegramEnabled;
    return true;
  });

  return eligible.find((item) => item.isPrimary) ?? eligible[0] ?? null;
}

export async function sendInvoiceMessage(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscriber: {
        include: {
          contacts: true
        }
      },
      sourceTransaction: {
        include: {
          packagePlan: true
        }
      }
    }
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.channel === MessageChannel.NONE) {
    const skippedLog = await prisma.messageLog.create({
      data: {
        invoiceId,
        subscriberId: invoice.subscriberId,
        phone: invoice.subscriber.phone ?? "",
        channel: invoice.channel,
        renderedContent: "Message delivery disabled for this invoice.",
        status: MessageStatus.SKIPPED,
        errorMessage: "Message channel set to NONE"
      }
    });

    await enqueueSync("messageLog", skippedLog.id, "UPSERT", skippedLog);

    return { ok: false, reason: "CHANNEL_DISABLED" };
  }

  const contact =
    pickContact(invoice.subscriber.contacts, invoice.channel) ??
    (invoice.subscriber.phone
      ? {
          phone: invoice.subscriber.phone,
          isPrimary: true,
          whatsappEnabled: true,
          telegramEnabled: true
        }
      : null);

  if (!contact?.phone) {
    const skippedLog = await prisma.messageLog.create({
      data: {
        invoiceId,
        subscriberId: invoice.subscriberId,
        phone: "",
        channel: invoice.channel,
        renderedContent: "No phone number found",
        status: MessageStatus.SKIPPED,
        errorMessage: "No eligible contact"
      }
    });

    await enqueueSync("messageLog", skippedLog.id, "UPSERT", skippedLog);

    return { ok: false, reason: "NO_CONTACT" };
  }

  const eventKey = invoice.sourceTransaction
    ? eventKeyForTransaction(invoice.sourceTransaction.type)
    : "invoice.generic";

  const template =
    (await prisma.messageTemplate.findFirst({
      where: {
        channel: invoice.channel,
        eventKey,
        active: true
      }
    })) ??
    (await prisma.messageTemplate.findFirst({
      where: {
        channel: invoice.channel,
        eventKey: "invoice.generic",
        active: true
      }
    }));

  const content = renderTemplate(
    template?.content ??
      "مرحبًا {name}، تم إصدار فاتورة جديدة بقيمة {amount} جنيه بتاريخ {date}.",
    {
      name: invoice.subscriber.name,
      phone: contact.phone,
      amount: invoice.total,
      package: invoice.sourceTransaction?.packagePlan?.name ?? "",
      date: formatDate(invoice.createdAt),
      invoiceNo: invoice.invoiceNo,
      subscriberCode: invoice.subscriber.subscriberCode,
      remaining: invoice.sourceTransaction?.packagePlan?.gigabytes ?? ""
    }
  );

  const result =
    invoice.channel === MessageChannel.TELEGRAM
      ? await sendTelegramMessage(contact.phone, content)
      : await sendWhatsAppMessage(contact.phone, content);

  const log = await prisma.messageLog.create({
    data: {
      invoiceId,
      subscriberId: invoice.subscriberId,
      phone: contact.phone,
      channel: invoice.channel,
      renderedContent: content,
      providerRef: result.providerRef ?? undefined,
      status: result.ok ? MessageStatus.SENT : MessageStatus.FAILED,
      errorMessage: result.ok ? undefined : JSON.stringify(result.response)
    }
  });

  await enqueueSync("messageLog", log.id, "UPSERT", log);

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      autoSendAttempted: true,
      status: result.ok ? "SENT" : "FAILED",
      messageSentAt: result.ok ? new Date() : null
    }
  });

  return { ok: result.ok, log };
}
