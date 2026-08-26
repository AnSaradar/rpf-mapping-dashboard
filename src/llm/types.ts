export type LlmRole = "system" | "user" | "assistant";

export interface LlmMessage {
  role: LlmRole;
  content: string;
}

export interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: LlmMessage[];
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}
