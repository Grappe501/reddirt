import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildStrategicBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { computeStatewideRegistrationRollup } from "@/lib/intelligence/voterRegistrationTargetModel";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import {
  generateGovernanceWarnings,
  validateDraftPublicationSafety,
  type GovernanceWarningBundle,
} from "@/lib/intelligence/llmGovernanceSafety";
import { appendLlmDraftAuditEntry } from "@/lib/intelligence/llmDraftAuditLog";
import { isOpenAIConfigured } from "@/lib/openai/client";

export const LLM_DRAFT_REVIEW_QUEUE_REL = "data/intelligence/llm-draft-review-queue.json";
export const LLM_PROMPT_TEMPLATE_REGISTRY_REL = "data/intelligence/llm-prompt-template-registry.json";
export const LLM_DRAFT_BACKUP_DIR_REL = "data/intelligence/backups/llm-drafts";

export const GOVERNANCE_CONTENT_HEADER =
  "INTERNAL DRAFT ONLY\nNON-PUBLISHABLE\nHUMAN REVIEW REQUIRED\n";

export type LlmDraftReviewStatus =
  | "DRAFT_PENDING_REVIEW"
  | "NEEDS_REVISION"
  | "REVIEWED_INTERNAL_ONLY"
  | "APPROVED_FOR_PROMOTION"
  | "REJECTED"
  | "ARCHIVED";

export type LlmDraftGenerationMode = "DETERMINISTIC_SYNTHESIS" | "LLM_ASSISTED" | "LLM_BLOCKED_FALLBACK";

export type LlmPromptTemplate = {
  templateId: string;
  category: string;
  purpose: string;
  allowedInputs: string[];
  prohibitedInputs: string[];
  requiredWarnings: string[];
  defaultTemperature: number;
  maxTokenGuidance: number;
  publicationRestrictions: string[];
  requiredReviewLevel: string;
};

export type LlmPromptTemplateRegistry = {
  version: number;
  generatedAt: string;
  purpose: string;
  governanceHeader: string;
  templates: LlmPromptTemplate[];
};

export type LlmDraftReviewEntry = {
  draftId: string;
  draftType: string;
  generatedAt: string;
  generatedByTool: string;
  generatedForRoute: string;
  generationMode: LlmDraftGenerationMode;
  sourceContext: Record<string, unknown>;
  promptSummary: string;
  draftTitle: string;
  draftContent: string;
  publicationSafety: "NON_PUBLISHABLE";
  reviewStatus: LlmDraftReviewStatus;
  humanReviewRequired: true;
  recommendedReviewer: string;
  sourceDependencies: string[];
  citationDependencies: string[];
  narrativeDependencies: string[];
  countyDependencies: string[];
  operatorNotes: string;
  llmModel: string;
  llmTemperature: number;
  tokenEstimate: number;
  confidenceWarnings: string[];
  prohibitedUseWarnings: string[];
  approvedForPromotion: false;
  promotedTo: string | null;
  archived: boolean;
  contentChecksum: string;
  governanceWarnings: string[];
  unsupportedClaimWarnings: string[];
  missingCitationWarnings: string[];
  hallucinationRiskWarnings: string[];
  publicationRestrictions: string[];
};

export type LlmDraftReviewQueue = {
  version: number;
  generatedAt: string;
  purpose: string;
  governanceDefaults: Record<string, unknown>;
  drafts: LlmDraftReviewEntry[];
};

export type GenerateGovernedDraftInput = {
  templateId: string;
  generatedByTool: string;
  generatedForRoute: string;
  draftTitle?: string;
  sourceContext?: Record<string, unknown>;
  countyId?: string;
  billNumber?: string;
  narrativeId?: string;
  attemptLlm?: boolean;
  operator?: string;
  repoRoot?: string;
};

export type GenerateGovernedDraftResult = {
  ok: true;
  draft: LlmDraftReviewEntry;
  generationMode: LlmDraftGenerationMode;
  governance: GovernanceWarningBundle;
};

