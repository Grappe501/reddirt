import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured, formatOpenAIErrorForClient } from "@/lib/openai/client";
import {
  buildCampaignVoicePromptExcerpt,
  type MessageStudioCampaignVoiceSettings,
} from "@/lib/email-command-center/campaign-voice";

export type CampaignVoiceDraftAiResult = {
  subjectSuggestions: string[];
  preheaderSuggestions: string[];
  emailBodyDraft: string;
  ctaOptions: string[];
  personalizationNotes: string[];
  complianceRiskFlags: string[];
  sourceLimitations: string[];
  revisionSuggestions: string[];
  unsupportedClaimsTagged: string;
};

const resultSchema = z.object({
  subjectSuggestions: z.array(z.string()).default([]),
  preheaderSuggestions: z.array(z.string()).default([]),
  emailBodyDraft: z.string().default(""),
  ctaOptions: z.array(z.string()).default([]),
  personalizationNotes: z.array(z.string()).default([]),
  complianceRiskFlags: z.array(z.string()).default([]),
  sourceLimitations: z.array(z.string()).default([]),
  revisionSuggestions: z.array(z.string()).default([]),
  unsupportedClaimsTagged: z.string().default(""),
});

export type MessageStudioRevisionMode =
  | "warmer"
  | "shorter"
  | "more_urgent"
  | "more_plainspoken"
  | "for_volunteers"
  | "for_donors"
  | "for_county"
  | "for_press"
  | "subject_lines"
  | "cta_options";

const SYSTEM_BASE = `You are a senior comms drafter for a U.S. state-level Secretary of State campaign (Kelly SOS / Arkansas).
Rules:
- This is ADVISORY drafting only. You MUST NOT send email, schedule sends, or claim any message was delivered.
- You MUST NOT invent statistics, poll numbers, legal outcomes, opponent actions, or quotes. If a fact is not in the operator-provided context, label it as UNSUPPORTED unless clearly generic values language.
- Respect Arkansas-rooted, transparent-government, fair-elections posture. No unsourced opponent attacks.
- Output valid JSON only (no markdown fences) matching the requested shape.
- If context is thin, say so in sourceLimitations and complianceRiskFlags and keep claims generic.`;

function parseJsonResult(raw: string): CampaignVoiceDraftAiResult {
  const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  let j: unknown;
  try {
    j = JSON.parse(cleaned) as unknown;
  } catch {
    return {
      subjectSuggestions: [],
      preheaderSuggestions: [],
      emailBodyDraft: "",
      ctaOptions: [],
      personalizationNotes: [],
      complianceRiskFlags: ["Model output was not valid JSON — operator review required."],
      sourceLimitations: ["Re-run generation or paste manually."],
      revisionSuggestions: [],
      unsupportedClaimsTagged: "",
    };
  }
  const p = resultSchema.safeParse(j);
  if (!p.success) {
    return {
      subjectSuggestions: [],
      preheaderSuggestions: [],
      emailBodyDraft: typeof j === "object" && j && "emailBodyDraft" in j ? String((j as Record<string, unknown>).emailBodyDraft) : "",
      ctaOptions: [],
      personalizationNotes: [],
      complianceRiskFlags: ["Model output did not match expected JSON shape — operator review required."],
      sourceLimitations: [],
      revisionSuggestions: [],
      unsupportedClaimsTagged: "",
    };
  }
  return p.data;
}

export type GenerateCampaignVoiceDraftParams = {
  draftType: string;
  audienceNote: string;
  subjectGoal: string;
  primaryCta: string;
  complianceNotes: string;
  existingBody: string;
  campaignVoice: MessageStudioCampaignVoiceSettings;
  /** Non-secret hints: ids/labels only from URL or operator notes */
  sourceHints: string;
  /** Optional production template JSON summary (MESSAGE-STUDIO-PRODUCTION-TEMPLATES-1.0) */
  templateSummary?: string;
};

