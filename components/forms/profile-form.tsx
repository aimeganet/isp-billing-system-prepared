"use client";

import { useActionState } from "react";
import { updateMyProfileAction } from "@/actions/user";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/utils";

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateMyProfileAction, initialActionState);

  return (
    <Card className="max-w-3xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
          <Input value={user.email} disabled dir="ltr" aria-readonly />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">الاسم</label>
          <Input name="name" defaultValue={user.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            كلمة المرور الجديدة
          </label>
          <Input
            name="password"
            type="password"
            dir="ltr"
            placeholder="اتركها فارغة إذا لا تريد التغيير"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">تأكيد كلمة المرور</label>
          <Input name="confirmPassword" type="password" dir="ltr" placeholder="أعد كتابة كلمة المرور" />
        </div>
        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : "حفظ الملف الشخصي"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
