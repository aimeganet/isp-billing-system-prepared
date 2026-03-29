"use client";

import { useActionState } from "react";
import { saveAiSettingsAction } from "@/actions/ai";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { initialActionState } from "@/lib/utils";

type AiSettingsFormProps = {
  values: {
    enabled: boolean;
    provider: "openai" | "deepseek" | "gemini";
    model: string;
    apiKey: string;
  };
};

export function AiSettingsForm({ values }: AiSettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveAiSettingsAction, initialActionState);

  return (
    <Card className="max-w-4xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">مزود الذكاء الاصطناعي</label>
          <Select name="provider" defaultValue={values.provider}>
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
            <option value="gemini">Google Gemini</option>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">الموديل</label>
          <Input name="model" defaultValue={values.model} dir="ltr" placeholder="gpt-4o-mini" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">API Key</label>
          <Input
            name="apiKey"
            type="password"
            dir="ltr"
            defaultValue={values.apiKey}
            placeholder="sk-... or other key"
          />
          <p className="mt-2 text-xs text-slate-500">
            يتم حفظ المفتاح داخل إعدادات النظام لاستخدامه من طرف الخادم فقط.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 text-sm">
            <Checkbox name="enabled" defaultChecked={values.enabled} />
            تفعيل المساعد الذكي داخل النظام
          </label>
        </div>

        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button type="submit" name="_intent" value="save" disabled={pending}>
            {pending ? "جارٍ التنفيذ..." : "حفظ الإعدادات"}
          </Button>
          <Button type="submit" name="_intent" value="test" variant="secondary" disabled={pending}>
            {pending ? "جارٍ الاختبار..." : "اختبار الاتصال"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
