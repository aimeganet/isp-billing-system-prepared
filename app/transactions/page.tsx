import Link from "next/link";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { can, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TransactionsPage() {
  await requirePermission(PERMISSIONS.TRANSACTIONS_READ, "/dashboard");
  const [transactions, canCreateTransaction] = await Promise.all([
    prisma.transaction.findMany({
    include: { subscriber: true, employee: true, walletProvider: true },
    orderBy: { occurredAt: "desc" }
    }),
    can(PERMISSIONS.TRANSACTIONS_CREATE)
  ]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="العمليات"
        description="كل عمليات التفعيل والتجديد والإيداع والإضافات مع صافي ومستبعد." 
        action={canCreateTransaction ? <Link href="/transactions/new" className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">إضافة عملية</Link> : null}
      />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الرقم</TH>
                <TH>المشترك</TH>
                <TH>النوع</TH>
                <TH>المبلغ</TH>
                <TH>الصافي</TH>
                <TH>المستبعد</TH>
                <TH>الطريقة</TH>
                <TH>التاريخ</TH>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <TD>{transaction.transactionNo}</TD>
                  <TD>{transaction.subscriber.name}</TD>
                  <TD>{transaction.type}</TD>
                  <TD>{formatCurrency(transaction.amount)}</TD>
                  <TD>{formatCurrency(transaction.net)}</TD>
                  <TD>{formatCurrency(transaction.excluded)}</TD>
                  <TD>{transaction.employee?.name ?? transaction.walletProvider?.name ?? transaction.methodType}</TD>
                  <TD>{formatDate(transaction.occurredAt)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
