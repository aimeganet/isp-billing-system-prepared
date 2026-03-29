import { notFound } from "next/navigation";
import { RoleForm } from "@/components/forms/role-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditRolePage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/admin/roles");
  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({ include: { permissions: true }, where: { id: params.id } }),
    prisma.permission.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  if (!role) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل الدور" description={role.name} />
      <RoleForm
        permissions={permissions.map((item) => ({ id: item.id, key: item.key, name: item.name }))}
        role={{
          id: role.id,
          key: role.key,
          name: role.name,
          description: role.description,
          active: role.active,
          isSystem: role.isSystem,
          permissionIds: role.permissions.map((item) => item.permissionId)
        }}
      />
    </div>
  );
}
