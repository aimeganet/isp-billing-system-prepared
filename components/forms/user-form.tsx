"use client";

import { UserRoleKey } from "@prisma/client";
import { useActionState } from "react";
import { createUserAction, updateUserAction } from "@/actions/admin";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { initialActionState } from "@/lib/utils";

type UserFormProps = {
  roles: Array<{ id: string; name: string; key: string }>;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRoleKey;
    active: boolean;
    roleIds: string[];
  };
};

export function UserForm({ roles, user }: UserFormProps) {
  const action = user ? updateUserAction : createUserAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-5xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        {user ? <input type="hidden" name="userId" value={user.id} /> : null}
        <div>
          <label className="mb-2 block text-sm font-medium">الاسم</label>
          <Input name="name" defaultValue={user?.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">البريد الإلكتروني</label>
          <Input name="email" type="email" dir="ltr" defaultValue={user?.email} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">كلمة المرور</label>
          <Input name="password" type="password" dir="ltr" placeholder={user ? "اتركها فارغة بدون تغيير" : "كلمة مرور أولية"} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الدور الأساسي</label>
          <Select name="role" defaultValue={user?.role ?? "SUPERVISOR"}>
            <option value="ADMIN">مدير</option>
            <option value="SUPERVISOR">مشرف</option>
            <option value="EMPLOYEE">موظف</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox name="active" defaultChecked={user ? user.active : true} />
            المستخدم نشط
          </label>
        </div>
        <div className="md:col-span-2 space-y-3">
          <div className="text-sm font-medium">الأدوار المرتبطة بالمستخدم</div>
          <div className="grid gap-2 md:grid-cols-3">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <Checkbox
                  name="roleIds"
                  value={role.id}
                  defaultChecked={user ? user.roleIds.includes(role.id) : false}
                />
                <span>{role.name}</span>
                <span className="text-xs text-slate-400">({role.key})</span>
              </label>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : user ? "حفظ المستخدم" : "إضافة مستخدم"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
