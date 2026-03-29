import Link from "next/link";
import { deletePermissionAction } from "@/actions/admin";
import { PermissionForm } from "@/components/forms/permission-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function PermissionsPage() {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const permissions = await prisma.permission.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeading title="الصلاحيات" description="إدارة صلاحيات النظام وتفعيل أو إيقاف أي صلاحية إضافية." />
      <PermissionForm />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>المفتاح</TH>
                <TH>الحالة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <TD>{permission.name}</TD>
                  <TD>{permission.key}</TD>
                  <TD>{permission.active ? "نشطة" : "موقوفة"}</TD>
                  <TD>
                    <div className="flex gap-3">
                      <Link href={`/admin/permissions/${permission.id}`} className="text-blue-600">تعديل</Link>
                      {!permission.isSystem ? (
                        <form action={deletePermissionAction}>
                          <input type="hidden" name="id" value={permission.id} />
                          <button type="submit" className="text-red-600">حذف</button>
                        </form>
                      ) : <span className="text-slate-400">نظامية</span>}
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
