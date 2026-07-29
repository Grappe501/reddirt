import "server-only";

import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { evidenceAiToolsFor } from "@/lib/campaign-media/evidence-ai-tool-defs";
import { executeEvidenceAiTool } from "@/lib/campaign-media/evidence-ai-tool-runtime";
import type { EvidenceAiSuggestion } from "@/lib/campaign-media/evidence-ai-types";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";

const SYSTEM = `You are the Evidence Workbench brain for Kelly Grappe's Arkansas Secretary of State campaign.
You may call tools to ground suggestions in local campaign data (counties, calendar, memory, albums, transcripts)
and to inspect or create non-destructive photo derivatives / video excerpt plans.
Hard rules:
- Prefer "Unknown" over inventing county, city, venue, people, or dates.
- Never invent geography from clothing, vibes, or incomplete tool results.
- Confirmed memory and calendar Confirmed rows are soft priors — only reuse when the current asset clearly matches.
- Needs confirm / empty calendar geography is NOT proof.
- whatThisProves must use concrete evidence language (listened/learned/visited/spoke/engaged).
- Photo derivatives never overwrite originals; prefer suggest_crop_plan before create_photo_derivative.
- For videos, plan_video_excerpt uses local transcripts only — do not invent timestamps.
- Only call batch_apply_photo_evidence when the operator explicitly asks to write the same fields to multiple named photo ids.
- After tools, return ONE final JSON object (no markdown) with:
  county, city, venue, eventDate, eventName, photographer, peopleVisible[],
  whatThisProves, confidence (high|medium|low), warnings[], rationale,
  optional sceneTags[], altTextDraft, cropAdvice (photos), speakerNotes (videos).`;

function parseSuggestion(raw: string): EvidenceAiSuggestion {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<EvidenceAiSuggestion>;
  const unk = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s || "Unknown";
  };
  const people = Array.isArray(parsed.peopleVisible)
    ? parsed.peopleVisible.map((p) => String(p).trim()).filter(Boolean)
    : [];
  const confidence =
    parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
      ? parsed.confidence
      : "low";
  return {
    county: unk(parsed.county),
    city: unk(parsed.city),
    venue: unk(parsed.venue),
    eventDate: unk(parsed.eventDate),
    eventName: unk(parsed.eventName),
    photographer: unk(parsed.photographer),
    peopleVisible: people,
    whatThisProves: String(parsed.whatThisProves ?? "").trim(),
    confidence,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    rationale: String(parsed.rationale ?? "").trim(),
    sceneTags: Array.isArray(parsed.sceneTags) ? parsed.sceneTags.map(String).slice(0, 12) : undefined,
    altTextDraft: parsed.altTextDraft ? String(parsed.altTextDraft) : undefined,
    cropAdvice: parsed.cropAdvice ? String(parsed.cropAdvice) : undefined,
    speakerNotes: parsed.speakerNotes ? String(parsed.speakerNotes) : undefined,
  };
}

export async function runEvidenceAiBrain(input: {
  kind: "photo" | "video";
  userText: string;
  imageDataUrl?: string | null;
  /** Additional stills for batch context (kept small). */
  extraImageDataUrls?: string[];
  /** Appended to the system prompt for specialized modes (e.g. batch propose). */
  systemExtra?: string;
  maxToolRounds?: number;
}): Promise<
  | { ok: true; suggestion: EvidenceAiSuggestion; toolsUsed: string[]; model: string; rawContent?: string }
  | { ok: false; error: string }
> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not configured in RedDirt .env / .env.local." };
  }

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const tools = evidenceAiToolsFor(input.kind);
  const toolsUsed: string[] = [];
  const maxRounds = input.maxToolRounds ?? 4;

  const userContent: ChatCompletionContentPart[] = [{ type: "text", text: input.userText }];
  if (input.imageDataUrl) {
    userContent.push({ type: "image_url", image_url: { url: input.imageDataUrl } });
  }
  for (const url of input.extraImageDataUrls ?? []) {
    if (url) userContent.push({ type: "image_url", image_url: { url } });
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: input.systemExtra ? `${SYSTEM}\n${input.systemExtra}` : SYSTEM },
    { role: "user", content: userContent },
  ];

  try {
    for (let round = 0; round < maxRounds; round++) {
      const res = await client.chat.completions.create({
        model,
        temperature: 0.2,
        tools,
        tool_choice: "auto",
        messages,
      });
      const msg = res.choices[0]?.message;
      if (!msg) return { ok: false, error: "OpenAI returned an empty message." };

      if (msg.tool_calls?.length) {
        messages.push({
          role: "assistant",
          content: msg.content ?? null,
          tool_calls: msg.tool_calls,
        });
        for (const call of msg.tool_calls) {
          if (call.type !== "function") continue;
          const name = call.function.name;
          toolsUsed.push(name);
          const executed = await executeEvidenceAiTool(name, call.function.arguments ?? "{}");
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(executed.ok ? executed.result : { error: executed.error }),
          });
        }
        continue;
      }

      // Force JSON final answer if the model replied in prose without tools.
      const content = msg.content?.trim() ?? "";
      if (!content) {
        messages.push({
          role: "user",
          content:
            "Return the final evidence JSON object now (no markdown). Prefer Unknown over guessing.",
        });
        const final = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages,
        });
        const raw = final.choices[0]?.message?.content?.trim() ?? "";
        if (!raw) return { ok: false, error: "OpenAI returned empty suggestion." };
        const suggestion = parseSuggestion(raw);
        suggestion.toolsUsed = [...new Set(toolsUsed)];
        return { ok: true, suggestion, toolsUsed: suggestion.toolsUsed, model, rawContent: raw };
      }

      // Try parse direct JSON; otherwise ask for JSON-only follow-up once.
      try {
        const suggestion = parseSuggestion(content);
        suggestion.toolsUsed = [...new Set(toolsUsed)];
        return { ok: true, suggestion, toolsUsed: suggestion.toolsUsed, model, rawContent: content };
      } catch {
        messages.push({ role: "assistant", content });
        messages.push({
          role: "user",
          content: "Convert your answer into the required JSON object only.",
        });
        const final = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages,
        });
        const raw = final.choices[0]?.message?.content?.trim() ?? "";
        if (!raw) return { ok: false, error: "OpenAI returned empty suggestion." };
        const suggestion = parseSuggestion(raw);
        suggestion.toolsUsed = [...new Set(toolsUsed)];
        return { ok: true, suggestion, toolsUsed: suggestion.toolsUsed, model, rawContent: raw };
      }
    }

    return { ok: false, error: "Evidence AI hit the tool-round limit without a final suggestion." };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}
