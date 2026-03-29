"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Minimize2 } from "lucide-react";
import { ChatWindow } from "@/components/assistant/chat-window";
import { Button } from "@/components/ui/button";

export function FloatingAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  if (pathname === "/login" || pathname === "/assistant") {
    return null;
  }

  const showPanel = open && !minimized;

  return (
    <>
      {showPanel ? (
        <div className="fixed bottom-24 right-4 z-50 sm:right-6">
          <div className="mb-2 flex justify-end">
            <Button type="button" variant="secondary" className="h-9 px-3" onClick={() => setMinimized(true)}>
              <Minimize2 className="ml-1 h-4 w-4" />
              تصغير
            </Button>
          </div>
          <ChatWindow onClose={() => setOpen(false)} />
        </div>
      ) : null}

      {open && minimized ? (
        <button
          type="button"
          className="fixed bottom-24 right-4 z-50 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-50 sm:right-6"
          onClick={() => setMinimized(false)}
          aria-label="تكبير نافذة المساعد"
        >
          فتح المساعد
        </button>
      ) : null}

      <button
        type="button"
        className="fixed bottom-6 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 sm:right-6"
        onClick={() => {
          setOpen((current) => !current);
          setMinimized(false);
        }}
        aria-label="فتح المساعد الذكي"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
