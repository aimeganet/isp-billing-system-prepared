import { logoutAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const user = await getCurrentUser();

  if (!user) return null;

  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-slate-900">مرحبًا {user.name}</h2>
          <p className="text-sm text-slate-500">
            هذه النسخة جاهزة للعمل محليًا، ومعمارية المشروع مهيأة للنشر وربط المزامنة مستقبلاً.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <div className="font-medium text-slate-900">{user.role}</div>
            <div dir="ltr">{user.email}</div>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">تسجيل الخروج</Button>
          </form>
        </div>
      </div>
    </header>
  );
}
