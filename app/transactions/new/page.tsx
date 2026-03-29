import { PageHeading } from "@/components/shared/page-heading";
import { TransactionForm } from "@/components/forms/transaction-form";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function NewTransactionPage() {
  await requirePermission(PERMISSIONS.TRANSACTIONS_CREATE, "/transactions");
  const [subscribers, employees, wallets, packages] = await Promise.all([
    prisma.subscriber.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.employee.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.walletProvider.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.packagePlan.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeading title="إضافة عملية" description="تسجيل عملية محاسبية وربطها تلقائيًا بالفاتورة وسجل المشترك." />
      <TransactionForm subscribers={subscribers} employees={employees} wallets={wallets} packages={packages} />
    </div>
  );
}
