import { notFound } from "next/navigation";
import { SubscriberContactForm } from "@/components/forms/subscriber-contact-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function EditSubscriberContactPage({
  params
}: {
  params: { id: string; contactId: string };
}) {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_UPDATE, "/subscribers");

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.id },
    select: { id: true, name: true }
  });

  const contact = await prisma.subscriberContact.findFirst({
    where: { id: params.contactId, subscriberId: params.id }
  });

  if (!subscriber || !contact) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="تعديل جهة الاتصال" description={`المشترك: ${subscriber.name}`} />
      <SubscriberContactForm
        subscriberId={subscriber.id}
        subscriberName={subscriber.name}
        contact={{
          id: contact.id,
          label: contact.label,
          phone: contact.phone,
          whatsappEnabled: contact.whatsappEnabled,
          telegramEnabled: contact.telegramEnabled,
          isPrimary: contact.isPrimary
        }}
      />
    </div>
  );
}
