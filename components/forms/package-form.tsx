"use client";

import { useActionState } from "react";
import { createPackagePlanAction, updatePackagePlanAction } from "@/actions/admin";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/utils";

export function PackageForm({
  plan
}: {
  plan?: {
    id: string;
    name: string;
    code: string;
    gigabytes: number;
    durationDays: number;
    price: number;
    active: boolean;
  };
}) {
  const action = plan ? updatePackagePlanAction : createPackagePlanAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-5xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-5">
        {plan ? <input type="hidden" name="packageId" value={plan.id} /> : null}
        <div>
          <label className="mb-2 block text-sm font-medium">اسم الباقة</label>
          <Input name="name" placeholder="5 جيجا" defaultValue={plan?.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الكود</label>
          <Input name="code" placeholder="P5" defaultValue={plan?.code} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الجيجات</label>
          <Input name="gigabytes" type="number" step="0.1" defaultValue={plan?.gigabytes ?? undefined} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الأيام</label>
          <Input name="durationDays" type="number" defaultValue={plan?.durationDays ?? 30} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">السعر</label>
          <Input name="price" type="number" step="0.01" defaultValue={plan?.price ?? undefined} />
        </div>
        <div className="md:col-span-5">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox name="active" defaultChecked={plan ? plan.active : true} />
            الباقة نشطة
          </label>
        </div>
        <div className="md:col-span-5">
          <StatusMessage success={state.success} message={state.message} />
        </div>
        <div className="md:col-span-5">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : plan ? "حفظ الباقة" : "إضافة باقة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
