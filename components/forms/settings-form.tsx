"use client";

import { useActionState } from "react";
import { saveGeneralSettingsAction } from "@/actions/settings";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { initialActionState } from "@/lib/utils";

type SettingsFormProps = {
  values: Record<string, string>;
};

export function SettingsForm({ values }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveGeneralSettingsAction, initialActionState);

  return (
    <Card className="max-w-5xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 text-sm">
          <Checkbox
            name="usePhoneAsIdentifier"
            defaultChecked={values.usePhoneAsIdentifier === "true"}
          />
          استخدام رقم الهاتف كمعرف ظاهر عند اختيار ذلك
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox name="autoSendInvoices" defaultChecked={values.autoSendInvoices === "true"} />
          إرسال الفاتورة تلقائيًا عند الحفظ
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox name="allowManualSend" defaultChecked={values.allowManualSend === "true"} />
          السماح بالإرسال اليدوي
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox
            name="requireScreenshotForWallets"
            defaultChecked={values.requireScreenshotForWallets === "true"}
          />
          اشتراط صورة عند المحافظ الإلكترونية
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox name="enableSync" defaultChecked={values.enableSync === "true"} />
          تفعيل المزامنة مع الخادم
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox
            name="mockMessageDelivery"
            defaultChecked={values.mockMessageDelivery === "true"}
          />
          وضع محاكاة الرسائل محليًا
        </label>
        <div>
          <label className="mb-2 block text-sm font-medium">القناة الافتراضية</label>
          <Select name="defaultMessageChannel" defaultValue={values.defaultMessageChannel ?? "WHATSAPP"}>
            <option value="WHATSAPP">واتساب</option>
            <option value="TELEGRAM">تيليجرام</option>
            <option value="NONE">بدون</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">المدة الافتراضية باليوم</label>
          <Input
            name="defaultSubscriptionDays"
            type="number"
            defaultValue={values.defaultSubscriptionDays ?? "30"}
          />
        </div>
        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
