"use client";

import { useActionState } from "react";
import { createPermissionAction, updatePermissionAction } from "@/actions/admin";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils";

export function PermissionForm({
  permission
}: {
  permission?: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    active: boolean;
    isSystem: boolean;
  };
}) {
  const action = permission ? updatePermissionAction : createPermissionAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-4xl">
      <form action={formAction} className="space-y-4">
        {permission ? <input type="hidden" name="permissionId" value={permission.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">اسم الصلاحية</label>
            <Input name="name" defaultValue={permission?.name} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">المفتاح</label>
            <Input name="key" dir="ltr" defaultValue={permission?.key} disabled={permission?.isSystem} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الوصف</label>
          <Textarea name="description" defaultValue={permission?.description ?? ""} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox name="active" defaultChecked={permission ? permission.active : true} />
          الصلاحية نشطة
        </label>
        <StatusMessage success={state.success} message={state.message} />
        <Button type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ..." : permission ? "حفظ الصلاحية" : "إضافة صلاحية"}
        </Button>
      </form>
    </Card>
  );
}
