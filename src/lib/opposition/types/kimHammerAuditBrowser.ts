/** Kim Hammer unified audit browser types — client-safe. */

export type KimHammerAuditEntryKind =
  | "CLAIM_REVIEW"
  | "RETRIEVAL_TASK"
  | "CITATION_MUTATION"
  | "AI_SUGGESTION"
  | "EXPORT_EVENT"
  | "MEDIA_INTAKE_REVIEW"
  | "MEDIA_INTAKE_RUN"
  | "MEDIA_FINDING_PROMOTION"
  | "LLM_DRAFT_CREATED"
  | "LLM_DRAFT_REVIEWED"
  | "LLM_DRAFT_PROMOTED"
  | "LLM_DRAFT_ARCHIVED";

export type KimHammerUnifiedAuditEntry = {
  kind: KimHammerAuditEntryKind;
  auditId: string;
  subjectId: string;
  sourceFile: string;
  previousStatus: string;
  nextStatus: string;
  operator: string;
  notes: string;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
  previousOwner?: string;
  nextOwner?: string;
  previousPriority?: string;
  nextPriority?: string;
  previousDueDate?: string | null;
  nextDueDate?: string | null;
};

export type KimHammerAuditTimeline = {
  generatedAt: string;
  claimReviewCount: number;
  retrievalTaskCount: number;
  citationMutationCount: number;
  aiSuggestionCount: number;
  exportEventCount: number;
  mediaIntakeReviewCount: number;
  mediaIntakeRunCount: number;
  mediaFindingPromotionCount: number;
  llmDraftAuditCount: number;
  totalEntries: number;
  entries: KimHammerUnifiedAuditEntry[];
};
