import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { can, requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { PageHeading } from "@/components/shared/page-heading";
import { StatCard } from "@/components/dashboard/stat-card";

export default async function DashboardPage() {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW, "/login");

  const [subscribersCount, transactionsCount, invoicesCount, pendingSync, canCreateTransactions] = await Promise.all([
    prisma.subscriber.count(),
    prisma.transaction.count(),
    prisma.invoice.count(),
    prisma.syncQueue.count({ where: { status: "PENDING" } }),
    can(PERMISSIONS.TRANSACTIONS_CREATE)
  ]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="لوحة التحكم"
        description="ملخص سريع للحالة الحالية للنظام المحلي وربط البيانات والعمليات اليومية."
        action={canCreateTransactions ? <Link href="/transactions/new" className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">عملية جديدة</Link> : null}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="المشتركون" value={String(subscribersCount)} description="إجمالي المشتركين المسجلين." />
        <StatCard title="العمليات" value={String(transactionsCount)} description="إجمالي العمليات المسجلة." />
        <StatCard title="الفواتير" value={String(invoicesCount)} description="كل الفواتير المنشأة حتى الآن." />
        <StatCard title="المزامنة" value={String(pendingSync)} description="عناصر تنتظر الدفع إلى القاعدة البعيدة." />
      </div>
    </div>
  );
}
