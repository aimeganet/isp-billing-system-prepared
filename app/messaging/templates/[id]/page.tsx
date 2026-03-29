import { notFound } from "next/navigation";
import { MessageTemplateForm } from "@/components/forms/message-template-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function MessageTemplateEditPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.TEMPLATES_MANAGE, "/messaging/templates");
  const template = await prisma.messageTemplate.findUnique({ where: { id: params.id } });
  if (!template) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل قالب الرسالة" description={template.name} />
      <MessageTemplateForm template={template} />
    </div>
  );
}
