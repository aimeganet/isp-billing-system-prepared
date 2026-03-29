"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveSetting } from "@/lib/settings";
import { ActionState } from "@/lib/utils";
import { messageTemplateSchema, settingsSchema } from "@/lib/validators";
import { enqueueSync } from "@/lib/sync";
import { sendInvoiceMessage } from "@/lib/messaging/dispatcher";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";

export async function saveGeneralSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.SETTINGS_UPDATE, "/dashboard");
  const raw = {
    usePhoneAsIdentifier: formData.get("usePhoneAsIdentifier") === "on",
    autoSendInvoices: formData.get("autoSendInvoices") === "on",
    allowManualSend: formData.get("allowManualSend") === "on",
    requireScreenshotForWallets: formData.get("requireScreenshotForWallets") === "on",
    defaultMessageChannel: String(formData.get("defaultMessageChannel") ?? "WHATSAPP"),
    defaultSubscriptionDays: String(formData.get("defaultSubscriptionDays") ?? "30"),
    enableSync: formData.get("enableSync") === "on",
    mockMessageDelivery: formData.get("mockMessageDelivery") === "on"
  };

  const parsed = settingsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "فشل حفظ الإعدادات.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  await Promise.all([
    saveSetting("usePhoneAsIdentifier", String(parsed.data.usePhoneAsIdentifier ?? false)),
    saveSetting("autoSendInvoices", String(parsed.data.autoSendInvoices ?? false)),
    saveSetting("allowManualSend", String(parsed.data.allowManualSend ?? false)),
    saveSetting("requireScreenshotForWallets", String(parsed.data.requireScreenshotForWallets ?? false)),
    saveSetting("defaultMessageChannel", parsed.data.defaultMessageChannel),
    saveSetting("defaultSubscriptionDays", String(parsed.data.defaultSubscriptionDays)),
    saveSetting("enableSync", String(parsed.data.enableSync ?? false)),
    saveSetting("mockMessageDelivery", String(parsed.data.mockMessageDelivery ?? false))
  ]);

  await recordAudit("UPDATE", "systemSetting", "general", parsed.data);
  revalidatePath("/settings");
  return { success: true, message: "تم حفظ الإعدادات." };
}

export async function createMessageTemplateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.TEMPLATES_MANAGE, "/dashboard");
  const raw = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    channel: String(formData.get("channel") ?? "WHATSAPP"),
    eventKey: String(formData.get("eventKey") ?? ""),
    content: String(formData.get("content") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = messageTemplateSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "فشل حفظ القالب.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const template = await prisma.messageTemplate.create({ data: parsed.data });
  await enqueueSync("messageTemplate", template.id, "UPSERT", template);
  await recordAudit("CREATE", "messageTemplate", template.id, parsed.data);
  revalidatePath("/messaging/templates");

  return { success: true, message: "تمت إضافة القالب." };
}

export async function updateMessageTemplateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.TEMPLATES_MANAGE, "/dashboard");
  const templateId = String(formData.get("templateId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    channel: String(formData.get("channel") ?? "WHATSAPP"),
    eventKey: String(formData.get("eventKey") ?? ""),
    content: String(formData.get("content") ?? ""),
    active: formData.get("active") === "on"
  };

  const parsed = messageTemplateSchema.safeParse(raw);

  if (!templateId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل القالب.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const template = await prisma.messageTemplate.update({
    where: { id: templateId },
    data: parsed.data
  });

  await enqueueSync("messageTemplate", template.id, "UPSERT", template);
  await recordAudit("UPDATE", "messageTemplate", template.id, parsed.data);
  revalidatePath("/messaging/templates");
  revalidatePath(`/messaging/templates/${template.id}`);

  return { success: true, message: "تم حفظ تعديلات القالب." };
}

export async function deleteMessageTemplateAction(formData: FormData) {
  await requirePermission(PERMISSIONS.TEMPLATES_MANAGE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.messageTemplate.delete({ where: { id } });
  await enqueueSync("messageTemplate", id, "DELETE", { id });
  await recordAudit("DELETE", "messageTemplate", id, { id });
  revalidatePath("/messaging/templates");
}

export async function sendInvoiceNowAction(formData: FormData) {
  await requirePermission(PERMISSIONS.INVOICES_SEND, "/dashboard");
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) return;
  await sendInvoiceMessage(invoiceId);
  await recordAudit("SEND", "invoice", invoiceId, { invoiceId });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
