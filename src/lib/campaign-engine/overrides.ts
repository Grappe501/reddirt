/**
 * ALIGN-1: Automation override and impact — types only, no behavior.
 * @see docs/automation-override-and-impact-foundation.md
 */

import type { HumanGovernanceBoundaryId } from "./ai-brain";

export const OVERRIDES1_PACKET = "ALIGN-1" as const;

export const AutomationOverrideKind = {
  CHANGED_RECOMMENDATION: "changed_recommendation",
  CHANGED_ROUTING: "changed_routing",
  CHANGED_DRAFT: "changed_draft",
  CHANGED_SEND_HOLD: "changed_send_hold",
  CHANGED_ASSIGNMENT: "changed_assignment",
  CHANGED_ESCALATION: "changed_escalation",
  CHANGED_TRAINING_RECOMMENDATION: "changed_training_recommendation",
  CHANGED_TASK_PRIORITY: "changed_task_priority",
  CHANGED_PUBLIC_RESPONSE: "changed_public_response",
} as const;

export type AutomationOverrideKindId =
  (typeof AutomationOverrideKind)[keyof typeof AutomationOverrideKind];

export const OverrideImpactClass = {
  IMPROVED: "improved",
  NEUTRAL: "neutral",
  DEGRADED: "degraded",
  UNKNOWN: "unknown",
} as const;

export type OverrideImpactClassId =
  (typeof OverrideImpactClass)[keyof typeof OverrideImpactClass];

/** Placeholder for a future append-only event row (not persisted in ALIGN-1). */
export type AutomationOverrideEventDraft = {
  kind: AutomationOverrideKindId;
  systemArea: string;
  originalSuggestionRef?: string;
  humanChangeSummary: string;
  actorUserId: string;
  at: string;
  reasonNote?: string;
  affected: { type: string; id: string };
  governance: HumanGovernanceBoundaryId | "none";
  impactClass?: OverrideImpactClassId;
};
