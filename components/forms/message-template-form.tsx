"use client";

import { MessageChannel } from "@prisma/client";
import { useActionState } from "react";
import { createMessageTemplateAction, updateMessageTemplateAction } from "@/actions/settings";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils";

export function MessageTemplateForm({
  template
}: {
  template?: {
    id: string;
    name: string;
    slug: string;
    channel: MessageChannel;
    eventKey: string;
    content: string;
    active: boolean;
  };
}) {
  const action = template ? updateMessageTemplateAction : createMessageTemplateAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-5xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        {template ? <input type="hidden" name="templateId" value={template.id} /> : null}
        <div>
          <label className="mb-2 block text-sm font-medium">اسم القالب</label>
          <Input name="name" placeholder="رسالة فاتورة" defaultValue={template?.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Slug</label>
          <Input name="slug" placeholder="invoice-generic-whatsapp" dir="ltr" defaultValue={template?.slug} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">القناة</label>
          <Select name="channel" defaultValue={template?.channel ?? "WHATSAPP"}>
            <option value="WHATSAPP">واتساب</option>
            <option value="TELEGRAM">تيليجرام</option>
            <option value="NONE">بدون</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">نوع الحدث</label>
          <Input name="eventKey" placeholder="invoice.renewal" dir="ltr" defaultValue={template?.eventKey} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">المحتوى</label>
          <Textarea
            name="content"
            defaultValue={template?.content}
            placeholder="مرحبًا {name}، تم إصدار فاتورة بقيمة {amount} جنيه..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox name="active" defaultChecked={template ? template.active : true} />
            القالب نشط
          </label>
        </div>
        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : template ? "حفظ القالب" : "إضافة قالب"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
