import {
  getRandomChunks,
  getSocialDamascusContext,
  shouldLoadDamascusContext,
} from "./contextLoader";
import { complete } from "./openaiClient";
import type { LlmMessage } from "./types";

const RANDOM_CHUNK_COUNT = 3;

const SYSTEM_PROMPT_BASE = `You are a professional analyst for the Jobar city mapping dashboard.
The user will ask questions in Arabic.
Always answer in Arabic.

Write every response as a detailed professional report using Markdown formatting:
- Start with # عنوان التقرير (report title)
- Include ## ملخص تنفيذي (executive summary)
- Include ## التحليل with ### subsections for each relevant theme
- Include ## النتائج الرئيسية (key findings) as bullet points
- Include ## التوصيات (recommendations) when applicable
- End with ## الخاتمة (conclusion) when appropriate

Use clear section headers, structured paragraphs, and bullet lists.
Be thorough and analytical — include specific details, causes, impacts, and data from the context.
Answer ONLY using the provided context.
If the context does not contain enough information, state that clearly in Arabic within the report structure.`;

function buildSystemPrompt(
  chunks: string[],
  socialDamascusContext?: string,
): string {
  const contextSections: string[] = [];

  if (chunks.length > 0) {
    contextSections.push(`--- CONTEXT (Jobar) ---
${chunks.join("\n\n-----------------------------\n\n")}
--- END CONTEXT ---`);
  }

  if (socialDamascusContext) {
    contextSections.push(`--- CONTEXT (Damascus / Daraya — social & urban planning) ---
${socialDamascusContext}
--- END CONTEXT ---`);
  }

  const scopeNote = socialDamascusContext
    ? `Use the Damascus/Daraya context as the primary source for the user's question.
When relevant, end the report with a ## التوصيات section reflecting priority recommendations from the context (social factors, building codes, urban planning, community participation), written in clear professional Arabic.`
    : "Use only the Jobar context.";

  return `${SYSTEM_PROMPT_BASE}
${scopeNote}

${contextSections.join("\n\n")}`;
}

export async function sendChatMessage(userMessage: string): Promise<string> {
  const useDamascusContext = shouldLoadDamascusContext(userMessage);
  const chunks = useDamascusContext ? [] : await getRandomChunks(RANDOM_CHUNK_COUNT);
  const socialDamascusContext = useDamascusContext
    ? await getSocialDamascusContext()
    : undefined;
  const systemPrompt = buildSystemPrompt(chunks, socialDamascusContext);

  const messages: LlmMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];
  try {
    return await complete(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Could not get a response: ${message}`);
  }
}
