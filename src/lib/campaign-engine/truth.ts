/**
 * BRAIN-OPS-1: deterministic campaign truth / governance vocabulary — types only.
 * No runtime resolver here; see docs/deterministic-brain-foundation.md.
 */

export const BRAIN_OPS_1_PACKET = "BRAIN-OPS-1" as const;

/** How a fact or metric is positioned relative to authority (for UI + AI eligibility). */
export const TruthClass = {
  AUTHORITATIVE: "AUTHORITATIVE",
  MIRRORED: "MIRRORED",
  INFERRED: "INFERRED",
  PROVISIONAL: "PROVISIONAL",
  STALE: "STALE",
  UNAPPROVED_FOR_AI: "UNAPPROVED_FOR_AI",
} as const;
export type TruthClassId = (typeof TruthClass)[keyof typeof TruthClass];

/** Policy / compliance posture for an action path or surface. */
export const GovernanceState = {
  ALLOWED: "ALLOWED",
  ADVISORY_ONLY: "ADVISORY_ONLY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  COMPLIANCE_REVIEW_REQUIRED: "COMPLIANCE_REVIEW_REQUIRED",
  BLOCKED: "BLOCKED",
} as const;
export type GovernanceStateId = (typeof GovernanceState)[keyof typeof GovernanceState];

/** Result of resolving governance for a touchpoint (placeholder shape for BRAIN-OPS-2). */
export type GovernanceResolution = {
  state: GovernanceStateId;
  reasonKey: string;
  detail?: string;
};

/** Who “owns” work for roll-up when multiple rails exist (advisory typing). */
export const OwnershipResolutionKind = {
  SEAT_OCCUPANT: "SEAT_OCCUPANT",
  POSITION_DEFAULT: "POSITION_DEFAULT",
  EXPLICIT_ASSIGNEE: "EXPLICIT_ASSIGNEE",
  UNASSIGNED: "UNASSIGNED",
  ESCALATION_PENDING: "ESCALATION_PENDING",
} as const;
export type OwnershipResolutionKindId =
  (typeof OwnershipResolutionKind)[keyof typeof OwnershipResolutionKind];

export type OwnershipResolution = {
  kind: OwnershipResolutionKindId;
  userId?: string | null;
  positionId?: string | null;
  positionSeatId?: string | null;
};

/** Whether a model may present an output as more than heuristic. */
export const RecommendationEligibility = {
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
  ELIGIBLE_ADVISORY: "ELIGIBLE_ADVISORY",
  ELIGIBLE_WITH_CITATION: "ELIGIBLE_WITH_CITATION",
} as const;
export type RecommendationEligibilityId =
  (typeof RecommendationEligibility)[keyof typeof RecommendationEligibility];
