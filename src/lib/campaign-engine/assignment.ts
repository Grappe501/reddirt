/**
 * ASSIGN-1 + ASSIGN-2: Assignment rail + open-work handle; seat/assignment read types (no writes here).
 * UWR-1: `UnifiedOpenWorkItem` (see `open-work.ts`) extends this read surface.
 * @see docs/assignment-rail-foundation.md
 * @see docs/seat-aware-assignment-foundation.md
 * @see docs/unified-open-work-foundation.md
 * @see docs/unified-incoming-work-read-model.md
 */

import type { PositionId } from "./positions";

export const ASSIGN1_PACKET = "ASSIGN-1" as const;
export const UWR1_PACKET = "UWR-1" as const;
/** @see docs/seat-aware-assignment-foundation.md */
export const ASSIGN2_PACKET = "ASSIGN-2" as const;
/** @see docs/agent-skill-framework.md — types in `skills.ts` */
export const SKILL1_PACKET = "SKILL-1" as const;

/** How the assignee was determined (vocabulary; not all kinds are persisted today). */
export const AssignmentKind = {
  DIRECT: "direct",
  INHERITED_ROLLUP: "inherited_rollup",
  SUGGESTED_AI: "suggested_ai",
  ESCALATED: "escalated",
} as const;

export type AssignmentKindId =
  (typeof AssignmentKind)[keyof typeof AssignmentKind];

export const AssignmentScope = {
  USER: "USER",
  POSITION: "POSITION",
} as const;

export type AssignmentScopeId =
  (typeof AssignmentScope)[keyof typeof AssignmentScope];

/**
 * User scope is the only one stored on domain rows today (assignedToUserId / assignedUserId).
 * Position scope is a future join or optional column — types only in ASSIGN-1.
 */
export type AssignedReference =
  | { scope: typeof AssignmentScope.USER; userId: string }
  | { scope: typeof AssignmentScope.POSITION; positionId: PositionId };

/** Prisma model name for a row that can appear in unified open work (extend in later packets). */
export const OpenWorkSourceModel = {
  EmailWorkflowItem: "EmailWorkflowItem",
  WorkflowIntake: "WorkflowIntake",
  CampaignTask: "CampaignTask",
  CommunicationThread: "CommunicationThread",
  /** UWR-2: `reviewStatus === PENDING_REVIEW` only; deep-link is pending list (no per-row admin URL). */
  ArkansasFestivalIngest: "ArkansasFestivalIngest",
} as const;

export type OpenWorkSourceModelId =
  (typeof OpenWorkSourceModel)[keyof typeof OpenWorkSourceModel];

/**
 * Prisma `PositionSeatStatus` as strings — assignment.ts stays Prisma-agnostic.
 * `SYNTHETIC_VACANT` = no `PositionSeat` row yet; treated as vacant in read layer.
 */
export type SeatStatusForAssignment =
  | "VACANT"
  | "FILLED"
  | "ACTING"
  | "SHADOW"
  | "SYNTHETIC_VACANT";

/**
 * ASSIGN-2: read-only join of seat + org tree + honesty about domain `assigned*UserId` vs occupant.
 * No writes, no routing, not a permission.
 */
export type SeatAssignmentContext = {
  positionId: PositionId;
  /** `PositionSeat` occupant, if any */
  seatOccupantUserId: string | null;
  /** ROLE-1 parent */
  structuralParentPositionId: PositionId | null;
  /** When seat is vacant, where attention conceptually rolls (same as parent) */
  inheritedAttentionToPositionId: PositionId | null;
  /** Display name of inheritedAttention target, if any */
  inheritedAttentionToDisplayName: string | null;
  effectiveSeatStatus: SeatStatusForAssignment;
  actingForPositionKey: string | null;
  hasPersistedSeatRow: boolean;
  /** UWR-1: email / intake / task use user assignment only — not positionId columns */
  domainAssignmentIsUserScopedOnly: true;
  /** E-3+ suggestion rail — not persisted in ASSIGN-2 */
  recommendedAssigneeUserId: string | null;
};

/**
 * For a position’s **heuristic** inbox slice vs seat occupant: counts only, read-only.
 * “Other” = assigned to a user who is not the current seat occupant (when occupant exists).
 */
export type SeatInboxWorkAlignment = {
  positionId: PositionId;
  occupantUserId: string | null;
  /** Rows in the position inbox list */
  positionInboxTotal: number;
  sliceAssignedToOccupant: number;
  sliceAssignedToOtherUser: number;
  sliceUnassigned: number;
  /**
   * When occupant is set: true if every row with a non-null assignee matches occupant; false if any differs.
   * null: no occupant, or no rows with an assignee in the slice to compare.
   */
  allAssignedInSliceMatchOccupant: boolean | null;
  /** `getOpenWorkForUser(occupant)` list length (global open work, not only this slice) */
  occupantOpenWorkGlobalCount: number;
};

/**
 * Read-model handle: enough to deep-link, sort, and group without a new unified table.
 * `positionId` is reserved for future domain→position rules or schema.
 */
export type OpenWorkItemRef = {
  source: OpenWorkSourceModelId;
  id: string;
  statusLabel: string;
  title: string | null;
  createdAt: string; // ISO 8601
  assignedUserId: string | null;
  positionId: PositionId | null;
  /** Human-readable priority if the source has one */
  priorityLabel?: string | null;
  countyId?: string | null;
  /** Admin path or relative URL; optional until list UI exists */
  href?: string | null;
  /** Prisma enum string; helps compare apples when norms differ by domain */
  rawStatus?: string;
  /**
   * Email workflow: `ESCALATED` status or `escalationLevel` not NONE, human-readable.
   * Other sources: null in UWR-1.
   */
  escalationLabel?: string | null;
  /**
   * One line for list UI: title or first summary field, not a second source of truth.
   */
  summaryLine?: string | null;
  /**
   * Short hint for which workbench to start from: `/admin/workbench/email-queue` vs `/admin/tasks` etc.
   */
  workbenchRouteHint?: string;
  /** For email: `occurredAt` when set; for others usually `createdAt` */
  occurredAt?: string | null;
};
