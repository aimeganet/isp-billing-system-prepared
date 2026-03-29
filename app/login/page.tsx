import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-5 text-center">
        <div>
          <div className="mb-2 text-sm font-semibold tracking-[0.25em] text-slate-400">ISP BILLING</div>
          <h1 className="text-3xl font-bold text-slate-900">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-slate-500">
            استخدم حساب المدير أو المشرف للوصول إلى النظام المحلي وإدارته.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
