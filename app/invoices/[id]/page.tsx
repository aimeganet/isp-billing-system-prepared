import { notFound } from "next/navigation";
import { sendInvoiceNowAction } from "@/actions/settings";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { PageHeading } from "@/components/shared/page-heading";
import { can, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { getBooleanSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InvoiceDetailsPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.INVOICES_READ, "/invoices");
  const [invoice, allowManualSend, canSendInvoice] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: params.id },
      include: { subscriber: true, items: true, sourceTransaction: true }
    }),
    getBooleanSetting("allowManualSend", true),
    can(PERMISSIONS.INVOICES_SEND)
  ]);

  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title={`الفاتورة ${invoice.invoiceNo}`} description={`المشترك: ${invoice.subscriber.name}`} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardDescription>الحالة</CardDescription><CardTitle>{invoice.status}</CardTitle></Card>
        <Card><CardDescription>الإجمالي</CardDescription><CardTitle>{formatCurrency(invoice.total)}</CardTitle></Card>
        <Card><CardDescription>القناة</CardDescription><CardTitle>{invoice.channel}</CardTitle></Card>
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>بنود الفاتورة</CardTitle>
          {allowManualSend && canSendInvoice ? (
            <form action={sendInvoiceNowAction}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">إرسال الرسالة الآن</button>
            </form>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>البند</TH>
                <TH>الوصف</TH>
                <TH>الكمية</TH>
                <TH>السعر</TH>
                <TH>الإجمالي</TH>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <TD>{item.label}</TD>
                  <TD>{item.description ?? "-"}</TD>
                  <TD>{item.quantity}</TD>
                  <TD>{formatCurrency(item.unitPrice)}</TD>
                  <TD>{formatCurrency(item.total)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
      <Card>
        <CardDescription>تاريخ الإنشاء</CardDescription>
        <CardTitle>{formatDate(invoice.createdAt)}</CardTitle>
      </Card>
    </div>
  );
}
