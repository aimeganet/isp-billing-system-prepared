import { notFound } from "next/navigation";
import { SubscriberContactForm } from "@/components/forms/subscriber-contact-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function NewSubscriberContactPage({ params }: { params: { id: string } }) {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_UPDATE, "/subscribers");

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.id },
    select: { id: true, name: true }
  });

  if (!subscriber) notFound();

  return (
    <div className="space-y-6">
      <PageHeading title="إضافة جهة اتصال" description={`المشترك: ${subscriber.name}`} />
      <SubscriberContactForm subscriberId={subscriber.id} subscriberName={subscriber.name} />
    </div>
  );
}
