import Link from "next/link";
import { AiSettingsForm } from "@/components/forms/ai-settings-form";
import { PageHeading } from "@/components/shared/page-heading";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { getSettingsMap } from "@/lib/settings";
import { normalizeAiProvider, getDefaultModel } from "@/lib/ai";

export default async function AiSettingsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_UPDATE, "/dashboard");
  const settings = await getSettingsMap();
  const provider = normalizeAiProvider(settings.aiProvider ?? "openai");

  return (
    <div className="space-y-6">
      <PageHeading
        title="إعدادات الذكاء الاصطناعي"
        description="إدارة مزود المساعد الذكي، المفتاح، واختبار الاتصال قبل التفعيل."
        action={
          <Link href="/settings" className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700">
            العودة للإعدادات
          </Link>
        }
      />
      <AiSettingsForm
        values={{
          enabled: settings.aiEnabled === "true",
          provider,
          model: settings.aiModel || getDefaultModel(provider),
          apiKey: settings.aiApiKey || ""
        }}
      />
    </div>
  );
}
