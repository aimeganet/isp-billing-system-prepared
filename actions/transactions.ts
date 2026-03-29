"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ActionState } from "@/lib/utils";
import { transactionSchema } from "@/lib/validators";
import { generateTransactionNo } from "@/lib/ids";
import {
  calculateExcluded,
  calculateNet,
  createInvoiceForTransaction,
  shouldAutoSendInvoice,
  shouldRequireScreenshotForWallet,
  updateSubscriberLifecycle
} from "@/lib/billing";
import { saveUploadedFile } from "@/lib/storage";
import { enqueueSync } from "@/lib/sync";
import { sendInvoiceMessage } from "@/lib/messaging/dispatcher";
import { TransactionMethodType } from "@prisma/client";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";

export async function createTransactionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.TRANSACTIONS_CREATE, "/dashboard");
  const raw = {
    subscriberId: String(formData.get("subscriberId") ?? ""),
    packagePlanId: String(formData.get("packagePlanId") ?? ""),
    type: String(formData.get("type") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    methodType: String(formData.get("methodType") ?? ""),
    employeeId: String(formData.get("employeeId") ?? ""),
    walletProviderId: String(formData.get("walletProviderId") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    extraMode: String(formData.get("extraMode") ?? "")
  };

  const parsed = transactionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "تحقق من بيانات العملية.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const screenshot = formData.get("screenshot");
  const requireScreenshot = await shouldRequireScreenshotForWallet();

  if (
    parsed.data.methodType === TransactionMethodType.WALLET &&
    requireScreenshot &&
    (!(screenshot instanceof File) || screenshot.size === 0)
  ) {
    return {
      success: false,
      message: "رفع صورة التحويل مطلوب عند اختيار محفظة إلكترونية."
    };
  }

  const net = calculateNet(parsed.data.amount, parsed.data.methodType);
  const excluded = calculateExcluded(parsed.data.amount, net);

  const transaction = await prisma.transaction.create({
    data: {
      transactionNo: await generateTransactionNo(),
      subscriberId: parsed.data.subscriberId,
      packagePlanId: parsed.data.packagePlanId || null,
      type: parsed.data.type,
      amount: parsed.data.amount,
      methodType: parsed.data.methodType,
      employeeId:
        parsed.data.methodType === TransactionMethodType.EMPLOYEE
          ? parsed.data.employeeId || null
          : null,
      walletProviderId:
        parsed.data.methodType === TransactionMethodType.WALLET
          ? parsed.data.walletProviderId || null
          : null,
      net,
      excluded,
      extraMode: parsed.data.extraMode || null,
      notes: parsed.data.notes || null
    }
  });

if (screenshot instanceof File && screenshot.size > 0) {
  const stored = await saveUploadedFile(screenshot, "screenshots");
  const attachment = await prisma.transactionAttachment.create({
    data: {
      transactionId: transaction.id,
      kind: "SCREENSHOT",
      fileName: stored.fileName,
      filePath: stored.relativePath,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes
    }
  });

  await enqueueSync("transactionAttachment", attachment.id, "UPSERT", attachment);
}

  await updateSubscriberLifecycle({
    subscriberId: transaction.subscriberId,
    packagePlanId: transaction.packagePlanId ?? undefined,
    type: transaction.type,
    occurredAt: transaction.occurredAt
  });

  const invoice = await createInvoiceForTransaction(transaction.id);

await enqueueSync("transaction", transaction.id, "UPSERT", transaction);
await enqueueSync("invoice", invoice.id, "UPSERT", invoice);

const invoiceItems = await prisma.invoiceItem.findMany({
  where: { invoiceId: invoice.id }
});

for (const item of invoiceItems) {
  await enqueueSync("invoiceItem", item.id, "UPSERT", item);
}

  if (await shouldAutoSendInvoice()) {
    await sendInvoiceMessage(invoice.id);
  }

  await recordAudit("CREATE", "transaction", transaction.id, {
    transactionNo: transaction.transactionNo,
    subscriberId: transaction.subscriberId,
    type: transaction.type,
    amount: transaction.amount
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath(`/subscribers/${transaction.subscriberId}`);

  return {
    success: true,
    message: `تم تسجيل العملية ${transaction.transactionNo} بنجاح.`
  };
}
