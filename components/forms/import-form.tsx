"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createImportPreviewAction } from "@/actions/imports";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ImportFormState = {
  success: boolean;
  message: string;
  meta?: {
    importJobId: string;
  };
};

const initialImportState: ImportFormState = {
  success: false,
  message: ""
};

export function ImportForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createImportPreviewAction, initialImportState);

  useEffect(() => {
    if (state.success && state.meta?.importJobId) {
      router.push(`/imports/${state.meta.importJobId}`);
    }
  }, [router, state]);

  return (
    <Card className="max-w-4xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">اختر الملف</label>
          <Input name="file" type="file" accept=".pdf,.doc,.docx,image/*,.txt" className="pt-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">وضع الاستيراد</label>
          <Select name="mode" defaultValue="UPDATE_EXISTING">
            <option value="UPDATE_EXISTING">تحديث الموجودين فقط</option>
            <option value="BULK_CREATE">إضافة غير الموجودين أيضًا</option>
          </Select>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
          بعد الرفع سيتم استخراج الصفوف وعرض شاشة مراجعة قبل تطبيق البيانات على قاعدة المشتركين.
        </div>

        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ تجهيز المعاينة..." : "رفع الملف وتجهيز المعاينة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
