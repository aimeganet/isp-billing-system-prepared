"use client";

import { SubscriberStatus } from "@prisma/client";
import { useActionState } from "react";
import { createSubscriberAction, updateSubscriberAction } from "@/actions/subscribers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils";
import { StatusMessage } from "@/components/shared/status-message";

type SubscriberFormProps = {
  allowPhoneAsCode: boolean;
  subscriber?: {
    id: string;
    name: string;
    phone: string | null;
    notes: string | null;
    status: SubscriberStatus;
  };
};

export function SubscriberForm({ allowPhoneAsCode, subscriber }: SubscriberFormProps) {
  const action = subscriber ? updateSubscriberAction : createSubscriberAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-3xl">
      <form action={formAction} className="space-y-4">
        {subscriber ? <input type="hidden" name="subscriberId" value={subscriber.id} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">اسم المشترك</label>
            <Input name="name" defaultValue={subscriber?.name} placeholder="مثال: محمد أحمد" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">رقم الهاتف</label>
            <Input
              name="phone"
              defaultValue={subscriber?.phone ?? ""}
              placeholder="01000000000"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">الحالة</label>
            <Select name="status" defaultValue={subscriber?.status ?? "ACTIVE"}>
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
              <option value="SUSPENDED">موقوف</option>
            </Select>
          </div>
          {allowPhoneAsCode && !subscriber ? (
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 text-sm text-slate-600">
                <Checkbox name="usePhoneAsCode" />
                استخدام رقم الهاتف كمعرف ظاهر للمشترك
              </label>
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">ملاحظات</label>
          <Textarea
            name="notes"
            defaultValue={subscriber?.notes ?? ""}
            placeholder="أي ملاحظات تخص المشترك"
          />
        </div>

        <StatusMessage success={state.success} message={state.message} />

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : subscriber ? "حفظ التعديلات" : "إضافة مشترك"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
