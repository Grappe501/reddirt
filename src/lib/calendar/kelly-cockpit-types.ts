import type { CampaignCalendarItem } from "./campaign-calendar-item";

/** Prisma `KellyCockpitDecisionKind` serialized for the client. */
export type KellyCockpitDecisionKindStr =
  | "APPROVE"
  | "MODIFY"
  | "SEND_LOCAL"
  | "HOLD"
  | "REJECT"
  | "ASK_STAFF";
export type KellyApprovalState =
  | "not_requested"
  | "needs_kelly_review"
  | "kelly_approved"
  | "kelly_requested_changes"
  | "kelly_requested_local"
  | "kelly_hold"
  | "kelly_declined"
  | "staff_follow_up"
  | "ready_for_calendar_hq"
  | "promoted_to_campaign_event";

/** Mobile + desktop status chip (maps spreadsheet + Kelly decisions). */
export type KellyEventCardBadge =
  | "needs_approval"
  | "tentative"
  | "confirmed"
  | "conflict"
  | "send_local"
  | "needs_staff_follow_up"
  | "staff_follow_up"
  | "approved";

export type KellyCalendarDecisionDto = {
  id: string;
  calendarItemId: string;
  campaignEventId: string | null;
  decision: KellyCockpitDecisionKindStr;
  decidedByUserId: string;
  decidedAt: string;
  notes: string | null;
  requestedDateChange: string | null;
  requestedTimeChange: string | null;
  requestedLocationChange: string | null;
  requestedSurrogateType: string | null;
  requestedSurrogateId: string | null;
  staffFollowUpRequired: boolean;
};

export type CalendarAlertDto = {
  id: string;
  calendarItemId: string;
  severity: string;
  title: string;
  body: string;
  status: string;
  dueAt: string | null;
  channel: string;
};

/** RedDirt ↔ Kelly Google lane (Tentative / Confirmed) — server-built for cockpit cards. */
export type KellyGoogleCockpitOverlay = {
  campaignEventId: string;
  /** RedDirt workflow on the linked `CampaignEvent` (dedupe priority). */
  eventWorkflowState?: string;
  calendarSourceId: string | null;
  externalCalendarId: string | null;
  googleEventId: string | null;
  iCalUID: string | null;
  lane: "tentative" | "confirmed" | "other" | "none";
  googleSyncState: string;
  syncReviewNeeded: boolean;
  lastGoogleSyncAt: string | null;
  googleSyncError: string | null;
  openInGoogleUrl: string | null;
  /** Staff Calendar HQ / tooling */
  staffExactStatus: string;
  /** Kelly-facing copy (gentle on conflicts) */
  kellyGentleStatus: string;
};

export type EnrichedCalendarItem = import("./campaign-calendar-item").CampaignCalendarItem & {
  kellyApprovalState: KellyApprovalState;
  cardBadge: KellyEventCardBadge;
  sortKey: number;
  latestDecision: KellyCalendarDecisionDto | null;
  hasOpenLocalCoverage: boolean;
  kellyGoogle?: KellyGoogleCockpitOverlay;
};
