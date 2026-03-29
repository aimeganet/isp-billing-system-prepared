"use client";

import { useActionState } from "react";
import {
  createSubscriberContactAction,
  updateSubscriberContactAction
} from "@/actions/subscribers";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/utils";

type SubscriberContactFormProps = {
  subscriberId: string;
  subscriberName: string;
  contact?: {
    id: string;
    label: string | null;
    phone: string;
    whatsappEnabled: boolean;
    telegramEnabled: boolean;
    isPrimary: boolean;
  };
};

export function SubscriberContactForm({
  subscriberId,
  subscriberName,
  contact
}: SubscriberContactFormProps) {
  const action = contact ? updateSubscriberContactAction : createSubscriberContactAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-3xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="subscriberId" value={subscriberId} />
        {contact ? <input type="hidden" name="contactId" value={contact.id} /> : null}

        <div className="md:col-span-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          المشترك: <span className="font-semibold text-slate-900">{subscriberName}</span>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">الوصف</label>
          <Input name="label" placeholder="مثال: الأساسي / الواتساب / احتياطي" defaultValue={contact?.label ?? ""} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">رقم الهاتف</label>
          <Input name="phone" placeholder="01000000000" dir="ltr" defaultValue={contact?.phone ?? ""} />
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-600">
          <Checkbox name="whatsappEnabled" defaultChecked={contact ? contact.whatsappEnabled : true} />
          يستخدم لواتساب
        </label>

        <label className="flex items-center gap-3 text-sm text-slate-600">
          <Checkbox name="telegramEnabled" defaultChecked={contact ? contact.telegramEnabled : false} />
          يستخدم لتيليجرام
        </label>

        <label className="flex items-center gap-3 text-sm text-slate-600 md:col-span-2">
          <Checkbox name="isPrimary" defaultChecked={contact ? contact.isPrimary : false} />
          اجعل هذه الجهة هي الأساسية للفواتير والرسائل
        </label>

        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : contact ? "حفظ جهة الاتصال" : "إضافة جهة اتصال"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
