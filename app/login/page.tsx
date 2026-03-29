import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Card className="hidden border-blue-100 bg-white/80 lg:block">
          <div className="space-y-5">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">ISP BILLING</div>
            <h1 className="text-3xl font-bold leading-tight text-slate-900">
              نظام محاسبة وإدارة مشتركي الإنترنت
            </h1>
            <p className="text-slate-600">
              منصة تشغيل يومية لإدارة المشتركين والعمليات والفواتير مع صلاحيات دقيقة ومزامنة مرنة.
            </p>
            <div className="grid gap-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                إدارة كاملة للمستخدمين والأدوار والصلاحيات
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                تتبع المعاملات والفواتير وتدقيق السجل التشغيلي
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                مساعد ذكي مدمج للاستعلام السريع عن بيانات النظام
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <div className="text-center lg:text-right">
            <div className="mb-2 text-sm font-semibold tracking-[0.25em] text-slate-400">ISP BILLING</div>
            <h2 className="text-3xl font-bold text-slate-900">تسجيل الدخول</h2>
            <p className="mt-2 text-sm text-slate-500">
              أدخل بيانات الحساب للانتقال إلى لوحة التحكم.
            </p>
          </div>
          <LoginForm />
          <Card className="border-slate-200 bg-white/90 p-4">
            <p className="text-sm font-semibold text-slate-800">بيانات المدير الافتراضية</p>
            <p className="mt-2 text-sm text-slate-600">
              البريد: <span dir="ltr" className="font-medium text-slate-800">admin@local.test</span>
            </p>
            <p className="text-sm text-slate-600">
              كلمة المرور: <span dir="ltr" className="font-medium text-slate-800">ChangeMe123!</span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
