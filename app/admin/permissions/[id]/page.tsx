import { notFound } from "next/navigation";
import { PermissionForm } from "@/components/forms/permission-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditPermissionPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.ROLES_UPDATE, "/admin/permissions");
  const permission = await prisma.permission.findUnique({ where: { id: params.id } });
  if (!permission) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل الصلاحية" description={permission.name} />
      <PermissionForm permission={permission} />
    </div>
  );
}
