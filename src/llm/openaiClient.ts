import {
  OPENAI_API_KEY,
  OPENAI_API_URL,
  OPENAI_MODEL,
} from "../config/env.js";
import type { ChatCompletionRequest, ChatCompletionResponse, LlmMessage } from "./types";

function getConfig() {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing VITE_OPENAI_API_KEY. Add it to your environment.");
  }
  if (!OPENAI_API_URL) {
    throw new Error("Missing VITE_OPENAI_API_URL. Add it to your environment.");
  }
  return {
    apiKey: OPENAI_API_KEY,
    apiUrl: OPENAI_API_URL.replace(/\/$/, ""),
    model: OPENAI_MODEL || "openai/gpt-4o-mini",
  };
}

export async function complete(messages: LlmMessage[]): Promise<string> {
  const { apiKey, apiUrl, model } = getConfig();

  const body: ChatCompletionRequest = { model, messages };

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    const message = data.error?.message || `OpenRouter request failed (${response.status})`;
    throw new Error(message);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  return content;
}
