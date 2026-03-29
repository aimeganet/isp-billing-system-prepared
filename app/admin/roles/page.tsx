import Link from "next/link";
import { deleteRoleAction } from "@/actions/admin";
import { RoleForm } from "@/components/forms/role-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function RolesPage() {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/dashboard");
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ include: { permissions: true, users: true }, orderBy: { createdAt: "desc" } }),
    prisma.permission.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeading title="الأدوار" description="إدارة الأدوار وربطها بالصلاحيات والمستخدمين." />
      <RoleForm permissions={permissions.map((item) => ({ id: item.id, key: item.key, name: item.name }))} />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>المفتاح</TH>
                <TH>الصلاحيات</TH>
                <TH>المستخدمون</TH>
                <TH>الحالة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <TD>{role.name}</TD>
                  <TD>{role.key}</TD>
                  <TD>{role.permissions.length}</TD>
                  <TD>{role.users.length}</TD>
                  <TD>{role.active ? "نشط" : "موقوف"}</TD>
                  <TD>
                    <div className="flex gap-3">
                      <Link href={`/admin/roles/${role.id}`} className="text-blue-600">تعديل</Link>
                      {!role.isSystem ? (
                        <form action={deleteRoleAction}>
                          <input type="hidden" name="id" value={role.id} />
                          <button type="submit" className="text-red-600">حذف</button>
                        </form>
                      ) : <span className="text-slate-400">نظامي</span>}
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