export const COPILOT_TOOL_TEMPLATE_MAP: Record<string, string> = {
  "vulnerability-finder": "vulnerability-analysis",
  "contradiction-scout": "contradiction-analysis",
  "source-gap-finder": "county-pressure-analysis",
  "bill-impact-analyzer": "bill-impact-analysis",
  "opponent-message-drift-monitor": "opponent-message-analysis",
  "debate-question-generator": "90-second-answer",
  "answer-builder-30-60-90": "60-second-answer",
  "counterargument-predictor": "rebuttal-draft",
  "bridge-line-builder": "bridge-line-draft",
  "trap-question-detector": "trap-question-analysis",
  "rebuttal-builder": "rebuttal-draft",
  "what-not-to-say-detector": "trap-question-analysis",
  "morning-brief-synthesizer": "executive-brief",
  "executive-summary-builder": "executive-brief",
  "county-brief-expander": "county-brief",
  "bill-brief-expander": "bill-brief",
  "candidate-talking-point-builder": "candidate-talking-points",
  "volunteer-script-builder": "volunteer-script",
  "social-media-draft-builder": "social-post-draft",
  "surrogate-memo-builder": "surrogate-memo",
  "press-statement-draft-builder": "press-statement",
  "plain-english-translator": "plain-english-explainer",
  "media-finding-triage": "media-finding-summary",
  "rss-relevance-ranker": "article-summary",
  "podcast-transcript-review-planner": "podcast-summary",
  "local-paper-monitoring-planner": "media-brief",
  "citation-candidate-recommender": "narrative-impact-analysis",
};

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function readJson<T>(repoRoot: string, rel: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, rel), "utf8")) as T;
}

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const target = absPath(repoRoot, rel);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function checksum(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function buildDraftId(templateId: string): string {
  const stamp = Date.now().toString(36);
  return `llm-draft-${templateId}-${stamp}`;
}

export function loadLlmPromptTemplateRegistry(repoRoot: string = process.cwd()): LlmPromptTemplateRegistry {
  const abs = absPath(repoRoot, LLM_PROMPT_TEMPLATE_REGISTRY_REL);
  if (!existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), purpose: "Not initialized", governanceHeader: GOVERNANCE_CONTENT_HEADER.trim(), templates: [] };
  }
  return readJson(repoRoot, LLM_PROMPT_TEMPLATE_REGISTRY_REL);
}

export function resolvePromptTemplate(templateId: string, repoRoot?: string): LlmPromptTemplate | null {
  const registry = loadLlmPromptTemplateRegistry(repoRoot);
  return registry.templates.find((row) => row.templateId === templateId) ?? null;
}

export function loadLlmDraftReviewQueue(repoRoot: string = process.cwd()): LlmDraftReviewQueue {
  const abs = absPath(repoRoot, LLM_DRAFT_REVIEW_QUEUE_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "LLM draft queue not initialized.",
      governanceDefaults: {},
      drafts: [],
    };
  }
  return readJson(repoRoot, LLM_DRAFT_REVIEW_QUEUE_REL);
}

function backupQueueBeforeMutation(repoRoot: string): string {
  const src = absPath(repoRoot, LLM_DRAFT_REVIEW_QUEUE_REL);
  if (!existsSync(src)) return "";
  const backupDir = absPath(repoRoot, LLM_DRAFT_BACKUP_DIR_REL);
  mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(backupDir, `llm-draft-review-queue-${stamp}.json`);
  copyFileSync(src, dest);
  return path.relative(repoRoot, dest).split(path.sep).join("/");
}

export function buildDoctrinePromptContext(repoRoot?: string): string[] {
  const alignment = summarizeStrategicAlignmentRisk(repoRoot);
  const registration = computeStatewideRegistrationRollup(repoRoot);
  const lines = [
    "Campaign doctrine: transparency, accountability, county support for election administrators.",
    "Framing: people vs government dysfunction — not generic partisan attack copy.",
    "Civic environment: election administration access, ballot initiative philosophy, democracy impact.",
    "Voter registration strategy (anecdotal assumptions only — no individual targeting).",
    registration.assumptions.notes,
    `Registration anchor: ${registration.statewideRegistrationGoal} goal · ${registration.expectedSupportVotes} expected support yield.`,
  ];
  for (const row of alignment.priorityDoctrineAreas?.slice(0, 3) ?? []) {
    lines.push(`Priority doctrine: ${row.title} (${row.category})`);
  }
  for (const row of alignment.topStrategicTensions?.slice(0, 2) ?? []) {
    lines.push(`Doctrine tension: ${row.narrativeTitle} — ${row.signal.slice(0, 100)}`);
  }
  return lines;
}

