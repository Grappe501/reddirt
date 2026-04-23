/**
 * TALENT-1: Types for the talent / training intelligence rail.
 * Advisory only — no scoring engine, no automation, no RBAC.
 * @see docs/talent-intelligence-foundation.md
 * @see docs/talent-recommendation-flow.md
 */

import type { PositionId } from "./positions";

export const TALENT1_PACKET = "TALENT-1" as const;

/** High-level bucket for observed or derived evidence (documentation contract). */
export type TalentSignalCategory =
  | "reliability_consistency"
  | "responsiveness"
  | "completion_behavior"
  | "comprehension_system"
  | "position_understanding"
  | "communication_patterns"
  | "initiative"
  | "judgment"
  | "specialization_affinity"
  | "leadership_potential"
  | "coaching_responsiveness";

/** Non-exhaustive — extend in TALENT-2+ when DTOs exist. */
export type TalentRecommendationType =
  | "training_module_suggested"
  | "shadow_assignment_suggested"
  | "not_ready_sensitive_work"
  | "consider_for_position"
  | "consider_for_advancement_review"
  | "high_reliability_recognized"
  | "risk_flag_coaching"
  | "informational_digest";

/** Who should see a recommendation first (routing intent, not RBAC). */
export type TalentRecommendationAudience =
  | "direct_manager_position"
  | "parent_position"
  | "campaign_manager"
  | "compliance"
  | "cross_department";

export type TalentEvidenceRef = {
  /** e.g. email_workflow, campaign_task, workflow_intake */
  domain: string;
  objectType: string;
  id: string;
  field?: string;
};

/** Placeholder for a future persisted row / event. */
export type TalentRecommendationDraft = {
  type: TalentRecommendationType;
  targetUserId: string;
  suggestedPositionId?: PositionId;
  reasons: readonly string[];
  evidence: readonly TalentEvidenceRef[];
  audience: TalentRecommendationAudience;
  /** If machine-assisted, set for provenance */
  modelId?: string;
  modelVersion?: string;
};
