/**
 * Freeform Evidence Command — magical operator chat over the full tool surface.
 * Prefer Unknown; never silent Approve / Confirm / encode / render / curate.
 */
import "server-only";

import type {
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { evidenceAiToolsFor } from "@/lib/campaign-media/evidence-ai-tool-defs";
import { executeEvidenceAiTool } from "@/lib/campaign-media/evidence-ai-tool-runtime";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";

const COMMAND_SYSTEM = `You are the Evidence Workbench COMMAND CENTER for Kelly Grappe's Arkansas Secretary of State campaign.
Operators ask natural-language questions across calendar, photos, videos, intake, placement, and ship.

Hard rules:
- Prefer "Unknown" over inventing county, city, venue, people, or dates.
- Confirmed calendar rows and confirmed memory are soft priors only.
- Never silent Approve, Publish, Confirm calendar, encode, render, turbo, or apply curated/speech placement — only when the operator explicitly asks AND confirm* flags are true.
- Call rank_evidence_next_actions when prioritizing "what should I do next".
- Call propose_event_night_pack when linking a calendar night to stills/speeches (cues only).
- Call suggest_calendar_presence_fields for calendar geography proposals (never auto-Confirm).
- Call get_evidence_publish_queue / get_speech_confirm_queue / build_evidence_ship_report for backlog truth.
- After tools, return ONE final JSON object (no markdown):
{
  "headline": string,
  "plan": string[],
  "nextClicks": [{"label": string, "href": string}],
  "warnings": string[],
  "confidence": "high"|"medium"|"low",
  "toolsSummary": string
}
Hrefs must be workbench-relative paths under /admin/evidence-workbench?... when possible.`;

export type EvidenceCommandResult = {
  headline: string;
  plan: string[];
  nextClicks: Array<{ label: string; href: string }>;
  warnings: string[];
  confidence: "high" | "medium" | "low";
  toolsSummary: string;
  toolsUsed: string[];
  model: string;
  rawContent?: string;
};

function parseCommand(raw: string): EvidenceCommandResult {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<EvidenceCommandResult>;
  const confidence =
    parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
      ? parsed.confidence
      : "low";
  return {
    headline: String(parsed.headline ?? "Evidence command").trim() || "Evidence command",
    plan: Array.isArray(parsed.plan) ? parsed.plan.map(String).filter(Boolean).slice(0, 12) : [],
    nextClicks: Array.isArray(parsed.nextClicks)
      ? parsed.nextClicks
          .map((c) => ({
            label: String((c as { label?: string })?.label ?? "").trim(),
            href: String((c as { href?: string })?.href ?? "").trim(),
          }))
          .filter((c) => c.label && c.href)
          .slice(0, 8)
      : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String).slice(0, 12) : [],
    confidence,
    toolsSummary: String(parsed.toolsSummary ?? "").trim(),
    toolsUsed: [],
    model: "",
  };
}

export async function runEvidenceAiCommand(input: {
  prompt: string;
  maxToolRounds?: number;
}): Promise<{ ok: true; result: EvidenceCommandResult } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not configured in RedDirt .env / .env.local." };
  }
  const prompt = String(input.prompt ?? "").trim();
  if (!prompt) return { ok: false, error: "Enter a command." };
  if (prompt.length > 4000) return { ok: false, error: "Command too long (max 4000 chars)." };

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const tools = evidenceAiToolsFor("photo", "command");
  const toolsUsed: string[] = [];
  const maxRounds = input.maxToolRounds ?? 6;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: COMMAND_SYSTEM },
    { role: "user", content: prompt },
  ];

  try {
    for (let round = 0; round < maxRounds; round++) {
      const res = await client.chat.completions.create({
        model,
        temperature: 0.2,
        tools: tools.length ? tools : undefined,
        tool_choice: tools.length ? "auto" : undefined,
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
          toolsUsed.push(call.function.name);
          const executed = await executeEvidenceAiTool(
            call.function.name,
            call.function.arguments ?? "{}",
          );
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(executed.ok ? executed.result : { error: executed.error }),
          });
        }
        continue;
      }

      const content = String(msg.content ?? "").trim();
      if (!content) return { ok: false, error: "Model returned no final plan." };
      try {
        const result = parseCommand(content);
        result.toolsUsed = [...new Set(toolsUsed)];
        result.model = model;
        if (!result.toolsSummary && result.toolsUsed.length) {
          result.toolsSummary = `Used: ${result.toolsUsed.join(", ")}`;
        }
        result.warnings = [
          ...result.warnings,
          `Command mode · ${tools.length} tools available · Prefer Unknown`,
        ];
        return { ok: true, result };
      } catch {
        return {
          ok: true,
          result: {
            headline: "Command response (unparsed)",
            plan: [content.slice(0, 2000)],
            nextClicks: [{ label: "County desk", href: "/admin/evidence-workbench?tab=county" }],
            warnings: ["Model did not return strict JSON — showing raw plan.", "Prefer Unknown"],
            confidence: "low",
            toolsSummary: toolsUsed.length ? `Used: ${[...new Set(toolsUsed)].join(", ")}` : "",
            toolsUsed: [...new Set(toolsUsed)],
            model,
            rawContent: content,
          },
        };
      }
    }
    return { ok: false, error: "Command hit max tool rounds without a final plan." };
  } catch (e) {
    return { ok: false, error: formatOpenAIErrorForClient(e) };
  }
}
