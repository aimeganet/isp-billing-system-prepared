"use client";

import { useActionState } from "react";
import { createRoleAction, updateRoleAction } from "@/actions/admin";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils";

export function RoleForm({
  permissions,
  role
}: {
  permissions: Array<{ id: string; key: string; name: string }>;
  role?: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    active: boolean;
    isSystem: boolean;
    permissionIds: string[];
  };
}) {
  const action = role ? updateRoleAction : createRoleAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-6xl">
      <form action={formAction} className="space-y-4">
        {role ? <input type="hidden" name="roleId" value={role.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">اسم الدور</label>
            <Input name="name" defaultValue={role?.name} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">المفتاح</label>
            <Input name="key" dir="ltr" defaultValue={role?.key} disabled={role?.isSystem} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الوصف</label>
          <Textarea name="description" defaultValue={role?.description ?? ""} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox name="active" defaultChecked={role ? role.active : true} />
          الدور نشط
        </label>
        <div className="space-y-2">
          <div className="text-sm font-medium">الصلاحيات</div>
          <div className="grid gap-2 md:grid-cols-3">
            {permissions.map((permission) => (
              <label key={permission.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <Checkbox
                  name="permissionIds"
                  value={permission.id}
                  defaultChecked={role ? role.permissionIds.includes(permission.id) : false}
                />
                <span>{permission.name}</span>
                <span className="text-xs text-slate-400">({permission.key})</span>
              </label>
            ))}
          </div>
        </div>
        <StatusMessage success={state.success} message={state.message} />
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ..." : role ? "حفظ الدور" : "إضافة دور"}
        </Button>
      </form>
    </Card>
  );
}
