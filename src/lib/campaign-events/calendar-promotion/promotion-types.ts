/** Ledger calendar promotion lifecycle (Sprint 5). */
export type CalendarPromotionStatus =
  | "WEBSITE_ENTRY_ONLY"
  | "TENTATIVE_INTERNAL"
  | "READY_FOR_TENTATIVE_PROMOTION"
  | "PROMOTED_TO_TENTATIVE"
  | "READY_FOR_OFFICIAL_PROMOTION"
  | "PROMOTED_TO_OFFICIAL"
  | "PROMOTION_FAILED"
  | "PROMOTION_CONFLICT"
  | "PROMOTION_BLOCKED";

export type PromotionReadinessLevel = "READY" | "WARNING" | "BLOCKED";

export type PromotionTargetLane = "tentative" | "official";

export type LedgerCalendarPromotionMeta = {
  version: 1;
  promotionStatus: CalendarPromotionStatus;
  tentativeGoogleEventId: string | null;
  officialGoogleEventId: string | null;
  tentativePromotedAt: string | null;
  officialPromotedAt: string | null;
  promotedBy: string | null;
  promotionError: string | null;
  promotionAttemptCount: number;
  lastPromotionAttemptAt: string | null;
  lastTargetLane: PromotionTargetLane | null;
};

export type PromotionReadinessResult = {
  level: PromotionReadinessLevel;
  blockers: string[];
  warnings: string[];
  missingItems: string[];
  promotionStatus: CalendarPromotionStatus;
  suggestedTargetLane: PromotionTargetLane | null;
};

export type GooglePayloadPreview = {
  calendarTarget: string;
  calendarSourceLabel: string;
  lane: PromotionTargetLane;
  title: string;
  description: string;
  location: string;
  startIso: string;
  endIso: string;
  allDay: boolean;
  timezone: string;
  visibility: string;
  reminders: string;
  attendees: string;
  travelNotes: string | null;
  extendedProperties: Record<string, string>;
  aiSummary: string;
  warnings: string[];
  missingFields: string[];
  conflictNotes: string[];
};

export type PromotionAttemptResult = {
  ok: boolean;
  dryRun: boolean;
  status: "succeeded" | "failed" | "blocked" | "skipped_disabled" | "dry_run";
  targetLane: PromotionTargetLane;
  googleEventId?: string;
  googleEventUrl?: string;
  error?: string;
  payload?: GooglePayloadPreview;
  readiness: PromotionReadinessResult;
};
