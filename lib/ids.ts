import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/utils";

async function nextSequence(prefix: string, field: "subscriberCode" | "transactionNo" | "invoiceNo") {
  let values: string[] = [];

  if (field === "subscriberCode") {
    const rows = await prisma.subscriber.findMany({
      where: { subscriberCode: { startsWith: prefix } },
      select: { subscriberCode: true }
    });
    values = rows.map((row) => row.subscriberCode);
  }

  if (field === "transactionNo") {
    const rows = await prisma.transaction.findMany({
      where: { transactionNo: { startsWith: prefix } },
      select: { transactionNo: true }
    });
    values = rows.map((row) => row.transactionNo);
  }

  if (field === "invoiceNo") {
    const rows = await prisma.invoice.findMany({
      where: { invoiceNo: { startsWith: prefix } },
      select: { invoiceNo: true }
    });
    values = rows.map((row) => row.invoiceNo);
  }

  const max = values.reduce((acc, value) => {
    const num = Number(value.replace(prefix, ""));
    return Number.isFinite(num) && num > acc ? num : acc;
  }, 0);

  return max + 1;
}

export async function generateSubscriberCode(phone?: string | null, usePhoneAsIdentifier = false) {
  const normalizedPhone = normalizePhone(phone);
  if (usePhoneAsIdentifier && normalizedPhone) {
    return normalizedPhone;
  }

  const seq = await nextSequence("SUB-", "subscriberCode");
  return `SUB-${String(seq).padStart(5, "0")}`;
}

export async function generateTransactionNo() {
  const seq = await nextSequence("TRX-", "transactionNo");
  return `TRX-${String(seq).padStart(6, "0")}`;
}

export async function generateInvoiceNo() {
  const seq = await nextSequence("INV-", "invoiceNo");
  return `INV-${String(seq).padStart(6, "0")}`;
}
