"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function AppShell({
  children,
  sidebar,
  header
}: {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen lg:flex">
      {sidebar}
      <main className="min-w-0 flex-1 p-4 lg:p-8">
        {header}
        {children}
      </main>
    </div>
  );
}
