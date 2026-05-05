/**
 * EMAIL-AI-INTELLIGENCE-1.0 — advisory LLM analysis for EmailWorkflowItem (no sends, no auto status/profiles).
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
} from "@/lib/openai/client";
import { isEmailAiConfigured } from "@/lib/email-workflow/ai/config";
import {
  EMAIL_AI_ANALYSIS_SCHEMA_VERSION,
  EMAIL_AI_PROMPT_VERSION,
  emptyEmailAiAnalysisV1,
  type EmailAiAnalysisStoredV1,
  type EmailAiAnalysisV1,
  type EmailAiAudienceHint,
  type EmailAiProfileFactSuggestion,
  type EmailAiRiskFlag,
  type EmailAiSuggestedAction,
} from "@/lib/email-workflow/ai/types";

const MAX_FIELD = 3800;

function truncateSafe(s: string | null | undefined, max = MAX_FIELD): string {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function asMetaRecord(v: unknown): Record<string, unknown> {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

function stripSecretish(s: string): string {
  return s
    .replace(/\b(sk-[a-zA-Z0-9_-]{16,})\b/g, "sk-redacted")
    .replace(/\bBearer\s+[A-Za-z0-9._\-\~+/=]+\b/gi, "Bearer-redacted")
    .slice(0, 2000);
}

function asStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNum01(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function normalizeAnalysisFromJson(raw: unknown, model: string, inputSummary: string): EmailAiAnalysisV1 {
  const base = emptyEmailAiAnalysisV1(model, inputSummary);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }
  const o = raw as Record<string, unknown>;

  const riskFlags: EmailAiRiskFlag[] = [];
  if (Array.isArray(o.riskFlags)) {
    for (const r of o.riskFlags) {
      if (typeof r !== "object" || r == null) continue;
      const x = r as Record<string, unknown>;
      riskFlags.push({
        code: asStr(x.code, "risk"),
        label: asStr(x.label, ""),
        detail: x.detail ? asStr(x.detail) : undefined,
      });
    }
  }

  const profileFactSuggestions: EmailAiProfileFactSuggestion[] = [];
  if (Array.isArray(o.profileFactSuggestions)) {
    for (const r of o.profileFactSuggestions) {
      if (typeof r === "string" && r.trim()) {
        profileFactSuggestions.push({ suggestion: truncateSafe(r, 600), suggestionsOnlyNotMerge: true });
      } else if (typeof r === "object" && r != null && "suggestion" in r) {
        const x = r as Record<string, unknown>;
        profileFactSuggestions.push({
          suggestion: truncateSafe(asStr(x.suggestion), 600),
          suggestionsOnlyNotMerge: true,
        });
      }
    }
  }

  const audienceHints: EmailAiAudienceHint[] = [];
  if (Array.isArray(o.audienceHints)) {
    for (const r of o.audienceHints) {
      if (typeof r === "string" && r.trim()) {
        audienceHints.push({ hint: truncateSafe(r, 600), notApplied: true });
      } else if (typeof r === "object" && r != null) {
        const x = r as Record<string, unknown>;
        audienceHints.push({ hint: truncateSafe(asStr(x.hint || x.segmentHint), 600), notApplied: true });
      }
    }
  }

  const suggestedActions: EmailAiSuggestedAction[] = [];
  if (Array.isArray(o.suggestedActions)) {
    for (const r of o.suggestedActions) {
      if (typeof r !== "object" || r == null) continue;
      const x = r as Record<string, unknown>;
      suggestedActions.push({
        label: asStr(x.label || x.action, ""),
        detail: x.detail ? asStr(x.detail) : undefined,
      });
    }
  }

  const complianceWarnings: string[] = Array.isArray(o.complianceWarnings)
    ? o.complianceWarnings.map((x) => asStr(x)).filter(Boolean).map((x) => truncateSafe(x, 400))
    : [];
  const missingContext: string[] = Array.isArray(o.missingContext)
    ? o.missingContext.map((x) => asStr(x)).filter(Boolean).map((x) => truncateSafe(x, 400))
    : [];
  const sourceLimitations: string[] = Array.isArray(o.sourceLimitations)
    ? o.sourceLimitations.map((x) => asStr(x)).filter(Boolean).map((x) => truncateSafe(x, 400))
    : [];

  return {
    ...base,
    intent: truncateSafe(asStr(o.intent, base.intent), 400),
    urgency: truncateSafe(asStr(o.urgency, base.urgency), 200),
    sentiment: truncateSafe(asStr(o.sentiment, base.sentiment), 200),
    confidence: asNum01(o.confidence),
    escalationRecommendation: truncateSafe(
      asStr(o.escalationRecommendation || o.escalation_recommendation, ""),
      700
    ),
    campaignImpact: truncateSafe(asStr(o.campaignImpact || o.campaign_impact), 1200),
    recommendedNextAction: truncateSafe(
      asStr(o.recommendedNextAction || o.recommended_next_action),
      900
    ),
    recommendedOwnerRole: truncateSafe(
      asStr(o.recommendedOwnerRole || o.recommended_owner_role),
      260
    ),
    replyDraft: truncateSafe(asStr(o.replyDraft || o.reply_draft), MAX_FIELD),
    replyDraftTone: truncateSafe(asStr(o.replyDraftTone || o.reply_draft_tone), 140),
    inputSummary,
    generatedAt: new Date().toISOString(),
    model,
    profileFactSuggestions,
    audienceHints,
    riskFlags,
    complianceWarnings,
    missingContext,
    sourceLimitations,
    bodyWasAvailable: o.bodyWasAvailable === true,
    shouldSendAutomatically: false,
    canSendFromQueue: false,
    suggestedActions,
    ...(typeof o.draftSuggestionMeta === "object" && o.draftSuggestionMeta != null
      ? {
          draftSuggestionMeta: {
            rationale: truncateSafe(asStr((o.draftSuggestionMeta as Record<string, unknown>).rationale)),
          },
        }
      : {}),
  };
}

function buildStructuredJsonPromptExample(): string {
  const shape = {
    confidence: 0.6,
    intent: "(string classification)",
    urgency: "low | normal | elevated | urgent",
    sentiment: "(string)",
    escalationRecommendation: "(string)",
    campaignImpact: "(string)",
    recommendedNextAction: "(string)",
    recommendedOwnerRole: "(string)",
    replyDraft: "(plain-text draft suggestion only)",
    replyDraftTone: "(string)",
    profileFactSuggestions: [{ suggestion: "string — must be validated by staff", suggestionsOnlyNotMerge: true }],
    audienceHints: [{ hint: "string", notApplied: true }],
    riskFlags: [{ code: "string", label: "string", detail: "(optional)" }],
    complianceWarnings: ["string"],
    missingContext: ["string"],
    sourceLimitations: ["string"],
    suggestedActions: [{ label: "string", detail: "(optional)" }],
    bodyWasAvailable: false,
    shouldSendAutomatically: false,
    canSendFromQueue: false,
  };
  return JSON.stringify(shape);
}

export type EmailWorkflowAiAnalysisOutcome =
  | { ok: true; itemId: string; stored: EmailAiAnalysisStoredV1 }
  | {
      ok: false;
      itemId?: string;
      errorSafe: string;
      /** Partial stored envelope when we persist failures */
      stored?: EmailAiAnalysisStoredV1;
    };

