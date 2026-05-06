import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured, formatOpenAIErrorForClient } from "@/lib/openai/client";
import {
  buildCampaignVoicePromptExcerpt,
  mergeModelSourceLimitations,
  type MessageStudioCampaignVoiceSettings,
} from "@/lib/email-command-center/campaign-voice";
import { buildAiSystemPromptForRole, getEmailAiOutputContract } from "@/lib/email-command-center/ai-brain-registry";
import {
  buildEvidenceLedger,
  buildUnsupportedClaimWarnings,
  type AiEvidenceLedger,
} from "@/lib/email-command-center/ai-source-grounding";

export type MessageStudioSourceBackedClaimRow = {
  text: string;
  grounding?: string;
  note?: string;
};

export type MessageStudioUnsupportedClaimRow = {
  text: string;
  reason?: string;
};

export type MessageStudioInferenceRow = {
  text: string;
  rationale?: string;
};

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
  /** Where the model is unsure — operators must verify before externalization */
  uncertaintyNotes: string[];
  /** Short lines traceable only to operator-provided text (queue notes, pasted facts) — not invented stats */
  sourceBackedBullets: string[];
  /** Tone, framing, or generic values language that does not assert new facts */
  suggestedLanguageOnly: string[];
  /** Imperative checklist lines for human review (no automation) */
  operatorReviewTasks: string[];
  /** One line: advisory posture + whether RAG was used (always "none" from this path) */
  advisoryPosture: string;
  /** Structured source-backed lines (may mirror bullets; server enriches ledger) */
  sourceBackedClaims: MessageStudioSourceBackedClaimRow[];
  /** Echo of operator inputs the model relied on (never fabricated) */
  operatorProvidedContext: string[];
  /** Non-factual recommendations / framing */
  inferences: MessageStudioInferenceRow[];
  /** Claims needing citation or removal */
  unsupportedClaims: MessageStudioUnsupportedClaimRow[];
  /** Concrete edit suggestions */
  recommendedEdits: string[];
  /** Deterministic ledger — added server-side after model parse */
  evidenceLedger?: AiEvidenceLedger;
};

const claimRowSchema = z.object({
  text: z.string(),
  grounding: z.string().optional(),
  note: z.string().optional(),
});

const inferenceRowSchema = z.object({
  text: z.string(),
  rationale: z.string().optional(),
});

const unsupportedRowSchema = z.object({
  text: z.string(),
  reason: z.string().optional(),
});

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
  uncertaintyNotes: z.array(z.string()).default([]),
  sourceBackedBullets: z.array(z.string()).default([]),
  suggestedLanguageOnly: z.array(z.string()).default([]),
  operatorReviewTasks: z.array(z.string()).default([]),
  advisoryPosture: z.string().default(""),
  sourceBackedClaims: z.array(claimRowSchema).default([]),
  operatorProvidedContext: z.array(z.string()).default([]),
  inferences: z.array(inferenceRowSchema).default([]),
  unsupportedClaims: z.array(unsupportedRowSchema).default([]),
  recommendedEdits: z.array(z.string()).default([]),
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

