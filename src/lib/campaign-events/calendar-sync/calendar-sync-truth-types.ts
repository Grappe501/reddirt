/** Operator-facing calendar truth (Sprint 3). Distinct from Prisma `googleSyncStatus` on the row. */
export const LEDGER_CALENDAR_TRUTH_STATUSES = [
  "NOT_LINKED",
  "IMPORTED_FROM_NORMALIZED_JSON",
  "WEBSITE_ENTRY_ONLY",
  "GOOGLE_READ_MATCHED",
  "GOOGLE_READ_STALE",
  "GOOGLE_READ_CONFLICT",
  "TENTATIVE_CALENDAR_READY",
  "OFFICIAL_CALENDAR_READY",
  "WRITE_NOT_ENABLED",
  "ERROR",
] as const;

export type LedgerCalendarTruthStatus = (typeof LEDGER_CALENDAR_TRUTH_STATUSES)[number];

export const CALENDAR_MATCH_METHODS = [
  "none",
  "googleEventId",
  "calendarSourceId",
  "sourceKey",
  "title_date",
  "title_location_date",
  "manual",
] as const;

export type CalendarMatchMethod = (typeof CALENDAR_MATCH_METHODS)[number];

export const TRUTH_STATUS_LABELS: Record<LedgerCalendarTruthStatus, string> = {
  NOT_LINKED: "Not linked",
  IMPORTED_FROM_NORMALIZED_JSON: "Imported JSON",
  WEBSITE_ENTRY_ONLY: "Website only",
  GOOGLE_READ_MATCHED: "Google matched",
  GOOGLE_READ_STALE: "Google stale",
  GOOGLE_READ_CONFLICT: "Google conflict",
  TENTATIVE_CALENDAR_READY: "Tentative ready",
  OFFICIAL_CALENDAR_READY: "Official ready",
  WRITE_NOT_ENABLED: "Write disabled",
  ERROR: "Sync error",
};

export const TRUTH_STATUS_TONE: Record<
  LedgerCalendarTruthStatus,
  "neutral" | "amber" | "green" | "red" | "navy" | "slate"
> = {
  NOT_LINKED: "neutral",
  IMPORTED_FROM_NORMALIZED_JSON: "slate",
  WEBSITE_ENTRY_ONLY: "navy",
  GOOGLE_READ_MATCHED: "green",
  GOOGLE_READ_STALE: "amber",
  GOOGLE_READ_CONFLICT: "red",
  TENTATIVE_CALENDAR_READY: "amber",
  OFFICIAL_CALENDAR_READY: "green",
  WRITE_NOT_ENABLED: "slate",
  ERROR: "red",
};