function collectDependencies(repoRoot?: string, options?: { countyId?: string; narrativeId?: string }): {
  sourceDependencies: string[];
  citationDependencies: string[];
  narrativeDependencies: string[];
  countyDependencies: string[];
} {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const narratives = loadKimHammerNarrativeStateIndex(repoRoot);
  const counties = loadCountyBriefingIntelligenceIndex(repoRoot);

  const exportReady = evidence.claims.filter((row) => row.exportReady);
  const sourceDependencies = exportReady.map((row) => row.id);
  const citationDependencies = exportReady
    .filter((row) => row.citationStatus === "CITED" || row.citationStatus === "PARTIAL")
    .map((row) => row.id)
    .slice(0, 8);

  const narrativeDependencies = options?.narrativeId
    ? [options.narrativeId]
    : narratives.narratives.slice(0, 3).map((row) => row.narrativeId);

  const countyDependencies = options?.countyId
    ? [options.countyId]
    : counties.counties.slice(0, 3).map((row) => row.countyId);

  return { sourceDependencies, citationDependencies, narrativeDependencies, countyDependencies };
}

function buildDeterministicDraftBody(
  template: LlmPromptTemplate,
  input: GenerateGovernedDraftInput,
  repoRoot?: string,
): string {
  const paperId =
    template.category === "debate_prep"
      ? "debate-prep"
      : template.category === "writing"
        ? "candidate-talking-points"
        : template.category === "media_intelligence"
          ? "media-monitoring"
          : "morning-intelligence";
  const paper = buildStrategicBriefingPaper(paperId, repoRoot);
  const doctrine = buildDoctrinePromptContext(repoRoot);
  const billLine = input.billNumber ? `Bill anchor: ${input.billNumber}` : "";
  const countyLine = input.countyId ? `County focus: ${input.countyId}` : "";

  const sections: string[] = [
    GOVERNANCE_CONTENT_HEADER.trim(),
    `Generation mode: DETERMINISTIC_SYNTHESIS`,
    `Template: ${template.templateId} (${template.category})`,
    "",
    "## Purpose",
    template.purpose,
    "",
    "## Doctrine / strategy context",
    ...doctrine.map((line) => `- ${line}`),
    "",
    "## Situation synthesis",
    ...paper.executiveSummary.slice(0, 4).map((line) => `- ${line}`),
    "",
    "## Why this matters today",
    ...paper.whyItMatters.slice(0, 3).map((line) => `- ${line}`),
    "",
    "## What changed",
    ...paper.whatChanged.slice(0, 2).map((line) => `- ${line}`),
    "",
    "## County / field impact",
    ...paper.countyImpact.slice(0, 3).map((line) => `- ${line}`),
    billLine,
    countyLine,
    "",
    "## Debate / media relevance",
    ...paper.debateRelevance.slice(0, 2).map((line) => `- ${line}`),
    "",
    "## What NOT to say",
    ...paper.whatNotToSay.slice(0, 3).map((line) => `- DO NOT: ${line}`),
    "",
    "## Open questions",
    ...paper.recommendedNextResearch.slice(0, 2).map((line) => `- ${line}`),
    "",
    "## Operator next action",
    "Human review required before any promotion to briefing, writing, citation candidate, or retrieval task workflow.",
    "This draft is NOT deployable externally and does NOT create governed claims.",
  ].filter(Boolean);

  return sections.join("\n");
}