const SYSTEM_BASE = [
  buildAiSystemPromptForRole("campaignCommsDirector", {
    modeDescription:
      "Message Studio advisory email drafting (Kelly SOS / Arkansas). Server action — JSON object response only in this path.",
  }),
  "",
  getEmailAiOutputContract("messageStudioDraft"),
  "",
  "Additional drafting discipline:",
  "- You MUST NOT invent statistics, poll numbers, legal outcomes, opponent actions, or quotes. If a fact is not in the operator-provided context, label it as UNSUPPORTED unless clearly generic values language.",
  "- You MUST label uncertainty explicitly in uncertaintyNotes (what you cannot verify from inputs).",
  "- You MUST separate: (1) sourceBackedBullets = short lines that restate or paraphrase ONLY facts present in operator inputs or Campaign Voice excerpt — no new facts; (2) suggestedLanguageOnly = tone/structure/generic phrasing that is NOT asserting new facts; (3) emailBodyDraft may mix both but unsupportedClaimsTagged must list anything needing human fact-check.",
  "- You do NOT have live document retrieval or SearchChunk RAG in this call — set advisoryPosture to state that semantic RAG was not consulted (Message Studio path).",
  "- Output valid JSON only (no markdown fences) matching the requested shape in the user message for this turn.",
  "- If context is thin, say so in sourceLimitations, uncertaintyNotes, and complianceRiskFlags and keep claims generic.",
  "- Populate structured grounding keys: sourceBackedClaims (objects with text + optional grounding/note), operatorProvidedContext (short strings echoing operator inputs you actually used), inferences (text + rationale for non-factual recommendations), unsupportedClaims (text + reason for anything not clearly in operator inputs), recommendedEdits (imperative edit lines). Never invent URLs, document titles, or citations.",
].join("\n");

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
      uncertaintyNotes: ["Model JSON parse failed — treat all draft text as unverified."],
      sourceBackedBullets: [],
      suggestedLanguageOnly: [],
      operatorReviewTasks: ["Re-run AI draft or paste approved copy manually.", "Complete editorial claim/source checklist before externalization."],
      advisoryPosture: "Advisory only; output unusable JSON — human rewrite required.",
      sourceBackedClaims: [],
      operatorProvidedContext: [],
      inferences: [],
      unsupportedClaims: [],
      recommendedEdits: [],
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
      uncertaintyNotes: ["Schema mismatch — verify every factual line against approved sources."],
      sourceBackedBullets: [],
      suggestedLanguageOnly: [],
      operatorReviewTasks: ["Compare model output keys to latest Message Studio advisory schema.", "Do not send until editorial review complete."],
      advisoryPosture: "Advisory only; partial JSON — human reconciliation required.",
      sourceBackedClaims: [],
      operatorProvidedContext: [],
      inferences: [],
      unsupportedClaims: [],
      recommendedEdits: [],
    };
  }
  return p.data;
}

type LedgerEnrichContext = {
  campaignVoice: MessageStudioCampaignVoiceSettings;
  audienceNote: string;
  complianceNotes: string;
  subjectGoal: string;
  primaryCta: string;
  sourceHints: string;
  existingBody: string;
  templateSummary?: string;
  voiceExcerpt: string;
};

