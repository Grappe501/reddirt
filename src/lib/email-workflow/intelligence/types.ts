import type {
  EmailWorkflowEscalationLevel,
  EmailWorkflowIntent,
  EmailWorkflowItem,
  EmailWorkflowSpamDisposition,
  EmailWorkflowTone,
} from "@prisma/client";

/**
 * Provenance: which linked sources contributed fragments (stable string ids for UI + future ML).
 */
export type EmailWorkflowFragmentSourceKind =
  | "EMAIL_WORKFLOW_BASE"
  | "COMMUNICATION_THREAD"
  | "WORKFLOW_INTAKE"
  | "CAMPAIGN_TASK"
  | "COMMUNICATION_MESSAGE"
  | "CONVERSATION_OPPORTUNITY"
  | "SOCIAL_CONTENT_ITEM"
  | "USER"
  | "VOLUNTEER_PROFILE"
  | "COMMUNICATION_PLAN"
  | "COMMUNICATION_SEND"
  | "COMMS_PLAN_AUDIENCE_SEGMENT";

/** One normalized unit of context for heuristics + composition (no raw blobs in this shape). */
export type EmailWorkflowContextFragment = {
  sourceKind: EmailWorkflowFragmentSourceKind;
  /** Stable id within kind (cuid, etc.). */
  sourceId: string;
  label: string;
  /** Machine-sortable time when the underlying event happened, if known. */
  occurredAt: Date | null;
  /** Short free lines for composer (trimmed, bounded upstream). */
  lines: string[];
  /** Opaque hint for heuristics (e.g. direction, status strings). */
  tags?: string[];
};

/** Deterministic, conservative classification output (E-2A: heuristics only, no LLM). */
export type EmailWorkflowInterpretationSignals = {
  intent?: EmailWorkflowIntent;
  tone?: EmailWorkflowTone;
  escalationLevel?: EmailWorkflowEscalationLevel;
  needsDeescalation?: boolean;
  spamDisposition?: EmailWorkflowSpamDisposition;
  /** 0..1 placeholder; heuristics may leave undefined. */
  spamScore?: number;
  /** Only set when a stable string exists (e.g. thread AI copy); avoid inventing. */
  sentiment?: string;
};

/** Operator-facing summary lines produced by the composer (may be partial). */
export type EmailWorkflowComposedSummary = {
  whoSummary?: string;
  whatSummary?: string;
  whenSummary?: string;
  whereSummary?: string;
  whySummary?: string;
  impactSummary?: string;
  recommendedResponseSummary?: string;
  recommendedResponseRationale?: string;
};

/** Placeholder outputs from future-packet hooks (all optional / null in E-2A). */
export type EmailWorkflowInterpreterExtensionResult = {
  policyRouteHint: unknown;
  draftRecommendationHint: unknown;
  confidenceHint: number | null;
  assigneeUserIdHint: string | null;
};

/** Versioned block stored under `metadataJson.emailWorkflowInterpretation`. */
export type EmailWorkflowInterpretationProvenanceV1 = {
  version: 1;
  interpretedAt: string;
  sourceKinds: EmailWorkflowFragmentSourceKind[];
  /** e.g. "heuristic-v1" */
  engineId: string;
  notes?: string;
  /** Reserved for E-2+ confidence models; optional 0..1. */
  confidence?: number;
  /** E-3/E-4 hook outputs (all null/undefined in E-2A). */
  forwardHooks?: EmailWorkflowInterpreterExtensionResult;
  /** Scalar / summary field names written in this run (E-2B+). */
  overwrittenFields?: string[];
  /**
   * Fields intentionally left because operator (or a prior run) set non-default values (E-2B+).
   * Includes protected summary columns and per-field triage when `forceOverwriteSignals` is false.
   */
  preservedOperatorFields?: string[];
};

export type EmailWorkflowWritebackRequest = {
  itemId: string;
  /** When true, allow replacing non-empty operator summary fields. Default false (non-destructive). */
  forceOverwriteSummaries: boolean;
  /**
   * When true, always refresh heuristic triage fields (intent, tone, etc.).
   * When false, only update those columns if still at Prisma schema defaults (UNKNOWN / NONE, etc.).
   */
  forceOverwriteSignals: boolean;
  signals: EmailWorkflowInterpretationSignals;
  composed: EmailWorkflowComposedSummary;
  provenance: EmailWorkflowInterpretationProvenanceV1;
  /** Merge into metadataJson; provenance is written under `emailWorkflowInterpretation`. */
  baseMetadata: Record<string, unknown>;
};

export type EmailWorkflowWritebackResult = {
  /** Fields actually written to Prisma (scalar columns). */
  updatedScalars: Partial<
    Pick<
      EmailWorkflowItem,
      | "whoSummary"
      | "whatSummary"
      | "whenSummary"
      | "whereSummary"
      | "whySummary"
      | "impactSummary"
      | "recommendedResponseSummary"
      | "recommendedResponseRationale"
      | "sentiment"
      | "intent"
      | "tone"
      | "escalationLevel"
      | "needsDeescalation"
      | "spamDisposition"
      | "spamScore"
      | "status"
    >
  >;
  metadataJson: Record<string, unknown>;
  /** True when an operator-owned summary was skipped due to non-force mode. */
  skippedProtectedFields: string[];
  /** If status was advanced NEW → ENRICHED. */
  statusChangedToEnriched: boolean;
};

export type EmailWorkflowInterpreterResult = {
  ok: true;
  itemId: string;
  fragments: EmailWorkflowContextFragment[];
  signals: EmailWorkflowInterpretationSignals;
  composed: EmailWorkflowComposedSummary;
  writeback: EmailWorkflowWritebackResult;
  /** E-3/E-4: hooks return no behavior yet; present for forward wiring. */
  extension: EmailWorkflowInterpreterExtensionResult;
};

export type EmailWorkflowInterpreterError = {
  ok: false;
  error: string;
  itemId: string;
};

export type EmailWorkflowInterpreterOutcome = EmailWorkflowInterpreterResult | EmailWorkflowInterpreterError;
