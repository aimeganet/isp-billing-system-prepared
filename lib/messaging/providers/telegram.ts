export async function sendTelegramMessage(phone: string, content: string) {
  const mock = process.env.MOCK_MESSAGE_DELIVERY === "true";
  if (mock || !process.env.TELEGRAM_CHAT_API_URL || !process.env.TELEGRAM_BOT_TOKEN) {
    return {
      ok: true,
      providerRef: `mock-tg-${Date.now()}`,
      response: { phone, content }
    };
  }

  const response = await fetch(process.env.TELEGRAM_CHAT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TELEGRAM_BOT_TOKEN}`
    },
    body: JSON.stringify({ phone, content })
  });

  const payload = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    providerRef: payload.id ?? null,
    response: payload
  };
}
