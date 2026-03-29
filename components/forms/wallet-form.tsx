"use client";

import { useActionState } from "react";
import { createWalletProviderAction, updateWalletProviderAction } from "@/actions/admin";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/utils";

export function WalletForm({
  wallet
}: {
  wallet?: { id: string; name: string; code: string; requiresScreenshot: boolean; active: boolean };
}) {
  const action = wallet ? updateWalletProviderAction : createWalletProviderAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <Card className="max-w-3xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-3">
        {wallet ? <input type="hidden" name="walletId" value={wallet.id} /> : null}
        <div>
          <label className="mb-2 block text-sm font-medium">اسم المحفظة</label>
          <Input name="name" placeholder="Vodafone Cash" defaultValue={wallet?.name} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">الكود</label>
          <Input name="code" placeholder="vodafone-cash" dir="ltr" defaultValue={wallet?.code} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox name="requiresScreenshot" defaultChecked={wallet ? wallet.requiresScreenshot : true} />
            تتطلب صورة إثبات
          </label>
        </div>
        <div className="md:col-span-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox name="active" defaultChecked={wallet ? wallet.active : true} />
            المحفظة نشطة
          </label>
        </div>
        <div className="md:col-span-3">
          <StatusMessage success={state.success} message={state.message} />
        </div>
        <div className="md:col-span-3">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ الحفظ..." : wallet ? "حفظ المحفظة" : "إضافة محفظة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
