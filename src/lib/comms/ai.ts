import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";

export type AiRewriteTone = "urgent" | "warm" | "concise" | "motivational" | "reminder";

function toneInstruction(tone: AiRewriteTone): string {
  switch (tone) {
    case "urgent":
      return "Rewrite to be direct and time-sensitive (still respectful).";
    case "warm":
      return "Rewrite in a warm, human, neighborly tone.";
    case "concise":
      return "Rewrite to be short and scannable; remove filler.";
    case "motivational":
      return "Rewrite to inspire action and participation.";
    case "reminder":
      return "Rewrite as a gentle reminder with one clear ask.";
    default:
      return "";
  }
}

export async function draftOutboundMessage(params: {
  channel: "SMS" | "EMAIL";
  threadSummary: string;
  goal?: string;
}): Promise<{ text: string } | { error: string }> {
  if (!isOpenAIConfigured()) return { error: "OpenAI is not configured (OPENAI_API_KEY)." };
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const goal = params.goal?.trim() || "Follow up helpfully with one clear next step.";
  const sys =
    params.channel === "SMS"
      ? "You draft SMS for a political campaign. Max ~320 characters. No markdown. No emojis unless essential."
      : "You draft short campaign staff emails. Plain text or light structure. Professional, human, on-message.";

  const res = await client.chat.completions.create({
    model,
    temperature: 0.5,
    messages: [
      { role: "system", content: sys },
      {
        role: "user",
        content: `Context / thread notes:\n${params.threadSummary}\n\nGoal: ${goal}\n\nWrite the message body only.`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  if (!text) return { error: "OpenAI returned empty text." };
  return { text };
}

export async function rewriteMessage(params: {
  body: string;
  tone: AiRewriteTone;
}): Promise<{ text: string } | { error: string }> {
  if (!isOpenAIConfigured()) return { error: "OpenAI is not configured (OPENAI_API_KEY)." };
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const res = await client.chat.completions.create({
    model,
    temperature: 0.45,
    messages: [
      {
        role: "system",
        content: "You rewrite outreach copy for campaign staff. Output only the rewritten message body. No quotes or preamble.",
      },
      {
        role: "user",
        content: `${toneInstruction(params.tone)}\n\n---\n${params.body}\n---`,
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  if (!text) return { error: "OpenAI returned empty text." };
  return { text };
}

export async function summarizeThreadForPrompt(params: {
  lines: string[];
}): Promise<string> {
  if (!params.lines.length) return "(no messages yet)";
  return params.lines.slice(-24).join("\n");
}

/**
 * Triage view: short summary + a single next step for staff (stored on the thread for the right rail).
 */
export async function generateThreadSummaryAndNextAction(params: {
  lines: string[];
}): Promise<{ summary: string; nextAction: string } | { error: string }> {
  if (!params.lines.length) return { error: "No messages in thread yet." };
  if (!isOpenAIConfigured()) return { error: "OpenAI is not configured (OPENAI_API_KEY)." };
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const text = params.lines.slice(-32).join("\n---\n");
  const res = await client.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You help U.S. campaign staff triage one-to-one voter/volunteer message threads. Reply with a single JSON object only: {\"summary\":\"...\",\"nextAction\":\"...\"}. summary: at most 2 short sentences. nextAction: one short imperative for staff (e.g. \"Call to confirm event RSVP\"). No markdown, no code fences.",
      },
      { role: "user", content: `Messages (oldest to newest):\n${text}` },
    ],
  });
  const raw = res.choices[0]?.message?.content?.trim() ?? "";
  const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/i, "");
  try {
    const j = JSON.parse(cleaned) as { summary?: string; nextAction?: string };
    const summary = j.summary?.trim();
    const nextAction = j.nextAction?.trim();
    if (!summary || !nextAction) return { error: "Model returned an incomplete result." };
    return { summary, nextAction };
  } catch {
    return { error: "Could not parse AI result." };
  }
}
