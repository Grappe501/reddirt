/**
 * EMAIL-AI-TASK-INTELLIGENCE-1.0 — structured campaign task recommendations from queue context.
 * Advisory only: no calendar writes, no sends, no automatic CampaignTask or DB task creation.
 */

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
} from "@/lib/openai/client";
import { isEmailAiConfigured } from "@/lib/email-workflow/ai/config";
import { buildAiSystemPromptForRole, getEmailAiOutputContract } from "@/lib/email-command-center/ai-brain-registry";

export const EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION = 1 as const;
export const EMAIL_AI_TASK_INTELLIGENCE_PROMPT_VERSION = "email-task-intelligence-v1" as const;

/** Slugs aligned with model output contract (snake_case). */
export const EMAIL_AI_TASK_CATEGORY_SLUGS = [
  "reply_needed",
  "call_needed",
  "schedule_follow_up",
  "volunteer_follow_up",
  "donor_follow_up",
  "press_follow_up",
  "issue_research",
  "event_request",
  "data_cleanup",
  "profile_review",
  "audience_review",
  "draft_message",
  "escalate_to_candidate_principal",
  "legal_compliance_review",
] as const;

export type EmailAiTaskCategorySlug = (typeof EMAIL_AI_TASK_CATEGORY_SLUGS)[number];

export type EmailTaskIntelligenceTaskRow = {
  taskTitle: string;
  taskType: EmailAiTaskCategorySlug;
  urgency: string;
  ownerRole: string;
  recommendedDueWindow: string;
  contextSummary: string;
  dependencies: string[];
  calendarRelevance: string;
  emailDraftNeeded: boolean;
  profileUpdateSuggested: boolean;
  audienceHintSuggested: boolean;
  riskFlags: string[];
};

export type EmailTaskIntelligenceOutput = {
  tasks: EmailTaskIntelligenceTaskRow[];
  packetSummary?: string;
};

export type EmailTaskIntelligenceStoredV1 = {
  version: typeof EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION;
  generatedAt: string;
  model: string;
  promptVersion: string;
  inputSourceSummary: string;
  lastErrorSafe?: string;
  output?: EmailTaskIntelligenceOutput;
};

const MAX_FIELD = 3200;

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

const taskRowSchema = z.object({
  taskTitle: z.string(),
  taskType: z.string(),
  urgency: z.string().default("normal"),
  ownerRole: z.string().default(""),
  recommendedDueWindow: z.string().default("this_week"),
  contextSummary: z.string().default(""),
  dependencies: z.array(z.string()).default([]),
  calendarRelevance: z.string().default("none"),
  emailDraftNeeded: z.boolean().default(false),
  profileUpdateSuggested: z.boolean().default(false),
  audienceHintSuggested: z.boolean().default(false),
  riskFlags: z.array(z.string()).default([]),
});

const outputSchema = z.object({
  tasks: z.array(taskRowSchema).max(14).default([]),
  packetSummary: z.string().optional(),
});

function coerceTaskType(raw: string): EmailAiTaskCategorySlug | null {
  const t = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if ((EMAIL_AI_TASK_CATEGORY_SLUGS as readonly string[]).includes(t)) {
    return t as EmailAiTaskCategorySlug;
  }
  const legacy: Record<string, EmailAiTaskCategorySlug> = {
    escalate_to_candidate: "escalate_to_candidate_principal",
    escalate_to_principal: "escalate_to_candidate_principal",
    legal_review: "legal_compliance_review",
    compliance_review: "legal_compliance_review",
  };
  return legacy[t] ?? null;
}

