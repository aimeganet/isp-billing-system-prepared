import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  await requirePermission(PERMISSIONS.REPORTS_READ, "/dashboard");
  const [totals, extraPackages, sentMessages] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { total: true }, _count: true }),
    prisma.transaction.aggregate({ where: { type: { in: ["EXTRA_PACKAGE", "EXTRA_PACKAGE_RESET"] } }, _sum: { amount: true }, _count: true }),
    prisma.messageLog.count({ where: { status: "SENT" } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeading title="التقارير" description="ملخصات سريعة للدخل والفواتير والإضافات والرسائل." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardDescription>إجمالي الفواتير</CardDescription>
          <CardTitle>{formatCurrency(totals._sum.total ?? 0)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>إيراد الإضافات</CardDescription>
          <CardTitle>{formatCurrency(extraPackages._sum.amount ?? 0)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>رسائل مرسلة</CardDescription>
          <CardTitle>{String(sentMessages)}</CardTitle>
        </Card>
      </div>
    </div>
  );
}
