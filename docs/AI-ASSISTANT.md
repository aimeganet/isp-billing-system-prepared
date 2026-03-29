# AI Assistant Integration

## Added Features

- New AI settings page: `/settings/ai`
- Floating assistant chat available from all authenticated pages
- Dedicated assistant page: `/assistant`
- Server-side AI actions in `actions/ai.ts`
- AI runtime and context builder in `lib/ai/index.ts`

## Settings Keys Stored in `SystemSetting`

- `aiEnabled` (`true` / `false`)
- `aiProvider` (`openai` / `deepseek` / `gemini`)
- `aiModel` (string)
- `aiApiKey` (string)

## Security Model

- Assistant responses respect RBAC permissions.
- Financial responses require financial/reporting permissions.
- Subscriber and transaction data require their corresponding read permissions.
- Unauthorized questions are rejected with a clear message.

## Supported Providers

- OpenAI (Chat Completions API)
- DeepSeek (OpenAI-compatible API)
- Google Gemini (Generate Content API)

## Notes

- If no API key is configured or AI is disabled, predefined local answers still work for supported questions.
- Network/API connectivity can be validated from `/settings/ai` using `اختبار الاتصال`.
