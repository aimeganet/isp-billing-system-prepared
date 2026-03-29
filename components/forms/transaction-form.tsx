"use client";

import { useActionState, useState } from "react";
import { createTransactionAction } from "@/actions/transactions";
import { StatusMessage } from "@/components/shared/status-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils";

type LookupItem = { id: string; name: string };

type PackageItem = { id: string; name: string; gigabytes: number; price: number };

type SubscriberItem = { id: string; name: string; subscriberCode: string };

type TransactionFormProps = {
  subscribers: SubscriberItem[];
  employees: LookupItem[];
  wallets: LookupItem[];
  packages: PackageItem[];
};

export function TransactionForm({
  subscribers,
  employees,
  wallets,
  packages
}: TransactionFormProps) {
  const [state, formAction, pending] = useActionState(createTransactionAction, initialActionState);
  const [methodType, setMethodType] = useState("EMPLOYEE");
  const [transactionType, setTransactionType] = useState("RENEWAL");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [amount, setAmount] = useState("");


  return (
    <Card className="max-w-5xl">
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">المشترك</label>
          <Select name="subscriberId" defaultValue="">
            <option value="" disabled>
              اختر المشترك
            </option>
            {subscribers.map((subscriber) => (
              <option key={subscriber.id} value={subscriber.id}>
                {subscriber.name} — {subscriber.subscriberCode}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">نوع العملية</label>
          <Select
            name="type"
            value={transactionType}
            onChange={(event) => setTransactionType(event.target.value)}
          >
            <option value="ACTIVATION">تفعيل</option>
            <option value="RENEWAL">تجديد</option>
            <option value="DEPOSIT">إيداع</option>
            <option value="EXTRA_PACKAGE">إضافة ميجات</option>
            <option value="EXTRA_PACKAGE_RESET">إضافة ميجات مع Reset</option>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">الباقة</label>
          <Select
            name="packagePlanId"
            value={selectedPackageId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedPackageId(nextId);
              const pkg = packages.find((item) => item.id === nextId);
              if (pkg) setAmount(String(pkg.price));
            }}
          >
            <option value="">اختياري</option>
            {packages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.gigabytes}GB — {item.price} EGP
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">المبلغ</label>
          <Input
            name="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">طريقة التنفيذ</label>
          <Select
            name="methodType"
            value={methodType}
            onChange={(event) => setMethodType(event.target.value)}
          >
            <option value="EMPLOYEE">موظف / مشرف</option>
            <option value="WALLET">محفظة إلكترونية</option>
          </Select>
        </div>

        {methodType === "EMPLOYEE" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">الموظف</label>
            <Select name="employeeId" defaultValue="">
              <option value="" disabled>
                اختر الموظف
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium">المحفظة</label>
            <Select name="walletProviderId" defaultValue="">
              <option value="" disabled>
                اختر المحفظة
              </option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {(transactionType === "EXTRA_PACKAGE" || transactionType === "EXTRA_PACKAGE_RESET") ? (
          <div>
            <label className="mb-2 block text-sm font-medium">وضع الإضافة</label>
            <Select
              name="extraMode"
              defaultValue={transactionType === "EXTRA_PACKAGE_RESET" ? "EXTRA_RESET" : "EXTRA_ONLY"}
            >
              <option value="EXTRA_ONLY">إضافة فقط</option>
              <option value="EXTRA_RESET">إضافة مع تصفير الدورة</option>
            </Select>
          </div>
        ) : null}

        {methodType === "WALLET" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">صورة إثبات التحويل</label>
            <Input name="screenshot" type="file" accept="image/*,.pdf" className="pt-2" />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">ملاحظات</label>
          <Textarea
            name="notes"
            placeholder="يمكن كتابة ملاحظات مثل عدد الإضافات أو رسالة داخلية"
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
          سيتم حساب الصافي والمستبعد تلقائيًا. عند اختيار محفظة إلكترونية يمكنك إرفاق صورة التحويل، وعند اختيار باقة إضافية مع Reset يبدأ الشهر الجديد من وقت الإضافة.
        </div>

        <div className="md:col-span-2">
          <StatusMessage success={state.success} message={state.message} />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "جارٍ تسجيل العملية..." : "حفظ العملية وإنشاء فاتورة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
