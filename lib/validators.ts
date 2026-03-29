import { z } from "zod";
import { MessageChannel, SubscriberStatus, TransactionMethodType, TransactionType, UserRoleKey } from "@prisma/client";

export const subscriberSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().optional(),
  usePhoneAsCode: z.boolean().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(SubscriberStatus).optional()
});

export const employeeSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  slug: z.string().min(2, "الرمز مطلوب"),
  roleLabel: z.string().min(2, "الدور مطلوب"),
  active: z.boolean().optional()
});

export const walletSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  code: z.string().min(2, "الكود مطلوب"),
  requiresScreenshot: z.boolean().optional(),
  active: z.boolean().optional()
});

export const packageSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  gigabytes: z.coerce.number().positive(),
  durationDays: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  active: z.boolean().optional()
});

export const transactionSchema = z.object({
  subscriberId: z.string().min(1, "اختر المشترك"),
  packagePlanId: z.string().optional(),
  type: z.nativeEnum(TransactionType),
  amount: z.coerce.number().positive("المبلغ أكبر من صفر"),
  methodType: z.nativeEnum(TransactionMethodType),
  employeeId: z.string().optional(),
  walletProviderId: z.string().optional(),
  notes: z.string().optional(),
  extraMode: z.string().optional()
});

export const messageTemplateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  channel: z.nativeEnum(MessageChannel),
  eventKey: z.string().min(2),
  content: z.string().min(4),
  active: z.boolean().optional()
});

export const settingsSchema = z.object({
  usePhoneAsIdentifier: z.boolean().optional(),
  autoSendInvoices: z.boolean().optional(),
  allowManualSend: z.boolean().optional(),
  requireScreenshotForWallets: z.boolean().optional(),
  defaultMessageChannel: z.nativeEnum(MessageChannel),
  defaultSubscriptionDays: z.coerce.number().int().positive(),
  enableSync: z.boolean().optional(),
  mockMessageDelivery: z.boolean().optional()
});

export const userSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional().or(z.literal("")),
  role: z.nativeEnum(UserRoleKey),
  active: z.boolean().optional(),
  roleIds: z.array(z.string()).optional()
});

export const roleSchema = z.object({
  name: z.string().min(2, "اسم الدور مطلوب"),
  key: z.string().min(2, "مفتاح الدور مطلوب"),
  description: z.string().optional(),
  active: z.boolean().optional(),
  permissionIds: z.array(z.string()).optional()
});

export const permissionSchema = z.object({
  name: z.string().min(2, "اسم الصلاحية مطلوب"),
  key: z.string().min(2, "مفتاح الصلاحية مطلوب"),
  description: z.string().optional(),
  active: z.boolean().optional()
});


export const subscriberContactSchema = z.object({
  subscriberId: z.string().min(1, "المشترك مطلوب"),
  label: z.string().optional(),
  phone: z.string().min(6, "رقم الهاتف مطلوب"),
  whatsappEnabled: z.boolean().optional(),
  telegramEnabled: z.boolean().optional(),
  isPrimary: z.boolean().optional()
});
