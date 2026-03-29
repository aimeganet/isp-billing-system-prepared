import Link from "next/link";
import { deletePackagePlanAction } from "@/actions/admin";
import { PackageForm } from "@/components/forms/package-form";
import { SettingsForm } from "@/components/forms/settings-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import { formatCurrency } from "@/lib/utils";

export default async function SettingsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_UPDATE, "/dashboard");
  const [settings, packages] = await Promise.all([
    getSettingsMap(),
    prisma.packagePlan.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeading
        title="الإعدادات"
        description="إعدادات النظام العامة والفواتير والرسائل والمعرفات."
        action={
          <Link href="/settings/ai" className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white">
            إعدادات الذكاء الاصطناعي
          </Link>
        }
      />
      <SettingsForm values={settings} />
      <PackageForm />
      <Card>
        <div className="mb-4 text-lg font-semibold">الباقات</div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>الكود</TH>
                <TH>الجيجات</TH>
                <TH>المدة</TH>
                <TH>السعر</TH>
                <TH>الحالة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {packages.map((plan) => (
                <tr key={plan.id}>
                  <TD>{plan.name}</TD>
                  <TD>{plan.code}</TD>
                  <TD>{plan.gigabytes}</TD>
                  <TD>{plan.durationDays}</TD>
                  <TD>{formatCurrency(plan.price)}</TD>
                  <TD>{plan.active ? "نشطة" : "موقوفة"}</TD>
                  <TD>
                    <div className="flex gap-3">
                      <Link href={`/settings/packages/${plan.id}`} className="text-blue-600">تعديل</Link>
                      <form action={deletePackagePlanAction}>
                        <input type="hidden" name="id" value={plan.id} />
                        <button type="submit" className="text-red-600">حذف</button>
                      </form>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