export async function generateCampaignVoiceEmailDraft(
  params: GenerateCampaignVoiceDraftParams,
): Promise<{ ok: true; result: CampaignVoiceDraftAiResult } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OpenAI is not configured (OPENAI_API_KEY on server)." };
  }
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const voice = buildCampaignVoicePromptExcerpt(params.campaignVoice);
  const user = [
    "Generate an advisory email draft package as JSON with keys:",
    "subjectSuggestions (array of 3 strings), preheaderSuggestions (array of 2 strings),",
    "emailBodyDraft (plain text body, no HTML), ctaOptions (array of 3 short CTAs),",
    "personalizationNotes (array of strings for merge tags / human follow-ups),",
    "complianceRiskFlags (array), sourceLimitations (array), revisionSuggestions (array of 2 strings),",
    "unsupportedClaimsTagged (single string listing any phrases that need human fact-check, or empty string).",
    "",
    "=== Operator inputs ===",
    `draftType: ${params.draftType || "(unspecified)"}`,
    `audienceNote: ${params.audienceNote || "(none)"}`,
    `subjectGoal: ${params.subjectGoal || "(none)"}`,
    `primaryCta: ${params.primaryCta || "(none)"}`,
    `complianceNotes: ${params.complianceNotes || "(none)"}`,
    `sourceHints (ids only, may be empty): ${params.sourceHints || "(none)"}`,
    `existingBody (may be empty): ${params.existingBody || "(empty)"}`,
    "",
    params.templateSummary
      ? `=== Production email template (operator-selected; structure only — no invented facts) ===\n${params.templateSummary}\n`
      : "",
    voice,
  ].join("\n");

  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.45,
      max_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_BASE },
        { role: "user", content: user },
      ],
    });
    const raw = res.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return { ok: false, error: "OpenAI returned empty content." };
    const result = parseJsonResult(raw);
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: formatOpenAIErrorForClient(e) };
  }
}

export type ReviseCampaignVoiceDraftParams = {
  mode: MessageStudioRevisionMode;
  body: string;
  subject: string;
  campaignVoice: MessageStudioCampaignVoiceSettings;
  audienceNote: string;
};

function revisionInstruction(mode: MessageStudioRevisionMode): string {
  switch (mode) {
    case "warmer":
      return "Rewrite the body warmer and more human; keep facts identical; do not add new factual claims.";
    case "shorter":
      return "Rewrite the body at least 25% shorter; preserve the core ask; no new factual claims.";
    case "more_urgent":
      return "Rewrite with respectful urgency for a time-sensitive moment; no panic language; no new factual claims.";
    case "more_plainspoken":
      return "Rewrite in plainspoken Arkansas-accessible language; shorter sentences; no new factual claims.";
    case "for_volunteers":
      return "Rewrite for volunteers: gratitude, one shift-level ask, clear next step; no new factual claims.";
    case "for_donors":
      return "Rewrite for donors: impact, stewardship, careful compliance tone — no matching-funds inventions; no new factual claims.";
    case "for_county":
      return "Rewrite with county/local relevance hooks (generic if county unknown); no fabricated county statistics.";
    case "for_press":
      return "Rewrite for press/professional: tight lede, no unsourced quotes; if facts missing, say 'on background only' in limitations.";
    case "subject_lines":
      return "Do NOT rewrite the body. Return subjectSuggestions (5 distinct options) and preheaderSuggestions (3 options) only; emailBodyDraft may be empty string.";
    case "cta_options":
      return "Do NOT rewrite the body. Return ctaOptions (5 distinct short CTAs) only; emailBodyDraft empty string.";
    default:
      return "Improve clarity; no new factual claims.";
  }
}

export async function reviseCampaignVoiceEmailDraft(
  params: ReviseCampaignVoiceDraftParams,
): Promise<{ ok: true; result: CampaignVoiceDraftAiResult } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OpenAI is not configured (OPENAI_API_KEY on server)." };
  }
  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const voice = buildCampaignVoicePromptExcerpt(params.campaignVoice);
  const user = [
    revisionInstruction(params.mode),
    "Return the SAME JSON shape as full draft generation. For subject_lines / cta_options modes, leave emailBodyDraft empty if instructed.",
    "",
    `Current subject: ${params.subject || "(none)"}`,
    `Audience note: ${params.audienceNote || "(none)"}`,
    "",
    voice,
    "",
    "=== Body ===",
    params.body || "(empty)",
  ].join("\n");

  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_BASE },
        { role: "user", content: user },
      ],
    });
    const raw = res.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return { ok: false, error: "OpenAI returned empty content." };
    const result = parseJsonResult(raw);
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: formatOpenAIErrorForClient(e) };
  }
}
