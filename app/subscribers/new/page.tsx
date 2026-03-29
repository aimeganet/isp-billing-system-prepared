import { SubscriberForm } from "@/components/forms/subscriber-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { getBooleanSetting } from "@/lib/settings";

export default async function NewSubscriberPage() {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_CREATE, "/subscribers");
  const allowPhoneAsCode = await getBooleanSetting("usePhoneAsIdentifier", false);

  return (
    <div className="space-y-6">
      <PageHeading title="إضافة مشترك" description="إنشاء مشترك جديد مع معرف ثابت وسجل اتصالات." />
      <SubscriberForm allowPhoneAsCode={allowPhoneAsCode} />
    </div>
  );
}
