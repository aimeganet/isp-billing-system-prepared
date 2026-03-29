import { UserRoleKey } from "@prisma/client";
import { PERMISSIONS, hasPermissionFromUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSettingsMap } from "@/lib/settings";
import type { AiProvider, AssistantMessage } from "@/lib/ai/types";

type AssistantUser = {
  id: string;
  name: string;
  role: UserRoleKey;
  userRoles?: Array<{
    role: {
      active?: boolean;
      permissions?: Array<{
        permission: {
          key: string;
          active?: boolean;
        };
      }>;
    };
  }>;
};

type AiRuntimeConfig = {
  enabled: boolean;
  provider: AiProvider;
  model: string;
  apiKey: string;
};

const DEFAULT_MODELS: Record<AiProvider, string> = {
  openai: "gpt-4o-mini",
  deepseek: "deepseek-chat",
  gemini: "gemini-1.5-flash"
};

function toBoolean(value: string | undefined, fallback = false) {
  if (value == null) return fallback;
  return value === "true";
}

export function normalizeAiProvider(value: string): AiProvider {
  if (value === "deepseek") return "deepseek";
  if (value === "gemini") return "gemini";
  return "openai";
}

export function getDefaultModel(provider: AiProvider) {
  return DEFAULT_MODELS[provider];
}

function getProviderApiKey(provider: AiProvider, settings: Record<string, string>) {
  if (settings.aiApiKey) return settings.aiApiKey;
  if (provider === "deepseek") return process.env.DEEPSEEK_API_KEY ?? "";
  if (provider === "gemini") return process.env.GEMINI_API_KEY ?? "";
  return process.env.OPENAI_API_KEY ?? "";
}

export async function getAiRuntimeConfig(): Promise<AiRuntimeConfig> {
  const settings = await getSettingsMap();
  const provider = normalizeAiProvider(settings.aiProvider ?? "openai");
  const model = settings.aiModel?.trim() || getDefaultModel(provider);
  const apiKey = getProviderApiKey(provider, settings).trim();
  const enabled = toBoolean(settings.aiEnabled, false);

  return {
    enabled,
    provider,
    model,
    apiKey
  };
}

function canReadSubscribers(user: AssistantUser) {
  return hasPermissionFromUser(user, PERMISSIONS.SUBSCRIBERS_READ);
}

function canReadTransactions(user: AssistantUser) {
  return hasPermissionFromUser(user, PERMISSIONS.TRANSACTIONS_READ);
}

function canReadInvoices(user: AssistantUser) {
  return hasPermissionFromUser(user, PERMISSIONS.INVOICES_READ);
}

function canReadFinancials(user: AssistantUser) {
  return (
    hasPermissionFromUser(user, PERMISSIONS.REPORTS_READ) ||
    hasPermissionFromUser(user, PERMISSIONS.INVOICES_READ)
  );
}

export async function getSystemContext(user: AssistantUser) {
  const monthStart = new Date();
  monthStart.setHours(0, 0, 0, 0);
  monthStart.setDate(1);

  const context: {
    generatedAt: string;
    userRole: string;
    canViewFinancialData: boolean;
    subscribers?: {
      total: number;
      active: number;
      suspended: number;
    };
    financial?: {
      monthRevenue: number;
      invoicesNotSettled: number;
    };
    recentTransactions?: Array<{
      transactionNo: string;
      subscriberName: string;
      amount: number;
      occurredAt: string;
    }>;
  } = {
    generatedAt: new Date().toISOString(),
    userRole: user.role,
    canViewFinancialData: canReadFinancials(user)
  };

  if (canReadSubscribers(user)) {
    const [total, active, suspended] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { status: "ACTIVE" } }),
      prisma.subscriber.count({ where: { status: "SUSPENDED" } })
    ]);
    context.subscribers = { total, active, suspended };
  }

  if (canReadFinancials(user)) {
    const [monthRevenue, invoicesNotSettled] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { net: true },
        where: { occurredAt: { gte: monthStart } }
      }),
      prisma.invoice.count({
        where: { status: { in: ["DRAFT", "PUBLISHED", "FAILED"] } }
      })
    ]);

    context.financial = {
      monthRevenue: monthRevenue._sum.net ?? 0,
      invoicesNotSettled
    };
  }

  if (canReadTransactions(user)) {
    const transactions = await prisma.transaction.findMany({
      orderBy: { occurredAt: "desc" },
      include: { subscriber: { select: { name: true } } },
      take: 5
    });

    context.recentTransactions = transactions.map((transaction) => ({
      transactionNo: transaction.transactionNo,
      subscriberName: transaction.subscriber.name,
      amount: transaction.amount,
      occurredAt: transaction.occurredAt.toISOString()
    }));
  }

  return context;
}

