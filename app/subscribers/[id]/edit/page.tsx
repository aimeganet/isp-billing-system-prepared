import { notFound } from "next/navigation";
import { SubscriberForm } from "@/components/forms/subscriber-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getBooleanSetting } from "@/lib/settings";

export default async function EditSubscriberPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_UPDATE, "/subscribers");
  const [subscriber, allowPhoneAsCode] = await Promise.all([
    prisma.subscriber.findUnique({ where: { id: params.id } }),
    getBooleanSetting("usePhoneAsIdentifier", false)
  ]);

  if (!subscriber) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل المشترك" description={subscriber.name} />
      <SubscriberForm
        allowPhoneAsCode={allowPhoneAsCode}
        subscriber={{
          id: subscriber.id,
          name: subscriber.name,
          phone: subscriber.phone,
          notes: subscriber.notes,
          status: subscriber.status
        }}
      />
    </div>
  );
}
