/**
 * WB-CORE-1 + SEAT-1: Placeholder types for later user-specific + AI guidance surfaces.
 * No profiling, no writes, no scoring — naming only. `PositionSeatPersonalizationAnchor` links to real seating when used.
 * @see docs/position-workbench-foundation.md
 * @see docs/position-seating-foundation.md
 * @see docs/user-scoped-ai-context-foundation.md
 */

export const WBC1_PERSONALIZE_PACKET = "WB-CORE-1" as const;

export const PositionWorkbenchMode = {
  ORG_NARRATIVE: "org_narrative",
  FOR_USER: "for_user",
} as const;

export type PositionWorkbenchModeId =
  (typeof PositionWorkbenchMode)[keyof typeof PositionWorkbenchMode];

/**
 * SEAT-1+ bridge: when `PositionSeat` has an occupant, future personalization (TALENT/AI) can key off
 * `(positionKey, occupantUserId)` without implying route permissions. Types only; no server writes here.
 * @see docs/position-seating-foundation.md
 */
export type PositionSeatPersonalizationAnchor = {
  positionKey: string;
  occupantUserId: string | null;
  workbenchMode: PositionWorkbenchModeId;
};

/**
 * A future “slot” in the workbench (training link, RAG SOP, AI hint) — not rendered until a packet implements content.
 */
export type WorkbenchGuidanceSlot = {
  id: string;
  kind: "training" | "sop_rag" | "alignment_note" | "ai_advisory" | "placeholder";
  label: string;
  /** Filled in later; keep empty in WB-CORE-1 UIs. */
  href: string | null;
};

/**
 * One collapsible/section in a personalized workbench (future). Types only.
 */
export type PersonalizedWorkbenchSection = {
  title: string;
  guidanceSlots: readonly WorkbenchGuidanceSlot[];
};
