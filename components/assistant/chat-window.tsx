"use client";

import { FormEvent, useActionState, useEffect, useRef } from "react";
import { askAssistantAction } from "@/actions/ai";
import type { AssistantChatState } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialAssistantState: AssistantChatState = {
  success: true,
  message: "",
  conversation: [
    {
      role: "assistant",
      content:
        "مرحبًا، أنا مساعدك داخل النظام. اسألني عن المشتركين، الفواتير، العمليات، أو الإيرادات حسب صلاحيات حسابك.",
      timestamp: new Date(0).toISOString()
    }
  ]
};

type ChatWindowProps = {
  className?: string;
  onClose?: () => void;
};

export function ChatWindow({ className, onClose }: ChatWindowProps) {
  const [state, formAction, pending] = useActionState(askAssistantAction, initialAssistantState);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [state.conversation.length]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const input = inputRef.current;
    const value = input?.value.trim() ?? "";
    if (!value) {
      event.preventDefault();
      return;
    }
    setTimeout(() => {
      if (input) {
        input.value = "";
        input.focus();
      }
    }, 0);
  };

  return (
    <section
      className={cn("flex h-[32rem] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-lg", className)}
      aria-label="محادثة المساعد الذكي"
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">المساعد الذكي</h3>
          <p className="text-xs text-slate-500">أسئلة تشغيلية سريعة مع مراعاة الصلاحيات</p>
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" className="h-8 px-2" onClick={onClose}>
            إغلاق
          </Button>
        ) : null}
      </header>

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4"
        aria-live="polite"
      >
        {state.conversation.map((item, index) => (
          <div
            key={`${item.role}-${item.timestamp}-${index}`}
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
              item.role === "assistant"
                ? "mr-auto bg-white text-slate-800 shadow-sm"
                : "ml-auto bg-slate-950 text-white"
            )}
          >
            <p className="whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
      </div>

      <form action={formAction} onSubmit={onSubmit} className="space-y-3 border-t border-slate-200 p-4">
        <Textarea
          ref={inputRef}
          name="question"
          placeholder="اكتب سؤالك هنا..."
          className="min-h-24"
          aria-label="سؤال للمساعد"
        />
        {state.message ? (
          <div
            className={cn(
              "rounded-xl px-3 py-2 text-sm",
              state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {state.message}
          </div>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "جارٍ التفكير..." : "إرسال"}
        </Button>
      </form>
    </section>
  );
}