function questionLooksFinancial(question: string) {
  const text = question.toLowerCase();
  const keywords = ["ايراد", "إيراد", "فواتير", "فاتورة", "مالي", "revenue", "invoice"];
  return keywords.some((keyword) => text.includes(keyword));
}

async function handlePredefinedQuestion(user: AssistantUser, question: string) {
  const text = question.trim().toLowerCase();
  const asksSubscribers =
    text.includes("عدد المشترك") || text.includes("كم مشترك") || text.includes("subscribers");
  const asksActiveSubscribers = text.includes("نشط") || text.includes("active");
  const asksMonthRevenue =
    text.includes("إجمالي الإيرادات هذا الشهر") ||
    text.includes("ايرادات هذا الشهر") ||
    text.includes("revenue this month");
  const asksDelayedInvoices =
    text.includes("المتأخرين عن السداد") ||
    text.includes("غير مدفوعة") ||
    text.includes("متأخرة") ||
    text.includes("overdue");
  const asksRecentTransactions =
    text.includes("آخر العمليات") || text.includes("اخر العمليات") || text.includes("recent transactions");

  if (asksActiveSubscribers || asksSubscribers) {
    if (!canReadSubscribers(user)) {
      return "لا تملك صلاحية الاطلاع على بيانات المشتركين.";
    }

    const [total, active] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { status: "ACTIVE" } })
    ]);

    if (asksActiveSubscribers) {
      return `عدد المشتركين النشطين حاليًا هو ${active} من أصل ${total} مشترك.`;
    }
    return `إجمالي عدد المشتركين المسجلين حاليًا هو ${total}.`;
  }

  if (asksMonthRevenue) {
    if (!canReadFinancials(user)) {
      return "لا تملك صلاحية عرض البيانات المالية.";
    }

    const monthStart = new Date();
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);

    const aggregate = await prisma.transaction.aggregate({
      _sum: { net: true },
      where: { occurredAt: { gte: monthStart } }
    });

    const revenue = aggregate._sum.net ?? 0;
    return `إجمالي الإيرادات (صافي العمليات) منذ بداية الشهر الحالي هو ${revenue.toFixed(2)} جنيه.`;
  }

  if (asksDelayedInvoices) {
    if (!canReadInvoices(user)) {
      return "لا تملك صلاحية عرض تفاصيل الفواتير.";
    }

    const delayed = await prisma.invoice.findMany({
      where: { status: { in: ["DRAFT", "PUBLISHED", "FAILED"] } },
      include: { subscriber: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    if (delayed.length === 0) {
      return "لا توجد فواتير متأخرة أو غير مكتملة حاليًا.";
    }

    const names = delayed.map((item) => item.subscriber.name);
    return `أبرز المشتركين ذوي فواتير غير مكتملة: ${Array.from(new Set(names)).join("، ")}.`;
  }

  if (asksRecentTransactions) {
    if (!canReadTransactions(user)) {
      return "لا تملك صلاحية الاطلاع على العمليات.";
    }

    const recent = await prisma.transaction.findMany({
      include: { subscriber: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 5
    });

    if (recent.length === 0) {
      return "لا توجد عمليات مسجلة حتى الآن.";
    }

    const lines = recent.map(
      (item) => `- ${item.transactionNo} | ${item.subscriber.name} | ${item.amount.toFixed(2)}`
    );
    return `آخر 5 عمليات:\n${lines.join("\n")}`;
  }

  return null;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAICompatibleModel(
  endpoint: string,
  config: AiRuntimeConfig,
  systemPrompt: string,
  question: string,
  history: AssistantMessage[]
) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: "user", content: question }
  ];

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages
      })
    },
    30000
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Model API error (${response.status}): ${errorText.slice(0, 400)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return payload.choices?.[0]?.message?.content?.trim() || "لم أتمكن من توليد رد مناسب.";
}

