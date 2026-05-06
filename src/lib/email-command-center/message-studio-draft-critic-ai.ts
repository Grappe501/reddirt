/**
 * Optional OpenAI enrichment for EMAIL-AI-DRAFT-CRITIC-1.0 — JSON scorecard only; no sends; no auto-apply.
 */

import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured, formatOpenAIErrorForClient } from "@/lib/openai/client";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import { buildAiSystemPromptForRole } from "@/lib/email-command-center/ai-brain-registry";
import {
  DRAFT_CRITIQUE_DIMENSION_IDS,
  type DraftCritiqueDimensionId,
  type DraftCritiqueDimensionScore,
} from "@/lib/email-command-center/ai-draft-critic";

const dimScoreSchema = z.object({
  score: z.number().min(1).max(5),
  note: z.string().max(800).optional(),
});

const responseSchema = z.object({
  dimensions: z.record(z.string(), dimScoreSchema).optional(),
  additionalRedFlags: z.array(z.string().max(500)).max(12).optional(),
});

function parseDimensions(raw: z.infer<typeof responseSchema>): Partial<Record<DraftCritiqueDimensionId, DraftCritiqueDimensionScore>> | null {
  const d = raw.dimensions;
  if (!d || typeof d !== "object") return null;
  const out: Partial<Record<DraftCritiqueDimensionId, DraftCritiqueDimensionScore>> = {};
  for (const id of DRAFT_CRITIQUE_DIMENSION_IDS) {
    const v = (d as Record<string, unknown>)[id];
    if (!v || typeof v !== "object") continue;
    const p = dimScoreSchema.safeParse(v);
    if (p.success) {
      out[id] = { score: p.data.score, note: p.data.note ?? "" };
    }
  }
  return Object.keys(out).length ? out : null;
}

const SYSTEM = [
  buildAiSystemPromptForRole("campaignCommsDirector", {
    modeDescription:
      "Message Studio AI Draft Critic — red-team review only. JSON output. You do NOT approve, send, or rewrite the draft body.",
  }),
  "",
  "Rules:",
  "- Score each dimension you address from 1 (poor / high risk) to 5 (strong / low risk). For factual_claim_risk and unsupported_claim_risk, LOW score means HIGH risk.",
  "- Never assert new facts or corrected statistics. If a claim needs fixing, your note must say it **needs source** or **needs counsel review** — never invent citations.",
  "- Do NOT output a full rewritten email body.",
  "- additionalRedFlags: optional short strings for issues not covered by dimensions.",
  "- Output JSON only with keys: dimensions (object with optional keys: " +
    DRAFT_CRITIQUE_DIMENSION_IDS.join(", ") +
    " each { score, note? }), additionalRedFlags (string array).",
].join("\n");

export type OpenAiDraftCritiquePartial = {
  dimensions: Partial<Record<DraftCritiqueDimensionId, DraftCritiqueDimensionScore>>;
  additionalRedFlags: string[];
};

export async function runOpenAiDraftCritique(
  draft: MessageStudioLocalDraft,
): Promise<{ ok: true; partial: OpenAiDraftCritiquePartial } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OpenAI is not configured (OPENAI_API_KEY on server)." };
  }
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const user = [
    "Critique this email draft for internal editorial review.",
    "",
    `title: ${draft.title || "(none)"}`,
    `draftType: ${draft.draftType || "(none)"}`,
    `subject: ${clipText(draft.subject, 400)}`,
    `preheader: ${clipText(draft.preheader, 300)}`,
    `primaryCta: ${clipText(draft.primaryCta, 300)}`,
    `audienceNote: ${clipText(draft.audienceNote, 600)}`,
    `complianceNotes: ${clipText(draft.complianceNotes, 500)}`,
    "",
    "=== body (truncated) ===",
    clipText(draft.body, 9000),
  ].join("\n");

  try {
    const res = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      temperature: 0.35,
      max_tokens: 1800,
    });
    const raw = res.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const j = JSON.parse(cleaned) as unknown;
    const p = responseSchema.safeParse(j);
    if (!p.success) {
      return { ok: false, error: "Model output did not match critic schema." };
    }
    const dimensions = parseDimensions(p.data) ?? {};
    const additionalRedFlags = p.data.additionalRedFlags ?? [];
    return { ok: true, partial: { dimensions, additionalRedFlags } };
  } catch (e: unknown) {
    return { ok: false, error: formatOpenAIErrorForClient(e) };
  }
}

function clipText(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
