/**
 * YOUTH-1: Types for youth pipeline alignment with ROLE-1 `PositionId` — no engine, no scoring.
 * @see docs/youth-pipeline-foundation.md
 */

export const YOUTH1_PACKET = "YOUTH-1" as const;

/** Rough lifecycle for planning; not persisted in YOUTH-1. */
export type YouthStage =
  | "interested"
  | "onboarding"
  | "active"
  | "paused"
  | "alumni";

/** Canonical youth entry / growth roles (map to `positions.ts` extensions in later packets). */
export type YouthRoleType = "youth_volunteer" | "youth_organizer" | "youth_leader";

/** Observable engagement hints for future observation / TALENT rails — types only. */
export type YouthEngagementSignal =
  | "rsvp_event"
  | "peer_recruit"
  | "training_complete"
  | "mentor_checkin"
  | "content_share"
  | "other";
