import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  RefreshCw,
  Settings,
  Shield,
  Upload,
  UserRoundPlus,
  Users,
  Wallet,
  KeyRound,
  ScrollText,
  LockKeyhole
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermissionFromUser, PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export async function Sidebar() {
  const user = await getCurrentUser();

  const links = [
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
    { href: "/subscribers", label: "المشتركون", icon: Users, permission: PERMISSIONS.SUBSCRIBERS_READ },
    { href: "/transactions", label: "العمليات", icon: Wallet, permission: PERMISSIONS.TRANSACTIONS_READ },
    { href: "/invoices", label: "الفواتير", icon: FileText, permission: PERMISSIONS.INVOICES_READ },
    { href: "/imports", label: "الاستيراد", icon: Upload, permission: PERMISSIONS.IMPORTS_READ },
    { href: "/messaging/templates", label: "الرسائل", icon: MessageSquare, permission: PERMISSIONS.TEMPLATES_MANAGE },
    { href: "/reports", label: "التقارير", icon: FileText, permission: PERMISSIONS.REPORTS_READ },
    { href: "/sync", label: "المزامنة", icon: RefreshCw, permission: PERMISSIONS.SYNC_READ },
    { href: "/admin/users", label: "المستخدمون", icon: Shield, permission: PERMISSIONS.USERS_READ },
    { href: "/admin/roles", label: "الأدوار", icon: LockKeyhole, permission: PERMISSIONS.ROLES_READ },
    { href: "/admin/permissions", label: "الصلاحيات", icon: KeyRound, permission: PERMISSIONS.ROLES_READ },
    { href: "/admin/employees", label: "الموظفون", icon: UserRoundPlus, permission: PERMISSIONS.EMPLOYEES_MANAGE },
    { href: "/admin/wallets", label: "المحافظ", icon: Shield, permission: PERMISSIONS.WALLETS_MANAGE },
    { href: "/admin/audit", label: "سجل المراجعة", icon: ScrollText, permission: PERMISSIONS.AUDIT_READ },
    { href: "/settings", label: "الإعدادات", icon: Settings, permission: PERMISSIONS.SETTINGS_READ }
  ].filter((item) => hasPermissionFromUser(user, item.permission));

  return (
    <aside className="hidden w-72 shrink-0 border-l border-slate-200 bg-white p-6 lg:block">
      <div className="mb-8">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          ISP Billing
        </div>
        <h1 className="text-xl font-bold text-slate-900">نظام المشتركين والمحاسبة</h1>
        <p className="mt-2 text-sm text-slate-500">نسخة محلية قابلة للمزامنة مع خادم أونلاين.</p>
      </div>
      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10 rounded-2xl bg-slate-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Package className="h-4 w-4" />
          وضع التشغيل
        </div>
        <p className="text-sm text-slate-600">
          البيانات تحفظ محليًا أولًا، ويمكن دفعها إلى قاعدة بيانات أونلاين عند تفعيل المزامنة.
        </p>
      </div>
    </aside>
  );
}
