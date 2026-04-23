/**
 * COMP-1: Cross-system compliance governance rail — **types and constants only**.
 * No filing engine, no legal rules engine, no bank/Agency API clients.
 * (COMP-2: Prisma `ComplianceDocument` is the separate document-intake record; this file remains types-only for domains/signals.)
 * @see docs/compliance-governance-foundation.md
 * @see docs/compliance-paperwork-simplification-foundation.md
 * @see docs/compliance-skill-framework.md
 * @see docs/compliance-agent-ingest-map.md
 */

export const COMP1_PACKET = "COMP-1" as const;

/**
 * Sub-domains for policy, routing narrative, and future UI tagging (not RBAC).
 * @see docs/compliance-governance-foundation.md §2
 */
export const ComplianceDomain = {
  CAMPAIGN_FINANCE_REPORTING: "campaign_finance_reporting",
  FUNDRAISING: "fundraising",
  COMMUNICATIONS_DISCLAIMER: "communications_disclaimer",
  CHANNEL_PHONE_SMS_EMAIL: "channel_phone_sms_email",
  ETHICS_CONFLICT: "ethics_conflict",
  REIMBURSEMENT_EXPENSE: "reimbursement_expense",
  DEADLINES_CALENDAR: "deadlines_calendar",
  RETENTION_RECORDS: "retention_records",
  ROLE_AUTHORITY: "role_authority",
} as const;
export type ComplianceDomainId = (typeof ComplianceDomain)[keyof typeof ComplianceDomain];

/**
 * Kinds of signals the agent or future jobs might emit (advisory, not auto-action).
 */
export const ComplianceSignalKind = {
  MISSING_DISCLAIMER: "missing_disclaimer",
  SENSITIVE_ESCALATION: "sensitive_escalation",
  THRESHOLD_EXCEEDED: "threshold_exceeded",
  DEADLINE_SOON: "deadline_soon",
  INCOMPLETE_RECEIPT: "incomplete_receipt",
  CONFLICT_AFFILIATION: "conflict_affiliation",
  CHANNEL_OPT_IN_UNKNOWN: "channel_opt_in_unknown",
} as const;
export type ComplianceSignalKindId =
  (typeof ComplianceSignalKind)[keyof typeof ComplianceSignalKind];

/**
 * Paperwork prep pipeline (conceptual) — not persisted in COMP-1.
 * @see docs/compliance-paperwork-simplification-foundation.md §3
 */
export const PaperworkPrepStage = {
  SOURCE_CAPTURE: "source_capture",
  NORMALIZATION: "normalization",
  CATEGORIZATION: "categorization",
  EXCEPTION_DETECTION: "exception_detection",
  DRAFT_PAPERWORK: "draft_paperwork",
  HUMAN_REVIEW: "human_review",
  SUBMISSION_EXTERNAL: "submission_external",
} as const;
export type PaperworkPrepStageId =
  (typeof PaperworkPrepStage)[keyof typeof PaperworkPrepStage];

/**
 * Review gate on a draft (future persistence).
 * Not an "AI approved" state — final remains human/official.
 */
export const ComplianceReviewStatus = {
  NOT_STARTED: "not_started",
  DRAFT: "draft",
  NEEDS_INFO: "needs_info",
  IN_REVIEW: "in_review",
  HUMAN_CLEARED_FOR_SUBMISSION: "human_cleared_for_submission", // not "filed"
  WITHDRAWN: "withdrawn",
} as const;
export type ComplianceReviewStatusId =
  (typeof ComplianceReviewStatus)[keyof typeof ComplianceReviewStatus];

/**
 * Aligns with ingest map tiers; naming only in COMP-1.
 */
export const ComplianceKnowledgeTier = {
  TIER_1_MUST: "tier_1_must",
  TIER_2_HIGH: "tier_2_high",
  TIER_3_SPECIALIST: "tier_3_specialist",
} as const;
export type ComplianceKnowledgeTierId =
  (typeof ComplianceKnowledgeTier)[keyof typeof ComplianceKnowledgeTier];
