"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type SubscribersSearchInputProps = {
  initialQuery: string;
};

export function SubscribersSearchInput({ initialQuery }: SubscribersSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const value = query.trim();
      const next = value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname;
      router.replace(next);
    }, 350);

    return () => clearTimeout(timeout);
  }, [pathname, query, router]);

  return (
    <div className="max-w-xl">
      <label className="mb-2 block text-sm font-medium text-slate-700">بحث سريع</label>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ابحث بالاسم أو رقم الهاتف أو كود المشترك..."
        aria-label="بحث في المشتركين"
      />
    </div>
  );
}
