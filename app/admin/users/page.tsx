import Link from "next/link";
import { deleteUserAction } from "@/actions/admin";
import { UserForm } from "@/components/forms/user-form";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Table, TD, TH } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function UsersPage() {
  await requirePermission(PERMISSIONS.USERS_READ, "/dashboard");
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      include: { userRoles: { include: { role: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.role.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeading title="المستخدمون والصلاحيات" description="إدارة المديرين والمشرفين والموظفين على مستوى النظام." />
      <UserForm roles={roles.map((role) => ({ id: role.id, name: role.name, key: role.key }))} />
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <TH>الاسم</TH>
                <TH>البريد</TH>
                <TH>الدور</TH>
                <TH>الأدوار المرتبطة</TH>
                <TH>الحالة</TH>
                <TH>تاريخ الإضافة</TH>
                <TH>إجراءات</TH>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <TD>{user.name}</TD>
                  <TD dir="ltr">{user.email}</TD>
                  <TD>{user.role}</TD>
                  <TD>{user.userRoles.map((item) => item.role.name).join("، ") || "-"}</TD>
                  <TD>{user.active ? "نشط" : "موقوف"}</TD>
                  <TD>{formatDate(user.createdAt)}</TD>
                  <TD>
                    <div className="flex gap-3">
                      <Link href={`/admin/users/${user.id}`} className="text-blue-600">تعديل</Link>
                      <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={user.id} />
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
