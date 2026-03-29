"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/utils";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState);

  return (
    <Card className="w-full max-w-md p-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">البريد الإلكتروني</label>
          <Input name="email" type="email" dir="ltr" placeholder="admin@local.test" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">كلمة المرور</label>
          <Input name="password" type="password" dir="ltr" placeholder="••••••••" />
        </div>
        <StatusMessage success={state.success} message={state.message} />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "جارٍ تسجيل الدخول..." : "دخول"}
        </Button>
      </form>
    </Card>
  );
}
