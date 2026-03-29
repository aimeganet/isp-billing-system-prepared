import { notFound } from "next/navigation";
import { PackageForm } from "@/components/forms/package-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.PACKAGES_MANAGE, "/settings");
  const plan = await prisma.packagePlan.findUnique({ where: { id: params.id } });
  if (!plan) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل الباقة" description={plan.name} />
      <PackageForm plan={plan} />
    </div>
  );
}
