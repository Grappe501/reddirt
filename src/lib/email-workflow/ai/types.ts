/**
 * EMAIL-AI-INTELLIGENCE-1.0 — structured contract for advisory OpenAI analysis on EmailWorkflowItem.
 * AI suggests only; operators own truth, approvals, sends, profile writes, segment creation.
 */

export const EMAIL_AI_ANALYSIS_SCHEMA_VERSION = 1 as const;
/** Bumped when prompt / expected JSON shape gains material intelligence fields (stored output stays schema v1). */
export const EMAIL_AI_PROMPT_VERSION = "email-ai-analysis-v2";

export type EmailAiRiskFlag = {
  /** Stable machine-ish code */
  code: string;
  label: string;
  detail?: string;
};

/** Optional secondary suggestion line items (beyond recommendedNextAction). */
export type EmailAiSuggestedAction = {
  label: string;
  detail?: string;
};

/** Hypothetical fact — never auto-applied; requires human verification. */
export type EmailAiProfileFactSuggestion = {
  suggestion: string;
  /** Always true when produced by this contract */
  suggestionsOnlyNotMerge: true;
};

export type EmailAiDraftSuggestion = {
  /** Supporting note around replyDraft; advisory */
  rationale?: string;
};

export type EmailAiAudienceHint = {
  hint: string;
  /** Clarify not created as a segment */
  notApplied: true;
};

/**
 * Analyzer output persisted under `metadataJson.emailAiAnalysis.output`.
 */
export type EmailAiAnalysisV1 = {
  version: 1;
  generatedAt: string;
  /** Model id used for the completion (never a secret). */
  model: string;
  /** Short summary of inputs the model relied on */
  inputSummary: string;
  /** 0–1 where useful; normalized in parser */
  confidence: number;
  intent: string;
  urgency: string;
  sentiment: string;
  escalationRecommendation: string;
  campaignImpact: string;
  recommendedNextAction: string;
  recommendedOwnerRole: string;
  replyDraft: string;
  replyDraftTone: string;
  profileFactSuggestions: EmailAiProfileFactSuggestion[];
  audienceHints: EmailAiAudienceHint[];
  riskFlags: EmailAiRiskFlag[];
  complianceWarnings: string[];
  missingContext: string[];
  sourceLimitations: string[];
  /** Explicit uncertainty — operators must verify */
  uncertaintyNotes: string[];
  /** Why confidence was chosen (advisory) */
  confidenceRationale: string;
  /** Observations that restate queue summaries only — not new external facts */
  sourceBackedObservations: string[];
  /** Wording that is tone/strategy without asserting new facts */
  suggestedLanguageNotes: string[];
  /** Short imperative checklist for staff (no send / no automation) */
  operatorReviewTasks: string[];
  /** One paragraph bridging to editorial / compliance review */
  reviewIntelligenceSummary: string;
  /**
   * True only when a future pipeline explicitly provides body text from a non-Gmail source.
   * Gmail metadata bridge always keeps this false through this packet.
   */
  bodyWasAvailable: boolean;
  shouldSendAutomatically: false;
  canSendFromQueue: false;
  /** Extra suggested steps (optional) */
  suggestedActions?: EmailAiSuggestedAction[];
  draftSuggestionMeta?: EmailAiDraftSuggestion;
};

/**
 * Persisted envelope in `metadataJson.emailAiAnalysis`.
 */
export type EmailAiAnalysisStoredV1 = {
  version: 1;
  generatedAt: string;
  model: string;
  promptVersion: string;
  /** One-line description of inputs (sources, truncation) — no secrets */
  inputSourceSummary: string;
  output?: EmailAiAnalysisV1;
  /** Safe operator-facing message; never raw HTTP/provider dumps */
  lastErrorSafe?: string;
};

export function emptyEmailAiAnalysisV1(model: string, inputSummary: string): EmailAiAnalysisV1 {
  const now = new Date().toISOString();
  return {
    version: 1,
    generatedAt: now,
    model,
    inputSummary,
    confidence: 0,
    intent: "",
    urgency: "",
    sentiment: "",
    escalationRecommendation: "",
    campaignImpact: "",
    recommendedNextAction: "",
    recommendedOwnerRole: "",
    replyDraft: "",
    replyDraftTone: "",
    profileFactSuggestions: [],
    audienceHints: [],
    riskFlags: [],
    complianceWarnings: [],
    missingContext: [],
    sourceLimitations: [],
    uncertaintyNotes: [],
    confidenceRationale: "",
    sourceBackedObservations: [],
    suggestedLanguageNotes: [],
    operatorReviewTasks: [],
    reviewIntelligenceSummary: "",
    bodyWasAvailable: false,
    shouldSendAutomatically: false,
    canSendFromQueue: false,
  };
}
