import Link from "next/link";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InvoicesPage() {
  await requirePermission(PERMISSIONS.INVOICES_READ, "/dashboard");
  const invoices = await prisma.invoice.findMany({
    include: { subscriber: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <PageHeading title="الفواتير" description="متابعة نشر الفواتير وحالة الإرسال اليدوي أو التلقائي." />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>رقم الفاتورة</TH>
                <TH>المشترك</TH>
                <TH>الحالة</TH>
                <TH>الإجمالي</TH>
                <TH>القناة</TH>
                <TH>التاريخ</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <TD>{invoice.invoiceNo}</TD>
                  <TD>{invoice.subscriber.name}</TD>
                  <TD>{invoice.status}</TD>
                  <TD>{formatCurrency(invoice.total)}</TD>
                  <TD>{invoice.channel}</TD>
                  <TD>{formatDate(invoice.createdAt)}</TD>
                  <TD><Link href={`/invoices/${invoice.id}`} className="text-blue-600">فتح</Link></TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
