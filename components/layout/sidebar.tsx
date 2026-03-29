import { getCurrentUser } from "@/lib/auth";
import { hasPermissionFromUser, PERMISSIONS } from "@/lib/permissions";
import { SidebarClient } from "@/components/layout/sidebar-client";

type SidebarIconKey =
  | "dashboard"
  | "subscribers"
  | "transactions"
  | "invoices"
  | "imports"
  | "messages"
  | "reports"
  | "sync"
  | "users"
  | "roles"
  | "permissions"
  | "employees"
  | "wallets"
  | "audit"
  | "settings"
  | "profile"
  | "assistant";

export async function Sidebar() {
  const user = await getCurrentUser();

  const links: Array<{
    href: string;
    label: string;
    icon: SidebarIconKey;
    permission?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
  }> = [
    { href: "/dashboard", label: "لوحة التحكم", icon: "dashboard", permission: PERMISSIONS.DASHBOARD_VIEW },
    { href: "/subscribers", label: "المشتركون", icon: "subscribers", permission: PERMISSIONS.SUBSCRIBERS_READ },
    { href: "/transactions", label: "العمليات", icon: "transactions", permission: PERMISSIONS.TRANSACTIONS_READ },
    { href: "/invoices", label: "الفواتير", icon: "invoices", permission: PERMISSIONS.INVOICES_READ },
    { href: "/imports", label: "الاستيراد", icon: "imports", permission: PERMISSIONS.IMPORTS_READ },
    { href: "/messaging/templates", label: "الرسائل", icon: "messages", permission: PERMISSIONS.TEMPLATES_MANAGE },
    { href: "/reports", label: "التقارير", icon: "reports", permission: PERMISSIONS.REPORTS_READ },
    { href: "/sync", label: "المزامنة", icon: "sync", permission: PERMISSIONS.SYNC_READ },
    { href: "/assistant", label: "المساعد الذكي", icon: "assistant", permission: PERMISSIONS.DASHBOARD_VIEW },
    { href: "/profile", label: "الملف الشخصي", icon: "profile", permission: PERMISSIONS.DASHBOARD_VIEW },
    { href: "/admin/users", label: "المستخدمون", icon: "users", permission: PERMISSIONS.USERS_READ },
    { href: "/admin/roles", label: "الأدوار", icon: "roles", permission: PERMISSIONS.ROLES_READ },
    { href: "/admin/permissions", label: "الصلاحيات", icon: "permissions", permission: PERMISSIONS.ROLES_READ },
    { href: "/admin/employees", label: "الموظفون", icon: "employees", permission: PERMISSIONS.EMPLOYEES_MANAGE },
    { href: "/admin/wallets", label: "المحافظ", icon: "wallets", permission: PERMISSIONS.WALLETS_MANAGE },
    { href: "/admin/audit", label: "سجل المراجعة", icon: "audit", permission: PERMISSIONS.AUDIT_READ },
    { href: "/settings", label: "الإعدادات", icon: "settings", permission: PERMISSIONS.SETTINGS_READ }
  ];

  const allowedLinks = links.filter((item) => {
    if (!item.permission) return true;
    return hasPermissionFromUser(user, item.permission);
  });

  return <SidebarClient links={allowedLinks} />;
}