export function validateDraftGovernance(draft: LlmDraftReviewEntry): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const safety = validateDraftPublicationSafety(draft.draftContent);
  if (!safety.ok) errors.push(...safety.violations);
  if (draft.publicationSafety !== "NON_PUBLISHABLE") errors.push("publicationSafety must be NON_PUBLISHABLE.");
  if (draft.humanReviewRequired !== true) errors.push("humanReviewRequired must be true.");
  if (draft.approvedForPromotion !== false) errors.push("approvedForPromotion must remain false until human workflow.");
  return { ok: errors.length === 0, errors };
}

export function appendDraftToReviewQueue(
  draft: LlmDraftReviewEntry,
  repoRoot: string = process.cwd(),
): { ok: true; backupPath: string } | { ok: false; error: string } {
  const backupPath = backupQueueBeforeMutation(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  if (queue.drafts.some((row) => row.draftId === draft.draftId)) {
    return { ok: false, error: `Draft ${draft.draftId} already exists in queue.` };
  }
  queue.drafts.unshift(draft);
  queue.generatedAt = new Date().toISOString();
  writeJson(repoRoot, LLM_DRAFT_REVIEW_QUEUE_REL, queue);
  return { ok: true, backupPath };
}

export function summarizeDraftReviewQueue(repoRoot?: string): {
  pendingCount: number;
  highRiskCount: number;
  needsCitationCount: number;
  hallucinationWarningCount: number;
  byCategory: Record<string, number>;
  byStatus: Record<LlmDraftReviewStatus, number>;
  topDraftOpportunities: string[];
  unsafeDraftWarnings: string[];
  reviewQueuePriorities: string[];
  debateDraftBacklog: number;
  writingDraftBacklog: number;
  citationRiskDraftCount: number;
  unsupportedClaimDraftCount: number;
  actionRecommendationSummaries: string[];
} {
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const active = queue.drafts.filter((row) => !row.archived && row.reviewStatus !== "ARCHIVED");

  const byCategory: Record<string, number> = {};
  const byStatus: Record<LlmDraftReviewStatus, number> = {
    DRAFT_PENDING_REVIEW: 0,
    NEEDS_REVISION: 0,
    REVIEWED_INTERNAL_ONLY: 0,
    APPROVED_FOR_PROMOTION: 0,
    REJECTED: 0,
    ARCHIVED: 0,
  };

  let highRiskCount = 0;
  let needsCitationCount = 0;
  let hallucinationWarningCount = 0;
  let debateDraftBacklog = 0;
  let writingDraftBacklog = 0;
  let citationRiskDraftCount = 0;
  let unsupportedClaimDraftCount = 0;

  for (const draft of active) {
    byCategory[draft.draftType] = (byCategory[draft.draftType] ?? 0) + 1;
    byStatus[draft.reviewStatus] += 1;
    if (draft.hallucinationRiskWarnings.length > 0) hallucinationWarningCount += 1;
    if (draft.missingCitationWarnings.length > 0) needsCitationCount += 1;
    if (draft.unsupportedClaimWarnings.length > 0) unsupportedClaimDraftCount += 1;
    if (draft.governanceWarnings.length > 0 || draft.unsupportedClaimWarnings.length > 0) highRiskCount += 1;
    if (draft.missingCitationWarnings.length > 0) citationRiskDraftCount += 1;
    if (draft.draftType.includes("debate") || draft.generatedByTool.includes("debate")) debateDraftBacklog += 1;
    if (draft.draftType.includes("writing") || draft.generatedByTool.includes("talking") || draft.generatedByTool.includes("social")) {
      writingDraftBacklog += 1;
    }
  }

  const pending = active.filter((row) => row.reviewStatus === "DRAFT_PENDING_REVIEW");

  return {
    pendingCount: pending.length,
    highRiskCount,
    needsCitationCount,
    hallucinationWarningCount,
    byCategory,
    byStatus,
    topDraftOpportunities: pending.slice(0, 4).map((row) => `${row.draftTitle} (${row.draftType}) — ${row.recommendedReviewer}`),
    unsafeDraftWarnings: active
      .filter((row) => row.governanceWarnings.length > 0 || row.hallucinationRiskWarnings.length > 0)
      .slice(0, 4)
      .map((row) => `${row.draftId}: ${row.governanceWarnings[0] ?? row.hallucinationRiskWarnings[0] ?? "Review required"}`),
    reviewQueuePriorities: pending.slice(0, 5).map((row) => `Review ${row.draftId}: ${row.draftTitle}`),
    debateDraftBacklog,
    writingDraftBacklog,
    citationRiskDraftCount,
    unsupportedClaimDraftCount,
    actionRecommendationSummaries: buildLlmDraftActionRecommendations(repoRoot),
  };
}

/** NSI-15 — read-only action routing hints from pending drafts (no auto-review). */
export function buildLlmDraftActionRecommendations(repoRoot?: string): string[] {
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const lines: string[] = [];
  for (const draft of queue.drafts.filter((row) => !row.archived && row.reviewStatus === "DRAFT_PENDING_REVIEW").slice(0, 8)) {
    if (draft.unsupportedClaimWarnings.length > 0) {
      lines.push(`REVISE_RISKY_LANGUAGE: ${draft.draftId}`);
    } else if (draft.missingCitationWarnings.length > 0) {
      lines.push(`ADD_CITATION_DEPENDENCY: ${draft.draftId}`);
    } else {
      lines.push(`REVIEW_LLM_DRAFT: ${draft.draftId}`);
    }
    if (draft.draftType.includes("briefing")) {
      lines.push(`ROUTE_TO_BRIEFING_DRAFT: ${draft.draftId}`);
    }
    if (draft.reviewStatus === "DRAFT_PENDING_REVIEW" && draft.governanceWarnings.length === 0 && draft.unsupportedClaimWarnings.length === 0) {
      lines.push(`DISMISS_LOW_VALUE_DRAFT (optional): ${draft.draftId}`);
    }
  }
  return lines.slice(0, 12);
}

export function archiveDraft(
  draftId: string,
  operator: string,
  notes: string,
  repoRoot: string = process.cwd(),
): { ok: true } | { ok: false; error: string } {
  backupQueueBeforeMutation(repoRoot);
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const draft = queue.drafts.find((row) => row.draftId === draftId);
  if (!draft) return { ok: false, error: "Draft not found." };
  draft.archived = true;
  draft.reviewStatus = "ARCHIVED";
  draft.operatorNotes = notes;
  queue.generatedAt = new Date().toISOString();
  writeJson(repoRoot, LLM_DRAFT_REVIEW_QUEUE_REL, queue);
  appendLlmDraftAuditEntry(
    {
      eventType: "LLM_DRAFT_ARCHIVED",
      draftId,
      draftType: draft.draftType,
      reviewer: operator,
      route: draft.generatedForRoute,
      model: draft.llmModel,
      previousStatus: "DRAFT_PENDING_REVIEW",
      nextStatus: "ARCHIVED",
      warnings: draft.governanceWarnings,
      promotionTarget: null,
      notes,
    },
    repoRoot,
  );
  return { ok: true };
}

export function promoteDraftForHumanWorkflow(
  draftId: string,
  operator: string,
  repoRoot: string = process.cwd(),
): { ok: true; message: string } | { ok: false; error: string } {
  const queue = loadLlmDraftReviewQueue(repoRoot);
  const draft = queue.drafts.find((row) => row.draftId === draftId);
  if (!draft) return { ok: false, error: "Draft not found." };
  if (draft.reviewStatus !== "APPROVED_FOR_PROMOTION") {
    return { ok: false, error: "Draft must be APPROVED_FOR_PROMOTION before workflow promotion." };
  }
  return {
    ok: true,
    message: `Use promoteDraftToWorkflowCandidate() in review workflow — draft ${draftId} is approved but not auto-promoted.`,
  };
}

export function generateGovernedDraft(input: GenerateGovernedDraftInput): GenerateGovernedDraftResult {
  const repoRoot = input.repoRoot ?? process.cwd();
  const template = resolvePromptTemplate(input.templateId, repoRoot);
  if (!template) {
    throw new Error(`Unknown prompt template: ${input.templateId}`);
  }

  let generationMode: LlmDraftGenerationMode = "DETERMINISTIC_SYNTHESIS";
  let llmModel = "deterministic-synthesis";
  let tokenEstimate = Math.min(template.maxTokenGuidance, 800);

  const body = buildDeterministicDraftBody(template, input, repoRoot);

  if (input.attemptLlm && !isOpenAIConfigured()) {
    generationMode = "LLM_BLOCKED_FALLBACK";
    llmModel = "none-fallback";
  } else if (input.attemptLlm && isOpenAIConfigured()) {
    generationMode = "DETERMINISTIC_SYNTHESIS";
    llmModel = "openai-configured-deferred-nsi12";
    tokenEstimate = template.maxTokenGuidance;
  }

  const deps = collectDependencies(repoRoot, {
    countyId: input.countyId,
    narrativeId: input.narrativeId,
  });

  const governance = generateGovernanceWarnings(
    body,
    {
      ...deps,
      publicationRestrictions: template.publicationRestrictions,
    },
    repoRoot,
  );

  const draftId = buildDraftId(template.templateId);
  const draft: LlmDraftReviewEntry = {
    draftId,
    draftType: template.category,
    generatedAt: new Date().toISOString(),
    generatedByTool: input.generatedByTool,
    generatedForRoute: input.generatedForRoute,
    generationMode,
    sourceContext: input.sourceContext ?? {},
    promptSummary: `${template.templateId}: ${template.purpose.slice(0, 200)}`,
    draftTitle: input.draftTitle ?? `${template.templateId} — governed draft`,
    draftContent: body,
    publicationSafety: "NON_PUBLISHABLE",
    reviewStatus: "DRAFT_PENDING_REVIEW",
    humanReviewRequired: true,
    recommendedReviewer: template.requiredReviewLevel,
    sourceDependencies: deps.sourceDependencies,
    citationDependencies: deps.citationDependencies,
    narrativeDependencies: deps.narrativeDependencies,
    countyDependencies: deps.countyDependencies,
    operatorNotes: "",
    llmModel,
    llmTemperature: template.defaultTemperature,
    tokenEstimate,
    confidenceWarnings: governance.governanceWarnings,
    prohibitedUseWarnings: template.requiredWarnings,
    approvedForPromotion: false,
    promotedTo: null,
    archived: false,
    contentChecksum: checksum(body),
    governanceWarnings: governance.governanceWarnings,
    unsupportedClaimWarnings: governance.unsupportedClaimWarnings,
    missingCitationWarnings: governance.missingCitationWarnings,
    hallucinationRiskWarnings: governance.hallucinationRiskWarnings,
    publicationRestrictions: governance.publicationRestrictions,
  };

  const validation = validateDraftGovernance(draft);
  if (!validation.ok) {
    draft.governanceWarnings = [...draft.governanceWarnings, ...validation.errors];
  }

  const appendResult = appendDraftToReviewQueue(draft, repoRoot);
  if (!appendResult.ok) {
    throw new Error(appendResult.error);
  }

  appendLlmDraftAuditEntry(
    {
      eventType: "LLM_DRAFT_CREATED",
      draftId: draft.draftId,
      draftType: draft.draftType,
      reviewer: input.operator ?? "system",
      route: input.generatedForRoute,
      model: llmModel,
      previousStatus: "NONE",
      nextStatus: draft.reviewStatus,
      warnings: draft.governanceWarnings,
      promotionTarget: null,
      notes: `generationMode=${generationMode}`,
    },
    repoRoot,
  );

  return { ok: true, draft, generationMode, governance };
}

export function generateGovernedDraftForCopilotTool(
  toolId: string,
  options: {
    generatedForRoute: string;
    billNumber?: string;
    countyId?: string;
    narrativeId?: string;
    attemptLlm?: boolean;
    repoRoot?: string;
  },
): GenerateGovernedDraftResult | null {
  const templateId = COPILOT_TOOL_TEMPLATE_MAP[toolId];
  if (!templateId) return null;
  return generateGovernedDraft({
    templateId,
    generatedByTool: toolId,
    generatedForRoute: options.generatedForRoute,
    billNumber: options.billNumber,
    countyId: options.countyId,
    narrativeId: options.narrativeId,
    attemptLlm: options.attemptLlm,
    repoRoot: options.repoRoot,
  });
}
