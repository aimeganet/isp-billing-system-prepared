"use server";

import { SubscriberStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateSubscriberCode } from "@/lib/ids";
import { enqueueSync } from "@/lib/sync";
import { ActionState, normalizePhone } from "@/lib/utils";
import { subscriberContactSchema, subscriberSchema } from "@/lib/validators";
import { getBooleanSetting } from "@/lib/settings";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

async function syncPrimaryContactAndSubscriberPhone(subscriberId: string) {
  const contacts = await prisma.subscriberContact.findMany({
    where: { subscriberId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }]
  });

  const primary = contacts.find((item) => item.isPrimary) ?? contacts[0] ?? null;

  if (primary && !primary.isPrimary) {
    await prisma.subscriberContact.update({
      where: { id: primary.id },
      data: { isPrimary: true }
    });
  }

  await prisma.subscriber.update({
    where: { id: subscriberId },
    data: { phone: primary?.phone ?? null }
  });

  return primary;
}

export async function createSubscriberAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_CREATE, "/dashboard");
  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    usePhoneAsCode: formData.get("usePhoneAsCode") === "on",
    notes: String(formData.get("notes") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE")
  };

  const parsed = subscriberSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "تحقق من البيانات المدخلة.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const usePhoneSetting = await getBooleanSetting("usePhoneAsIdentifier", false);
  const usePhone = usePhoneSetting && parsed.data.usePhoneAsCode;
  const normalizedPhone = normalizePhone(parsed.data.phone);

  const subscriber = await prisma.subscriber.create({
    data: {
      subscriberCode: await generateSubscriberCode(normalizedPhone, usePhone),
      externalIdentifier: usePhone ? normalizedPhone : null,
      name: parsed.data.name,
      phone: normalizedPhone || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status ?? SubscriberStatus.ACTIVE,
      contacts: normalizedPhone
        ? {
            create: {
              phone: normalizedPhone,
              label: "الأساسي",
              isPrimary: true
            }
          }
        : undefined
    }
  });

  await enqueueSync("subscriber", subscriber.id, "UPSERT", subscriber);

  const contacts = await prisma.subscriberContact.findMany({
    where: { subscriberId: subscriber.id }
  });

  for (const contact of contacts) {
    await enqueueSync("subscriberContact", contact.id, "UPSERT", contact);
  }

  await recordAudit("CREATE", "subscriber", subscriber.id, parsed.data);
  revalidatePath("/subscribers");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `تم إضافة المشترك ${subscriber.name} بنجاح.`
  };
}

export async function updateSubscriberAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_UPDATE, "/dashboard");
  const subscriberId = String(formData.get("subscriberId") ?? "");
  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE")
  };

  const parsed = subscriberSchema.omit({ usePhoneAsCode: true }).safeParse(raw);

  if (!parsed.success || !subscriberId) {
    return {
      success: false,
      message: "فشل تحديث المشترك.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  const phone = normalizePhone(parsed.data.phone);

  const subscriber = await prisma.subscriber.update({
    where: { id: subscriberId },
    data: {
      name: parsed.data.name,
      phone: phone || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status ?? SubscriberStatus.ACTIVE
    }
  });

  const primaryContact = await prisma.subscriberContact.findFirst({
    where: {
      subscriberId,
      isPrimary: true
    }
  });

  if (phone) {
    if (primaryContact) {
      const updatedPrimaryContact = await prisma.subscriberContact.update({
        where: { id: primaryContact.id },
        data: { phone }
      });
      await enqueueSync("subscriberContact", updatedPrimaryContact.id, "UPSERT", updatedPrimaryContact);
    } else {
      const contact = await prisma.subscriberContact.create({
        data: {
          subscriberId,
          phone,
          label: "الأساسي",
          isPrimary: true
        }
      });
      await enqueueSync("subscriberContact", contact.id, "UPSERT", contact);
    }
  }

  await syncPrimaryContactAndSubscriberPhone(subscriberId);
  await enqueueSync("subscriber", subscriber.id, "UPSERT", subscriber);
  await recordAudit("UPDATE", "subscriber", subscriber.id, parsed.data);
  revalidatePath("/subscribers");
  revalidatePath(`/subscribers/${subscriber.id}`);

  return {
    success: true,
    message: "تم حفظ تحديثات المشترك بنجاح."
  };
}

export async function deleteSubscriberAction(formData: FormData) {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_DELETE, "/dashboard");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.subscriber.delete({ where: { id } });
  await enqueueSync("subscriber", id, "DELETE", { id });
  await recordAudit("DELETE", "subscriber", id, { id });
  revalidatePath("/subscribers");
  revalidatePath("/dashboard");
}

