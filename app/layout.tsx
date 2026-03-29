import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "ISP Billing System",
  description: "Local-first ISP billing and subscriber management system"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900">
        <AppShell sidebar={<Sidebar />} header={<Header />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
