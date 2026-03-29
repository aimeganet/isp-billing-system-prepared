"use client";

import { useActionState } from "react";
import { createEmployeeAction, updateEmployeeAction } from "@/actions/admin";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/utils";

export function EmployeeForm({
  employee
}: {
  employee?: { id: string; name: string; slug: string; roleLabel: string; active: boolean };
}) {
  const action = employee ? updateEmployeeAction : createEmployeeAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-3xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-3">
        {employee ? <input type="hidden" name="employeeId" value={employee.id} /> : null}
        <div>
          <label className="mb-2 block text-sm font-medium">الاسم</label>
          <Input name="name" placeholder="اسم الموظف" defaultValue={employee?.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الرمز</label>
          <Input name="slug" placeholder="slug" dir="ltr" defaultValue={employee?.slug} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الوصف الوظيفي</label>
          <Input name="roleLabel" placeholder="Supervisor / Collector" defaultValue={employee?.roleLabel} />
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox name="active" defaultChecked={employee ? employee.active : true} />
            الموظف نشط
          </label>
        </div>
        <div className="md:col-span-3">
          <StatusMessage success={state.success} message={state.message} />
        </div>
        <div className="md:col-span-3">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : employee ? "حفظ الموظف" : "إضافة موظف"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
