import { ChatWindow } from "@/components/assistant/chat-window";
import { PageHeading } from "@/components/shared/page-heading";
import { requireUser } from "@/lib/auth";

export default async function AssistantPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <PageHeading
        title="المساعد الشخصي"
        description="محادثة مباشرة مع مساعد النظام لفهم الأرقام والحالة التشغيلية بسرعة."
      />
      <ChatWindow className="h-[38rem] max-w-3xl" />
    </div>
  );
}