async function callGeminiModel(
  config: AiRuntimeConfig,
  systemPrompt: string,
  question: string,
  history: AssistantMessage[]
) {
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${encodeURIComponent(
      config.apiKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          ...history.map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }]
          })),
          { role: "user", parts: [{ text: question }] }
        ]
      })
    },
    30000
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText.slice(0, 400)}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n");
  return text?.trim() || "لم أتمكن من توليد رد مناسب.";
}

function buildSystemPrompt(context: unknown, user: AssistantUser) {
  return [
    "أنت مساعد ذكي داخل نظام محاسبة وإدارة مشتركين للإنترنت.",
    "أجب باختصار وبدقة باللغة العربية، ويمكنك استخدام الإنجليزية إذا كان السؤال كذلك.",
    "لا تذكر أي بيانات لا يسمح بها المستخدم. إذا كانت المعلومة مالية والمستخدم غير مخول، ارفض بلطف.",
    `هوية المستخدم الحالية: ${user.name} (${user.role})`,
    `سياق النظام الحالي (JSON): ${JSON.stringify(context)}`
  ].join("\n");
}

export async function testAiConnection(config: {
  provider: AiProvider;
  model: string;
  apiKey: string;
}) {
  const runtime: AiRuntimeConfig = {
    enabled: true,
    provider: config.provider,
    model: config.model.trim() || getDefaultModel(config.provider),
    apiKey: config.apiKey.trim()
  };

  if (!runtime.apiKey) {
    throw new Error("API Key مطلوب لاختبار الاتصال.");
  }

  const testPrompt = "أعد فقط كلمة OK.";

  if (runtime.provider === "gemini") {
    return callGeminiModel(runtime, "Respond with OK only.", testPrompt, []);
  }

  const endpoint =
    runtime.provider === "deepseek"
      ? "https://api.deepseek.com/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

  return callOpenAICompatibleModel(endpoint, runtime, "Respond with OK only.", testPrompt, []);
}

export async function generateAssistantReply(options: {
  user: AssistantUser;
  question: string;
  history: AssistantMessage[];
}) {
  const question = options.question.trim();
  if (!question) {
    return "اكتب سؤالك أولًا وسأساعدك مباشرة.";
  }

  if (questionLooksFinancial(question) && !canReadFinancials(options.user)) {
    return "لا أستطيع مشاركة بيانات مالية مع هذا الحساب لعدم توفر الصلاحية المطلوبة.";
  }

  const localAnswer = await handlePredefinedQuestion(options.user, question);
  if (localAnswer) {
    return localAnswer;
  }

  const config = await getAiRuntimeConfig();
  if (!config.enabled) {
    return "المساعد الذكي غير مفعّل حاليًا. فعّل الخدمة من إعدادات الذكاء الاصطناعي.";
  }

  if (!config.apiKey) {
    return "لم يتم ضبط مفتاح API بعد. أضفه من صفحة إعدادات الذكاء الاصطناعي.";
  }

  const context = await getSystemContext(options.user);
  const systemPrompt = buildSystemPrompt(context, options.user);
  const history = options.history.slice(-6);

  try {
    if (config.provider === "gemini") {
      return await callGeminiModel(config, systemPrompt, question, history);
    }

    const endpoint =
      config.provider === "deepseek"
        ? "https://api.deepseek.com/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

    return await callOpenAICompatibleModel(endpoint, config, systemPrompt, question, history);
  } catch (error) {
    return error instanceof Error
      ? `تعذر الاتصال بمزود الذكاء الاصطناعي: ${error.message}`
      : "تعذر الحصول على رد من مزود الذكاء الاصطناعي.";
  }
}