export function normalizeEmailTaskIntelligenceOutput(raw: unknown, maxTasks = 12): EmailTaskIntelligenceOutput {
  const p = outputSchema.safeParse(raw);
  if (!p.success) {
    return { tasks: [], packetSummary: undefined };
  }
  const tasks: EmailTaskIntelligenceTaskRow[] = [];
  for (const row of p.data.tasks) {
    const slug = coerceTaskType(row.taskType);
    if (!slug) continue;
    tasks.push({
      taskTitle: truncateSafe(row.taskTitle, 240),
      taskType: slug,
      urgency: truncateSafe(row.urgency, 80),
      ownerRole: truncateSafe(row.ownerRole, 160),
      recommendedDueWindow: truncateSafe(row.recommendedDueWindow, 120),
      contextSummary: truncateSafe(row.contextSummary, 900),
      dependencies: row.dependencies.map((d) => truncateSafe(d, 200)).filter(Boolean).slice(0, 8),
      calendarRelevance: truncateSafe(row.calendarRelevance, 240),
      emailDraftNeeded: Boolean(row.emailDraftNeeded),
      profileUpdateSuggested: Boolean(row.profileUpdateSuggested),
      audienceHintSuggested: Boolean(row.audienceHintSuggested),
      riskFlags: row.riskFlags.map((r) => truncateSafe(r, 200)).filter(Boolean).slice(0, 8),
    });
    if (tasks.length >= maxTasks) break;
  }
  return {
    tasks,
    packetSummary: p.data.packetSummary ? truncateSafe(p.data.packetSummary, 1200) : undefined,
  };
}

/** Optional excerpt of prior queue AI analysis for richer task planning (still advisory). */
export function summarizeEmailAiAnalysisForTaskContext(meta: unknown): string {
  const m = asMetaRecord(meta);
  const ai = m.emailAiAnalysis;
  if (!ai || typeof ai !== "object" || Array.isArray(ai)) return "";
  const o = ai as Record<string, unknown>;
  const out = o.output;
  if (!out || typeof out !== "object" || Array.isArray(out)) return "";
  const u = out as Record<string, unknown>;
  const parts = [
    typeof u.intent === "string" ? `intent: ${u.intent}` : "",
    typeof u.urgency === "string" ? `urgency: ${u.urgency}` : "",
    typeof u.recommendedNextAction === "string" ? `recommendedNextAction: ${u.recommendedNextAction}` : "",
    typeof u.recommendedOwnerRole === "string" ? `recommendedOwnerRole: ${u.recommendedOwnerRole}` : "",
    typeof u.reviewIntelligenceSummary === "string" ? `reviewIntelligenceSummary: ${u.reviewIntelligenceSummary}` : "",
    Array.isArray(u.operatorReviewTasks)
      ? `operatorReviewTasks: ${(u.operatorReviewTasks as string[]).slice(0, 6).join(" | ")}`
      : "",
  ].filter(Boolean);
  return truncateSafe(parts.join("\n"), 2000);
}

export type RunEmailTaskIntelligenceOutcome =
  | { ok: true; itemId: string; stored: EmailTaskIntelligenceStoredV1 }
  | { ok: false; itemId?: string; errorSafe: string; stored?: EmailTaskIntelligenceStoredV1 };

export type RunEmailTaskIntelligenceInput = { itemId: string };

/**
 * Loads queue row + safe metadata → OpenAI JSON → `metadataJson.emailTaskIntelligence` only.
 * Does not create CampaignTask rows, calendar events, sends, or status changes.
 */
