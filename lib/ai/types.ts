export type AiProvider = "openai" | "deepseek" | "gemini";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type AssistantChatState = {
  success: boolean;
  message: string;
  conversation: AssistantMessage[];
};
