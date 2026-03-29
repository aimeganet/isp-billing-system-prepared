import { ProfileForm } from "@/components/forms/profile-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeading
        title="الملف الشخصي"
        description="تحديث بيانات حسابك الشخصي وتغيير كلمة المرور بأمان."
      />
      <ProfileForm user={{ name: user.name, email: user.email }} />
    </div>
  );
}
