import type { CampaignEventLedgerRecord, GoogleCalendarEventRecord } from "@prisma/client";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { CalendarMatchMethod } from "./calendar-sync-truth-types";
import type { NormalizedJsonFreshness } from "./normalized-json-freshness";

export type CalendarTruthMatchInput = {
  record: CampaignEventLedgerRecord;
  calendar: CampaignCalendarItem | null;
  googleRecord: GoogleCalendarEventRecord | null;
  jsonFreshness: NormalizedJsonFreshness;
};

export type CalendarTruthMatchResult = {
  matchedBy: CalendarMatchMethod;
  googleEventId: string | null;
  googleCalendarId: string | null;
  googleEventUrl: string | null;
  lastGoogleSeenAt: string | null;
  syncWarning: string | null;
  syncError: string | null;
  titleMismatch: boolean;
  startMismatch: boolean;
};

function normTitle(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function sameYmd(a: Date | string, b: Date | string): boolean {
  const ax = typeof a === "string" ? a.slice(0, 10) : a.toISOString().slice(0, 10);
  const bx = typeof b === "string" ? b.slice(0, 10) : b.toISOString().slice(0, 10);
  return ax === bx;
}

function titleSimilar(a: string, b: string): boolean {
  const x = normTitle(a);
  const y = normTitle(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return x.includes(y) || y.includes(x);
}

export function matchCalendarTruthToLedger(input: CalendarTruthMatchInput): CalendarTruthMatchResult {
  const { record, calendar, googleRecord, jsonFreshness } = input;
  const base: CalendarTruthMatchResult = {
    matchedBy: "none",
    googleEventId: record.googleEventId,
    googleCalendarId: null,
    googleEventUrl: record.googleEventUrl,
    lastGoogleSeenAt: null,
    syncWarning: null,
    syncError: null,
    titleMismatch: false,
    startMismatch: false,
  };

  if (record.googleSyncStatus === "ERROR") {
    return { ...base, syncError: "Ledger googleSyncStatus is ERROR — check last sync logs." };
  }

  if (googleRecord) {
    base.matchedBy = record.googleEventId === googleRecord.googleEventId ? "googleEventId" : "title_date";
    base.googleEventId = googleRecord.googleEventId;
    base.googleCalendarId = googleRecord.calendarSourceId;
    base.googleEventUrl = googleRecord.htmlLink ?? record.googleEventUrl;
    base.lastGoogleSeenAt = googleRecord.updatedGoogleAt?.toISOString() ?? googleRecord.updatedAt.toISOString();

    const ledgerTitle = record.originalTitle;
    const gTitle = googleRecord.summary ?? "";
    if (!titleSimilar(ledgerTitle, gTitle)) {
      base.titleMismatch = true;
      base.syncWarning = `Title differs: ledger “${ledgerTitle}” vs Google “${gTitle}”.`;
    }

    if (googleRecord.startAt && !sameYmd(record.startAt, googleRecord.startAt)) {
      base.startMismatch = true;
      base.syncWarning = [base.syncWarning, "Start date differs between ledger and Google read."].filter(Boolean).join(" ");
    }

    if (
      jsonFreshness.lastModifiedMs &&
      googleRecord.updatedGoogleAt &&
      googleRecord.updatedGoogleAt.getTime() > jsonFreshness.lastModifiedMs + 60_000
    ) {
      base.syncWarning = [base.syncWarning, "Google ingest newer than normalized JSON file."].filter(Boolean).join(" ");
    }

    return base;
  }

  if (record.googleEventId) {
    return {
      ...base,
      matchedBy: "googleEventId",
      syncWarning: `googleEventId ${record.googleEventId} on ledger but no GoogleCalendarEventRecord row found.`,
    };
  }

  if (calendar?.sourceId && calendar.source === "google_calendar") {
    return {
      ...base,
      matchedBy: "calendarSourceId",
      googleEventId: calendar.sourceId,
      syncWarning: "Normalized JSON references Google id but no DB ingest row matched.",
    };
  }

  if (calendar && sameYmd(record.startAt, calendar.start) && titleSimilar(record.originalTitle, calendar.title)) {
    return { ...base, matchedBy: "title_date" };
  }

  const city = calendar?.city ?? record.displayCity;
  if (
    calendar &&
    city &&
    sameYmd(record.startAt, calendar.start) &&
    titleSimilar(record.originalTitle, calendar.title)
  ) {
    return { ...base, matchedBy: "title_location_date" };
  }

  if (record.sourceKey.startsWith("website_entry:")) {
    return { ...base, matchedBy: "sourceKey" };
  }

  if (record.sourceKey.startsWith("normalized_calendar:")) {
    return { ...base, matchedBy: "sourceKey" };
  }

  return base;
}
