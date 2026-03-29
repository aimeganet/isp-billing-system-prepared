"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MessageSquare,
  Package,
  RefreshCw,
  ScrollText,
  Settings,
  Shield,
  Upload,
  UserRoundPlus,
  UserRound,
  Users,
  Wallet,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

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

type SidebarLink = {
  href: string;
  label: string;
  icon: SidebarIconKey;
};

type SidebarClientProps = {
  links: SidebarLink[];
};

const iconMap = {
  dashboard: LayoutDashboard,
  subscribers: Users,
  transactions: Wallet,
  invoices: FileText,
  imports: Upload,
  messages: MessageSquare,
  reports: FileText,
  sync: RefreshCw,
  users: Shield,
  roles: LockKeyhole,
  permissions: KeyRound,
  employees: UserRoundPlus,
  wallets: Shield,
  audit: ScrollText,
  settings: Settings,
  profile: UserRound,
  assistant: Bot
} satisfies Record<SidebarIconKey, ComponentType<{ className?: string }>>;

export function SidebarClient({ links }: SidebarClientProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasLinks = links.length > 0;
  const navLinks = useMemo(() => links, [links]);

  const renderLink = (item: SidebarLink, compact: boolean, isMobile = false) => {
    const Icon = iconMap[item.icon];
    const active =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

    return (
      <Link
        key={`${isMobile ? "mobile" : "desktop"}-${item.href}`}
        href={item.href}
        title={compact ? item.label : undefined}
        onClick={() => {
          if (isMobile) setMobileOpen(false);
        }}
        className={cn(
          "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition",
          compact ? "justify-center" : "gap-3",
          active
            ? "bg-slate-950 text-white"
            : "text-slate-700 hover:bg-slate-100"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500")} />
        <span className={compact ? "sr-only" : "truncate"}>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <button
        type="button"
        className="fixed right-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="فتح القائمة الجانبية"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="إغلاق القائمة"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-72 border-l border-slate-200 bg-white p-5 shadow-xl transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">ISP Billing</div>
            <div className="text-sm font-semibold text-slate-900">القائمة الرئيسية</div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق القائمة الجانبية"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1 overflow-y-auto">
          {hasLinks ? navLinks.map((item) => renderLink(item, false, true)) : null}
        </nav>
      </aside>

      <aside
        className={cn(
          "hidden shrink-0 border-l border-slate-200 bg-white p-4 lg:flex lg:flex-col lg:transition-all",
          collapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className={collapsed ? "sr-only" : ""}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              ISP Billing
            </div>
            <h1 className="text-base font-bold text-slate-900">نظام المشتركين والمحاسبة</h1>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
            title={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <nav className="space-y-1 overflow-y-auto">
          {hasLinks ? navLinks.map((item) => renderLink(item, collapsed)) : null}
        </nav>

        {!collapsed ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Package className="h-4 w-4" />
              وضع التشغيل
            </div>
            <p className="text-sm text-slate-600">
              البيانات تحفظ محليًا أولًا ويمكن مزامنتها لاحقًا مع الخادم البعيد.
            </p>
          </div>
        ) : null}
      </aside>
    </>
  );
}
