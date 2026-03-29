import { notFound } from "next/navigation";
import { UserForm } from "@/components/forms/user-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.USERS_UPDATE, "/admin/users");
  const [user, roles] = await Promise.all([
    prisma.user.findUnique({ include: { userRoles: true }, where: { id: params.id } }),
    prisma.role.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل المستخدم" description={user.email} />
      <UserForm
        roles={roles.map((role) => ({ id: role.id, name: role.name, key: role.key }))}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
          roleIds: user.userRoles.map((item) => item.roleId)
        }}
      />
    </div>
  );
}
