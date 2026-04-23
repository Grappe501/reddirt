/**
 * ALIGN-1: User-scoped AI context — types only, no RBAC yet.
 * @see docs/user-scoped-ai-context-foundation.md
 */

import type { PositionId } from "./positions";

export const USER_CONTEXT1_PACKET = "ALIGN-1" as const;

export const UserScopedContextLayer = {
  GLOBAL_BRAIN: "global_brain",
  RAG_READ_FILTER: "rag_read_filter",
  POSITION_SOP: "position_sop",
  TALENT_FACET: "talent_facet",
  CURRENT_SESSION_TASK: "current_session_task",
} as const;

export type UserScopedContextLayerId =
  (typeof UserScopedContextLayer)[keyof typeof UserScopedContextLayer];

/**
 * Facets the brain may use for personalization (narrative, not hidden scores).
 * Overlaps with TALENT-1 `TalentSignalCategory` conceptually; keep both explicit.
 */
export const UserUnderstandingFacet = {
  PREFERENCES: "preferences",
  RELIABILITY: "reliability",
  COMMS_STYLE: "comms_style",
  SKILL: "skill",
  ROLE_READINESS: "role_readiness",
} as const;

export type UserUnderstandingFacetId =
  (typeof UserUnderstandingFacet)[keyof typeof UserUnderstandingFacet];

/** Future: per-user, per-scoped build plan (not implemented). */
export type UserScopedContextPlan = {
  userId: string;
  positionId?: PositionId;
  includeLayers: readonly UserScopedContextLayerId[];
  /** Explicit facets to mention in explanations (opt-in, explainable). */
  explainableFacets?: readonly UserUnderstandingFacetId[];
};
