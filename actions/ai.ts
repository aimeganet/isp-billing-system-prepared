"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";
import { saveSetting } from "@/lib/settings";
import { ActionState } from "@/lib/utils";
import {
  generateAssistantReply,
  getDefaultModel,
  normalizeAiProvider,
  testAiConnection
} from "@/lib/ai";
import type { AssistantChatState } from "@/lib/ai/types";

export async function saveAiSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.SETTINGS_UPDATE, "/dashboard");

  const provider = normalizeAiProvider(String(formData.get("provider") ?? "openai"));
  const model = String(formData.get("model") ?? "").trim() || getDefaultModel(provider);
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const enabled = formData.get("enabled") === "on";
  const intent = String(formData.get("_intent") ?? "save");

  if (intent === "test") {
    try {
      const result = await testAiConnection({ provider, model, apiKey });
      return {
        success: true,
        message: `تم اختبار الاتصال بنجاح. الرد: ${result.slice(0, 120)}`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "فشل اختبار الاتصال."
      };
    }
  }

  if (enabled && !apiKey) {
    return {
      success: false,
      message: "لا يمكن تفعيل المساعد بدون API Key."
    };
  }

  await Promise.all([
    saveSetting("aiEnabled", String(enabled)),
    saveSetting("aiProvider", provider),
    saveSetting("aiModel", model),
    saveSetting("aiApiKey", apiKey)
  ]);

  await recordAudit("UPDATE", "systemSetting", "ai", {
    aiEnabled: enabled,
    aiProvider: provider,
    aiModel: model,
    hasApiKey: Boolean(apiKey)
  });

  revalidatePath("/settings");
  revalidatePath("/settings/ai");

  return {
    success: true,
    message: "تم حفظ إعدادات الذكاء الاصطناعي."
  };
}

export async function askAssistantAction(
  prevState: AssistantChatState,
  formData: FormData
): Promise<AssistantChatState> {
  const user = await requireUser();
  const question = String(formData.get("question") ?? "").trim();

  if (!question) {
    return {
      ...prevState,
      success: false,
      message: "اكتب سؤالك أولًا."
    };
  }

  const history = prevState.conversation ?? [];
  const reply = await generateAssistantReply({
    user,
    question,
    history
  });

  const now = new Date().toISOString();
  const nextConversation = [
    ...history,
    { role: "user" as const, content: question, timestamp: now },
    { role: "assistant" as const, content: reply, timestamp: new Date().toISOString() }
  ].slice(-20);

  return {
    success: true,
    message: "",
    conversation: nextConversation
  };
}