export type RunEmailWorkflowAiAnalysisInput = {
  itemId: string;
};

/**
 * Load queue row fields + safe metadata provenance → OpenAI structured JSON → `metadataJson.emailAiAnalysis`.
 * Does not mutate status, assignments, sends, profiles, audiences.
 */
export async function runEmailWorkflowAiAnalysis(
  input: RunEmailWorkflowAiAnalysisInput
): Promise<EmailWorkflowAiAnalysisOutcome> {
  const { itemId } = input;

  const row = await prisma.emailWorkflowItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      title: true,
      queueReason: true,
      whoSummary: true,
      whatSummary: true,
      whenSummary: true,
      whereSummary: true,
      whySummary: true,
      impactSummary: true,
      recommendedResponseSummary: true,
      recommendedResponseRationale: true,
      sentiment: true,
      tone: true,
      intent: true,
      escalationLevel: true,
      spamDisposition: true,
      spamScore: true,
      needsDeescalation: true,
      status: true,
      metadataJson: true,
    },
  });

  if (!row) {
    return { ok: false, errorSafe: "Email workflow item not found." };
  }

  const baseMeta = asMetaRecord(row.metadataJson);
  const gmailReview =
    typeof baseMeta.gmailReviewSource === "object" &&
    baseMeta.gmailReviewSource != null &&
    !Array.isArray(baseMeta.gmailReviewSource)
      ? (baseMeta.gmailReviewSource as Record<string, unknown>)
      : null;

  const inputSourceParts: string[] = [
    "EmailWorkflowItem row fields only (campaign email queue).",
    "No Gmail bodies are read by RedDirt through this analyzer.",
  ];
  if (gmailReview && gmailReview.createdByManualOperatorAction === true) {
    inputSourceParts.push(
      "Item includes gmailReviewSource provenance — metadata-only bridge; bodyStored=false in this lane."
    );
  }

  const inputSourceSummary = inputSourceParts.join(" ");

  if (!isEmailAiConfigured()) {
    const stored: EmailAiAnalysisStoredV1 = {
      version: EMAIL_AI_ANALYSIS_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      model: getOpenAIConfigFromEnv().model,
      promptVersion: EMAIL_AI_PROMPT_VERSION,
      inputSourceSummary,
      lastErrorSafe: "OpenAI is not configured (OPENAI_API_KEY missing).",
    };
    const nextMeta: Prisma.InputJsonValue = {
      ...baseMeta,
      emailAiAnalysis: stored,
    };
    await prisma.emailWorkflowItem.update({
      where: { id: itemId },
      data: { metadataJson: nextMeta },
    });
    return {
      ok: false,
      itemId,
      errorSafe: stored.lastErrorSafe ?? "not_configured",
      stored,
    };
  }

  const { model } = getOpenAIConfigFromEnv();
  const client = getOpenAIClient();

  const contextBlock = [
    `title: ${truncateSafe(row.title)}`,
    `queueReason: ${truncateSafe(row.queueReason)}`,
    `whoSummary: ${truncateSafe(row.whoSummary)}`,
    `whatSummary: ${truncateSafe(row.whatSummary)}`,
    `whenSummary: ${truncateSafe(row.whenSummary)}`,
    `whereSummary: ${truncateSafe(row.whereSummary)}`,
    `whySummary: ${truncateSafe(row.whySummary)}`,
    `impactSummary: ${truncateSafe(row.impactSummary)}`,
    `recommendedResponseSummary: ${truncateSafe(row.recommendedResponseSummary)}`,
    `recommendedResponseRationale: ${truncateSafe(row.recommendedResponseRationale)}`,
    `sentiment (row): ${truncateSafe(row.sentiment)}`,
    `tone (row): ${String(row.tone)}`,
    `intent (row): ${String(row.intent)}`,
    `escalationLevel (row): ${String(row.escalationLevel)}`,
    `spamDisposition (row): ${String(row.spamDisposition)}`,
    `spamScore (row): ${row.spamScore != null ? String(row.spamScore) : "—"}`,
    `needsDeescalation: ${row.needsDeescalation}`,
    `status (row, do not change): ${row.status}`,
    gmailReview
      ? `gmailReviewSource (provenance only, no body): ${truncateSafe(JSON.stringify(gmailReview), 1200)}`
      : "gmailReviewSource: none",
  ].join("\n");

  const system = [
    "You are a cautious campaign email triage assistant for RedDirt staff.",
    "Output a single JSON object only (no markdown fences).",
    "Do not fabricate facts about individuals, voters, or opponents. If facts are unknown, list them in missingContext.",
    "Never claim you can send email. shouldSendAutomatically and canSendFromQueue must be false.",
    "bodyWasAvailable must be false unless the user message explicitly states full body text was provided (it is not here).",
    "profileFactSuggestions are advisory only; audienceHints are not applied as segments.",
    "Reply draft is a suggestion only — not sent.",
    "Required JSON shape (types, example values):",
    buildStructuredJsonPromptExample(),
  ].join("\n");

  const userMessage = [
    "Analyze this queue item for internal campaign staff triage.",
    "",
    contextBlock,
    "",
    "Return JSON with all keys from the example shape. Use arrays (may be empty).",
  ].join("\n");

  let content = "";
  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.35,
      max_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    });
    content = res.choices[0]?.message?.content?.trim() ?? "";
  } catch (e: unknown) {
    const msg = stripSecretish(formatOpenAIErrorForClient(e));
    const stored: EmailAiAnalysisStoredV1 = {
      version: EMAIL_AI_ANALYSIS_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      model,
      promptVersion: EMAIL_AI_PROMPT_VERSION,
      inputSourceSummary,
      lastErrorSafe: msg,
    };
    const nextMeta: Prisma.InputJsonValue = {
      ...baseMeta,
      emailAiAnalysis: stored,
    };
    await prisma.emailWorkflowItem.update({
      where: { id: itemId },
      data: { metadataJson: nextMeta },
    });
    return { ok: false, itemId, errorSafe: msg, stored };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    const msg = "OpenAI returned non-JSON output.";
    const stored: EmailAiAnalysisStoredV1 = {
      version: EMAIL_AI_ANALYSIS_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      model,
      promptVersion: EMAIL_AI_PROMPT_VERSION,
      inputSourceSummary,
      lastErrorSafe: msg,
    };
    const nextMeta: Prisma.InputJsonValue = {
      ...baseMeta,
      emailAiAnalysis: stored,
    };
    await prisma.emailWorkflowItem.update({
      where: { id: itemId },
      data: { metadataJson: nextMeta },
    });
    return { ok: false, itemId, errorSafe: msg, stored };
  }

  const inputSummaryForModel = truncateSafe(
    `Queue item ${itemId}; fields + ${gmailReview ? "gmail metadata provenance" : "no gmail provenance"}.`,
    500
  );
  const normalized = normalizeAnalysisFromJson(parsed, model, inputSummaryForModel);
  normalized.shouldSendAutomatically = false;
  normalized.canSendFromQueue = false;
  if (!normalized.bodyWasAvailable && gmailReview?.bodyStored === false) {
    normalized.sourceLimitations = Array.from(
      new Set([
        ...normalized.sourceLimitations,
        "RedDirt did not read a Gmail body for this item (metadata-only bridge).",
      ])
    );
  }

  const stored: EmailAiAnalysisStoredV1 = {
    version: EMAIL_AI_ANALYSIS_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    model,
    promptVersion: EMAIL_AI_PROMPT_VERSION,
    inputSourceSummary,
    output: normalized,
    lastErrorSafe: undefined,
  };

  const nextMeta: Prisma.InputJsonValue = {
    ...baseMeta,
    emailAiAnalysis: stored,
  };

  await prisma.emailWorkflowItem.update({
    where: { id: itemId },
    data: { metadataJson: nextMeta },
  });

  return { ok: true, itemId, stored };
}
