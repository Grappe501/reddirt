/**
 * TALENT-1: Adaptive training rail — types only (no content DB, no LMS).
 * @see docs/talent-intelligence-foundation.md §5
 */

import type { PositionId } from "./positions";

export const TALENT1_TRAINING_MODULE = "TALENT-1" as const;

/** Curriculum lane — expand when training content exists. */
export type TrainingTrackType =
  | "rails_fundamentals"
  | "comms_queue_and_send_boundary"
  | "field_turf_safety"
  | "voter_data_and_exports"
  | "opposition_and_claims"
  | "compliance_messaging"
  | "event_readiness"
  | "platforms_and_integrations"
  | "stakeholder_escalation";

/**
 * Hints for adaptive pathing (no scoring — pairs with position + observations later).
 */
export type PositionDevelopmentHint = {
  positionId: PositionId;
  /** Suggested focus from matrix / heuristics; human or rule-filled later */
  priorityTracks: readonly TrainingTrackType[];
  /** e.g. early_campaign | late_vote | post_primary */
  campaignStage?: "early" | "mid" | "late" | "general";
};
