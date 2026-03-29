import { addDays } from "date-fns";
import { InvoiceStatus, MessageChannel, TransactionMethodType, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNo } from "@/lib/ids";
import { getBooleanSetting, getNumberSetting, getSetting } from "@/lib/settings";

export function calculateNet(amount: number, methodType: TransactionMethodType) {
  if (methodType === TransactionMethodType.EMPLOYEE) return amount;
  if (methodType === TransactionMethodType.WALLET) return amount;
  return 0;
}

export function calculateExcluded(amount: number, net: number) {
  return Math.max(amount - net, 0);
}

export async function updateSubscriberLifecycle(params: {
  subscriberId: string;
  packagePlanId?: string;
  type: TransactionType;
  occurredAt?: Date;
}) {
  const occurredAt = params.occurredAt ?? new Date();
  const defaultDays = await getNumberSetting("defaultSubscriptionDays", 30);

  const packagePlan = params.packagePlanId
    ? await prisma.packagePlan.findUnique({ where: { id: params.packagePlanId } })
    : null;

  const durationDays = packagePlan?.durationDays ?? defaultDays;

  if (
    params.type === TransactionType.RENEWAL ||
    params.type === TransactionType.ACTIVATION ||
    params.type === TransactionType.EXTRA_PACKAGE_RESET
  ) {
    await prisma.subscriber.update({
      where: { id: params.subscriberId },
      data: {
        currentPackageId: params.packagePlanId ?? undefined,
        currentStartDate: occurredAt,
        currentEndDate: addDays(occurredAt, durationDays),
        status: "ACTIVE"
      }
    });
  }

  if (params.type === TransactionType.EXTRA_PACKAGE && params.packagePlanId) {
    await prisma.subscriber.update({
      where: { id: params.subscriberId },
      data: {
        currentPackageId: params.packagePlanId
      }
    });
  }
}

export async function createInvoiceForTransaction(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      subscriber: true,
      packagePlan: true
    }
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const existing = await prisma.invoice.findFirst({
    where: { sourceTransactionId: transaction.id }
  });

  if (existing) return existing;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: await generateInvoiceNo(),
      subscriberId: transaction.subscriberId,
      sourceTransactionId: transaction.id,
      subtotal: transaction.net,
      total: transaction.net,
      status: InvoiceStatus.PUBLISHED,
      channel: (await getSetting("defaultMessageChannel", "WHATSAPP")) as MessageChannel,
      publishedAt: new Date(),
      notes: transaction.notes,
      items: {
        create: [
          {
            label: transaction.type,
            description: transaction.packagePlan?.name ?? transaction.notes ?? "عملية مالية",
            quantity: 1,
            unitPrice: transaction.net,
            total: transaction.net,
            gigabytes: transaction.packagePlan?.gigabytes ?? null
          }
        ]
      }
    }
  });

  return invoice;
}

export async function shouldAutoSendInvoice() {
  return getBooleanSetting("autoSendInvoices", false);
}

export async function shouldAllowManualSend() {
  return getBooleanSetting("allowManualSend", true);
}

export async function shouldRequireScreenshotForWallet() {
  return getBooleanSetting("requireScreenshotForWallets", true);
}

export function eventKeyForTransaction(type: TransactionType) {
  if (type === TransactionType.RENEWAL) return "invoice.renewal";
  if (type === TransactionType.EXTRA_PACKAGE || type === TransactionType.EXTRA_PACKAGE_RESET) {
    return "invoice.extra";
  }
  return "invoice.generic";
}