export async function createSubscriberContactAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_UPDATE, "/subscribers");

  const raw = {
    subscriberId: String(formData.get("subscriberId") ?? ""),
    label: String(formData.get("label") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsappEnabled: formData.get("whatsappEnabled") === "on",
    telegramEnabled: formData.get("telegramEnabled") === "on",
    isPrimary: formData.get("isPrimary") === "on"
  };

  const parsed = subscriberContactSchema.safeParse({
    ...raw,
    phone: normalizePhone(raw.phone)
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "تحقق من بيانات جهة الاتصال.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: parsed.data.subscriberId },
    select: { id: true, name: true }
  });

  if (!subscriber) {
    return { success: false, message: "المشترك غير موجود." };
  }

  let contactId = "";

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isPrimary) {
      await tx.subscriberContact.updateMany({
        where: { subscriberId: parsed.data.subscriberId },
        data: { isPrimary: false }
      });
    }

    const contact = await tx.subscriberContact.create({
      data: {
        subscriberId: parsed.data.subscriberId,
        label: parsed.data.label || null,
        phone: parsed.data.phone,
        whatsappEnabled: parsed.data.whatsappEnabled ?? true,
        telegramEnabled: parsed.data.telegramEnabled ?? false,
        isPrimary: parsed.data.isPrimary ?? false
      }
    });

    contactId = contact.id;
  });

  const contact = await prisma.subscriberContact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return { success: false, message: "تعذر إنشاء جهة الاتصال." };
  }

  const primary = await syncPrimaryContactAndSubscriberPhone(parsed.data.subscriberId);
  await enqueueSync("subscriberContact", contact.id, "UPSERT", contact);
  if (primary && primary.id !== contact.id) {
    await enqueueSync("subscriberContact", primary.id, "UPSERT", primary);
  }
  const subscriberSnapshot = await prisma.subscriber.findUnique({ where: { id: parsed.data.subscriberId } });
  if (subscriberSnapshot) {
    await enqueueSync("subscriber", subscriberSnapshot.id, "UPSERT", subscriberSnapshot);
  }
  await recordAudit("CREATE", "subscriberContact", contact.id, parsed.data);
  revalidatePath(`/subscribers/${parsed.data.subscriberId}`);

  return {
    success: true,
    message: `تمت إضافة جهة اتصال للمشترك ${subscriber.name}.`
  };
}

export async function updateSubscriberContactAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_UPDATE, "/subscribers");

  const contactId = String(formData.get("contactId") ?? "");
  const raw = {
    subscriberId: String(formData.get("subscriberId") ?? ""),
    label: String(formData.get("label") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsappEnabled: formData.get("whatsappEnabled") === "on",
    telegramEnabled: formData.get("telegramEnabled") === "on",
    isPrimary: formData.get("isPrimary") === "on"
  };

  const parsed = subscriberContactSchema.safeParse({
    ...raw,
    phone: normalizePhone(raw.phone)
  });

  if (!contactId || !parsed.success) {
    return {
      success: false,
      message: "فشل تعديل جهة الاتصال.",
      errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors
    };
  }

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isPrimary) {
      await tx.subscriberContact.updateMany({
        where: { subscriberId: parsed.data.subscriberId },
        data: { isPrimary: false }
      });
    }

    await tx.subscriberContact.update({
      where: { id: contactId },
      data: {
        label: parsed.data.label || null,
        phone: parsed.data.phone,
        whatsappEnabled: parsed.data.whatsappEnabled ?? true,
        telegramEnabled: parsed.data.telegramEnabled ?? false,
        isPrimary: parsed.data.isPrimary ?? false
      }
    });
  });

  const contact = await prisma.subscriberContact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return { success: false, message: "تعذر حفظ جهة الاتصال." };
  }

  const primary = await syncPrimaryContactAndSubscriberPhone(parsed.data.subscriberId);
  await enqueueSync("subscriberContact", contact.id, "UPSERT", contact);
  if (primary && primary.id !== contact.id) {
    await enqueueSync("subscriberContact", primary.id, "UPSERT", primary);
  }
  const subscriberSnapshot = await prisma.subscriber.findUnique({ where: { id: parsed.data.subscriberId } });
  if (subscriberSnapshot) {
    await enqueueSync("subscriber", subscriberSnapshot.id, "UPSERT", subscriberSnapshot);
  }
  await recordAudit("UPDATE", "subscriberContact", contact.id, parsed.data);
  revalidatePath(`/subscribers/${parsed.data.subscriberId}`);
  revalidatePath(`/subscribers/${parsed.data.subscriberId}/contacts/${contactId}`);

  return {
    success: true,
    message: "تم حفظ تعديلات جهة الاتصال."
  };
}

export async function deleteSubscriberContactAction(formData: FormData) {
  await requirePermission(PERMISSIONS.SUBSCRIBERS_UPDATE, "/subscribers");

  const id = String(formData.get("id") ?? "");
  const subscriberId = String(formData.get("subscriberId") ?? "");
  if (!id || !subscriberId) return;

  await prisma.subscriberContact.delete({ where: { id } });
  const primary = await syncPrimaryContactAndSubscriberPhone(subscriberId);
  await enqueueSync("subscriberContact", id, "DELETE", { id });
  if (primary) {
    await enqueueSync("subscriberContact", primary.id, "UPSERT", primary);
  }
  const subscriberSnapshot = await prisma.subscriber.findUnique({ where: { id: subscriberId } });
  if (subscriberSnapshot) {
    await enqueueSync("subscriber", subscriberSnapshot.id, "UPSERT", subscriberSnapshot);
  }
  await recordAudit("DELETE", "subscriberContact", id, { id, subscriberId });
  revalidatePath(`/subscribers/${subscriberId}`);
}
