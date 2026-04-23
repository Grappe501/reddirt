import type OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ASSISTANT_TOOL_DEFINITIONS, executeAssistantTool } from "@/lib/assistant/tools";
import {
  ASSISTANT_DATA_GOVERNANCE_SUPPLEMENT,
  ASSISTANT_TIGHTENING_SUPPLEMENT,
  ASSISTANT_TOOLS_SYSTEM_SUPPLEMENT,
  ASSISTANT_V2_CONVERSATION_SUPPLEMENT,
  ASSISTANT_V3_SUPPLEMENT,
  type AssistantResponseStyle,
  assistantResponseStylePrompt,
  RAG_ANSWER_SYSTEM_PROMPT,
} from "@/lib/openai/prompts";

const MAX_TOOL_ROUNDS = 6;

export type RunCampaignAssistantOptions = {
  /** Prior turns present in user payload — enables v2 follow-up instructions. */
  hasConversationHistory?: boolean;
  /** v3: length / shape hint. */
  responseStyle?: AssistantResponseStyle;
};

function buildSystemPrompt(options?: RunCampaignAssistantOptions): string {
  const v2 = options?.hasConversationHistory
    ? `\n\n${ASSISTANT_V2_CONVERSATION_SUPPLEMENT}`
    : "";
  const style = `\n\n${assistantResponseStylePrompt(options?.responseStyle)}`;
  return `${RAG_ANSWER_SYSTEM_PROMPT}\n\n${ASSISTANT_TOOLS_SYSTEM_SUPPLEMENT}\n\n${ASSISTANT_V3_SUPPLEMENT}\n\n${ASSISTANT_TIGHTENING_SUPPLEMENT}\n\n${ASSISTANT_DATA_GOVERNANCE_SUPPLEMENT}${v2}${style}`;
}

/**
 * Single user turn with optional tool loop (OpenAI function calling), then final natural-language reply.
 */
export async function runCampaignAssistantCompletion(
  client: OpenAI,
  model: string,
  userContent: string,
  options?: RunCampaignAssistantOptions,
): Promise<{ reply: string; toolCallsUsed: string[] }> {
  const systemPrompt = buildSystemPrompt(options);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];
  const toolCallsUsed: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.28,
      max_tokens: 720,
      messages,
      tools: ASSISTANT_TOOL_DEFINITIONS,
      tool_choice: "auto",
    });

    const msg = completion.choices[0]?.message;
    if (!msg) break;

    if (msg.tool_calls?.length) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        if (tc.type !== "function") continue;
        const fn = tc.function;
        toolCallsUsed.push(fn.name);
        const result = executeAssistantTool(fn.name, fn.arguments ?? "{}");
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }
      continue;
    }

    const reply = msg.content?.trim() ?? "";
    return { reply, toolCallsUsed };
  }

  return {
    reply:
      "I couldn’t quite finish that—try a shorter question, browse the menu, or email kelly@kellygrappe.com for a human.",
    toolCallsUsed,
  };
}