export async function generateEmailTaskIntelligenceForQueueItem(
  input: RunEmailTaskIntelligenceInput,
): Promise<RunEmailTaskIntelligenceOutcome> {
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

  const inputSourceParts = [
    "EmailWorkflowItem row fields + optional prior emailAiAnalysis summary.",
    "No automatic task creation — recommendations stored in metadataJson.emailTaskIntelligence only.",
  ];
  if (gmailReview?.createdByManualOperatorAction === true) {
    inputSourceParts.push("Gmail metadata-only bridge — no body text in this lane.");
  }
  const inputSourceSummary = inputSourceParts.join(" ");

  if (!isEmailAiConfigured()) {
    const stored: EmailTaskIntelligenceStoredV1 = {
      version: EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      model: getOpenAIConfigFromEnv().model,
      promptVersion: EMAIL_AI_TASK_INTELLIGENCE_PROMPT_VERSION,
      inputSourceSummary,
      lastErrorSafe: "OpenAI is not configured (OPENAI_API_KEY missing).",
    };
    const nextMeta: Prisma.InputJsonValue = { ...baseMeta, emailTaskIntelligence: stored };
    await prisma.emailWorkflowItem.update({
      where: { id: itemId },
      data: { metadataJson: nextMeta },
    });
    return { ok: false, itemId, errorSafe: stored.lastErrorSafe ?? "not_configured", stored };
  }

  const { model } = getOpenAIConfigFromEnv();
  const client = getOpenAIClient();

  const priorAi = summarizeEmailAiAnalysisForTaskContext(row.metadataJson);

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
    `sentiment: ${truncateSafe(row.sentiment)}`,
    `tone: ${String(row.tone)}`,
    `intent: ${String(row.intent)}`,
    `escalationLevel: ${String(row.escalationLevel)}`,
    `spamDisposition: ${String(row.spamDisposition)}`,
    `spamScore: ${row.spamScore != null ? String(row.spamScore) : "—"}`,
    `needsDeescalation: ${row.needsDeescalation}`,
    `status (do not change): ${row.status}`,
    gmailReview
      ? `gmailReviewSource (provenance): ${truncateSafe(JSON.stringify(gmailReview), 1000)}`
      : "gmailReviewSource: none",
    priorAi ? `Prior AI email analysis (summary only):\n${priorAi}` : "Prior AI email analysis: none",
  ].join("\n");

  const system = [
    buildAiSystemPromptForRole("dataIntelligenceAnalyst", {
      modeDescription:
        "Email queue task intelligence — propose structured campaign tasks and next actions as JSON only; never create calendar events, tasks, or sends from this API.",
    }),
    "",
    getEmailAiOutputContract("emailTaskIntelligence"),
    "",
    "Discipline:",
    "- Each task must be actionable by a human operator from the queue summaries above.",
    "- If context is thin, return fewer tasks and explain in packetSummary.",
    "- calendarRelevance must never state that an event was booked — only suggest what an operator might calendar manually.",
    "- dependencies: short strings (e.g. 'needs_comms_lead_signoff') not database IDs unless present in input.",
    "- Return JSON only (no markdown fences).",
  ].join("\n");

  const userMessage = [
    "From this queue item context, propose up to 12 ranked campaign tasks for internal staff.",
    "",
    contextBlock,
    "",
    "Return JSON: { tasks: [...], packetSummary?: string }.",
  ].join("\n");

  let content = "";
  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.35,
      max_tokens: 2400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    });
    content = res.choices[0]?.message?.content?.trim() ?? "";
  } catch (e: unknown) {
    const msg = stripSecretish(formatOpenAIErrorForClient(e));
    const stored: EmailTaskIntelligenceStoredV1 = {
      version: EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      model,
      promptVersion: EMAIL_AI_TASK_INTELLIGENCE_PROMPT_VERSION,
      inputSourceSummary,
      lastErrorSafe: msg,
    };
    const nextMeta: Prisma.InputJsonValue = { ...baseMeta, emailTaskIntelligence: stored };
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
    const stored: EmailTaskIntelligenceStoredV1 = {
      version: EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      model,
      promptVersion: EMAIL_AI_TASK_INTELLIGENCE_PROMPT_VERSION,
      inputSourceSummary,
      lastErrorSafe: msg,
    };
    const nextMeta: Prisma.InputJsonValue = { ...baseMeta, emailTaskIntelligence: stored };
    await prisma.emailWorkflowItem.update({
      where: { id: itemId },
      data: { metadataJson: nextMeta },
    });
    return { ok: false, itemId, errorSafe: msg, stored };
  }

  const normalized = normalizeEmailTaskIntelligenceOutput(parsed, 12);
  const stored: EmailTaskIntelligenceStoredV1 = {
    version: EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    model,
    promptVersion: EMAIL_AI_TASK_INTELLIGENCE_PROMPT_VERSION,
    inputSourceSummary,
    output: normalized,
    lastErrorSafe: undefined,
  };

  const nextMeta: Prisma.InputJsonValue = {
    ...baseMeta,
    emailTaskIntelligence: stored,
  };

  await prisma.emailWorkflowItem.update({
    where: { id: itemId },
    data: { metadataJson: nextMeta },
  });

  return { ok: true, itemId, stored };
}

export function isStoredEmailTaskIntelligenceV1(v: unknown): v is EmailTaskIntelligenceStoredV1 {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return o.version === EMAIL_AI_TASK_INTELLIGENCE_SCHEMA_VERSION && typeof o.generatedAt === "string";
}