function enrichCampaignVoiceDraftWithLedger(
  parsed: CampaignVoiceDraftAiResult,
  ctx: LedgerEnrichContext,
): CampaignVoiceDraftAiResult {
  const draftSlice = {
    audienceNote: ctx.audienceNote,
    complianceNotes: ctx.complianceNotes,
    body: ctx.existingBody,
  };
  const sourceBackedClaims =
    parsed.sourceBackedClaims.length > 0
      ? parsed.sourceBackedClaims
      : parsed.sourceBackedBullets.map((b) => ({ text: b }));

  const modelForLedger = {
    emailBodyDraft: parsed.emailBodyDraft,
    subjectSuggestions: parsed.subjectSuggestions,
    sourceBackedClaims,
    unsupportedClaims: parsed.unsupportedClaims,
    inferences: parsed.inferences,
    sourceBackedBullets: parsed.sourceBackedBullets,
    suggestedLanguageOnly: parsed.suggestedLanguageOnly,
  };

  const ledger = buildEvidenceLedger({
    audienceNote: ctx.audienceNote,
    complianceNotes: ctx.complianceNotes,
    subjectGoal: ctx.subjectGoal,
    primaryCta: ctx.primaryCta,
    sourceHints: ctx.sourceHints,
    existingBody: ctx.existingBody,
    templateSummary: ctx.templateSummary,
    voiceExcerpt: ctx.voiceExcerpt,
    model: modelForLedger,
  });

  const warnings = buildUnsupportedClaimWarnings(ledger);
  const mergedBase = mergeModelSourceLimitations(ctx.campaignVoice, draftSlice, parsed.sourceLimitations);
  const sourceLimitations = [...mergedBase, ...ledger.notices, ...warnings].slice(0, 40);

  const unsupportedClaims =
    parsed.unsupportedClaims.length > 0
      ? parsed.unsupportedClaims
      : ledger.unsupportedClaims.map((u) => ({ text: u.text, reason: u.rationale }));

  const operatorProvidedContext =
    parsed.operatorProvidedContext.length > 0
      ? parsed.operatorProvidedContext
      : ledger.operatorProvidedContext.slice(0, 12);

  const recommendedEdits = [...parsed.recommendedEdits];
  if (unsupportedClaims.length > 0 && !recommendedEdits.some((line) => /unsupported|verify|remove/i.test(line))) {
    recommendedEdits.push("Review each unsupported claim line — verify against approved sources or remove before send governance.");
  }

  return {
    ...parsed,
    sourceBackedClaims,
    operatorProvidedContext,
    unsupportedClaims,
    recommendedEdits: recommendedEdits.slice(0, 24),
    evidenceLedger: ledger,
    sourceLimitations,
  };
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
    "unsupportedClaimsTagged (single string listing any phrases that need human fact-check, or empty string),",
    "uncertaintyNotes (array: what you cannot verify from inputs),",
    "sourceBackedBullets (array: max 6 short lines tied ONLY to operator text / template summary / voice excerpt — no new stats),",
    "suggestedLanguageOnly (array: tone or generic phrasing not asserting new facts),",
    "operatorReviewTasks (array: 3–6 imperative checklist lines for staff — no send/automation verbs),",
    "advisoryPosture (single string: state advisory-only + that SearchChunk/RAG was not queried in this API),",
    "sourceBackedClaims (array of { text, grounding?, note? }: facts clearly traceable to operator inputs / template summary / voice excerpt only),",
    "operatorProvidedContext (array of short strings: which operator fields or pasted facts you relied on — never fabricated),",
    "inferences (array of { text, rationale? }: framing or recommendations that are not asserted facts),",
    "unsupportedClaims (array of { text, reason? }: anything needing citation, removal, or human verification),",
    "recommendedEdits (array of imperative lines to improve grounding before externalization).",
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
    const parsed = parseJsonResult(raw);
    const posture =
      parsed.advisoryPosture?.trim() ||
      "Advisory only: Message Studio generation does not query SearchChunk semantic RAG — verify facts against operator-provided sources.";
    const withPosture = { ...parsed, advisoryPosture: posture };
    const result = enrichCampaignVoiceDraftWithLedger(withPosture, {
      campaignVoice: params.campaignVoice,
      audienceNote: params.audienceNote,
      complianceNotes: params.complianceNotes,
      subjectGoal: params.subjectGoal,
      primaryCta: params.primaryCta,
      sourceHints: params.sourceHints,
      existingBody: params.existingBody,
      templateSummary: params.templateSummary,
      voiceExcerpt: voice,
    });
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
  /** Optional; improves deterministic source-limitation merge when present */
  complianceNotes?: string;
  /** Optional; improves evidence ledger + grounding panels on revise */
  subjectGoal?: string;
  primaryCta?: string;
  sourceHints?: string;
  templateSummary?: string;
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
    "Return the SAME JSON shape as full draft generation (including uncertaintyNotes, sourceBackedBullets, suggestedLanguageOnly, operatorReviewTasks, advisoryPosture, sourceBackedClaims, operatorProvidedContext, inferences, unsupportedClaims, recommendedEdits). For subject_lines / cta_options modes, leave emailBodyDraft empty if instructed.",
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
    const parsed = parseJsonResult(raw);
    const posture =
      parsed.advisoryPosture?.trim() ||
      "Advisory only: Message Studio revision does not query SearchChunk semantic RAG — verify facts against operator-provided sources.";
    const withPosture = { ...parsed, advisoryPosture: posture };
    const result = enrichCampaignVoiceDraftWithLedger(withPosture, {
      campaignVoice: params.campaignVoice,
      audienceNote: params.audienceNote,
      complianceNotes: params.complianceNotes ?? "",
      subjectGoal: params.subjectGoal?.trim() || params.subject || "(revise pass)",
      primaryCta: params.primaryCta?.trim() || "",
      sourceHints: params.sourceHints?.trim() || "",
      existingBody: params.body,
      templateSummary: params.templateSummary,
      voiceExcerpt: voice,
    });
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: formatOpenAIErrorForClient(e) };
  }
}
