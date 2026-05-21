import type { CampaignEventLedgerRecord, GoogleCalendarEventRecord } from "@prisma/client";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { prisma } from "@/lib/db";
import type { LedgerCalendarSyncMeta } from "./calendar-sync-meta";
import {
  matchCalendarTruthToLedger,
  type CalendarTruthMatchResult,
} from "./match-calendar-truth-to-ledger";
import { loadNormalizedJsonFreshness, type NormalizedJsonFreshness } from "./normalized-json-freshness";
import type { LedgerCalendarTruthStatus } from "./calendar-sync-truth-types";

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

export type LedgerCalendarSyncResolution = LedgerCalendarSyncMeta & {
  match: CalendarTruthMatchResult;
  badgeLabel: string;
  showWriteDisabled: boolean;
};

function resolveTruthStatus(
  record: CampaignEventLedgerRecord,
  match: CalendarTruthMatchResult,
  hasGoogle: boolean,
): LedgerCalendarTruthStatus {
  if (record.googleSyncStatus === "ERROR" || match.syncError) return "ERROR";
  if (record.officialCalendarId || record.calendarStatus === "OFFICIAL_CALENDAR") {
    if (hasGoogle || record.googleEventId) return "OFFICIAL_CALENDAR_READY";
  }
  if (record.tentativeCalendarId || record.calendarStatus === "TENTATIVE_CALENDAR") {
    if (record.entrySource === "WEBSITE_ENTRY" || hasGoogle) return "TENTATIVE_CALENDAR_READY";
  }

  if (record.entrySource === "WEBSITE_ENTRY" && !hasGoogle && !record.googleEventId) {
    return "WEBSITE_ENTRY_ONLY";
  }

  if (
    (record.entrySource === "NORMALIZED_CALENDAR" || record.createdFromSource === "NORMALIZED_CALENDAR") &&
    !hasGoogle &&
    !record.googleEventId
  ) {
    return "IMPORTED_FROM_NORMALIZED_JSON";
  }

  if (match.titleMismatch || match.startMismatch) return "GOOGLE_READ_CONFLICT";

  if (hasGoogle || record.googleEventId) {
    const seen = match.lastGoogleSeenAt ? new Date(match.lastGoogleSeenAt).getTime() : 0;
    const ledgerUpdated = record.updatedAt.getTime();
    if (seen > 0 && Date.now() - seen > STALE_MS) return "GOOGLE_READ_STALE";
    if (ledgerUpdated - seen > STALE_MS && seen > 0) return "GOOGLE_READ_STALE";
    if (match.syncWarning?.includes("newer than normalized")) return "GOOGLE_READ_STALE";
    return "GOOGLE_READ_MATCHED";
  }

  return "NOT_LINKED";
}

export function resolveLedgerCalendarSync(input: {
  record: CampaignEventLedgerRecord;
  calendar: CampaignCalendarItem | null;
  googleRecord: GoogleCalendarEventRecord | null;
  jsonFreshness: NormalizedJsonFreshness;
}): LedgerCalendarSyncResolution {
  const match = matchCalendarTruthToLedger(input);
  const hasGoogle = Boolean(input.googleRecord || input.record.googleEventId);
  const truthStatus = resolveTruthStatus(input.record, match, hasGoogle);

  const meta: LedgerCalendarSyncMeta = {
    version: 1,
    truthStatus,
    matchedBy: match.matchedBy,
    googleEventId: match.googleEventId ?? input.record.googleEventId,
    googleCalendarId: match.googleCalendarId,
    googleEventUrl: match.googleEventUrl ?? input.record.googleEventUrl,
    sourceCalendarName: input.record.sourceCalendarName,
    prismaGoogleSyncStatus: input.record.googleSyncStatus,
    lastGoogleSeenAt: match.lastGoogleSeenAt,
    lastLedgerUpdatedAt: input.record.updatedAt.toISOString(),
    normalizedJsonSourceAt: input.jsonFreshness.lastModifiedAt,
    syncWarning: match.syncWarning,
    syncError: match.syncError,
    writeEnabled: false,
    computedAt: new Date().toISOString(),
  };

  return {
    ...meta,
    match,
    badgeLabel: truthStatus.replaceAll("_", " ").toLowerCase(),
    showWriteDisabled: true,
  };
}

export type CalendarSyncContext = {
  jsonFreshness: NormalizedJsonFreshness;
  gcalByGoogleEventId: Map<string, GoogleCalendarEventRecord>;
};

export async function buildCalendarSyncContext(period?: string): Promise<CalendarSyncContext> {
  const jsonFreshness = await loadNormalizedJsonFreshness(period);
  const gcalRows = await prisma.googleCalendarEventRecord.findMany({
    select: {
      id: true,
      calendarSourceId: true,
      googleEventId: true,
      summary: true,
      startAt: true,
      endAt: true,
      updatedGoogleAt: true,
      updatedAt: true,
      htmlLink: true,
    },
    take: 5000,
    orderBy: { updatedAt: "desc" },
  });
  const gcalByGoogleEventId = new Map<string, GoogleCalendarEventRecord>();
  for (const row of gcalRows) {
    gcalByGoogleEventId.set(row.googleEventId, row as GoogleCalendarEventRecord);
    if (row.googleEventId.startsWith("gcal-")) {
      gcalByGoogleEventId.set(row.googleEventId.replace(/^gcal-/, ""), row as GoogleCalendarEventRecord);
    }
  }
  return { jsonFreshness, gcalByGoogleEventId };
}

export function lookupGoogleRecordForLedger(
  record: CampaignEventLedgerRecord,
  calendar: CampaignCalendarItem | null,
  ctx: CalendarSyncContext,
): GoogleCalendarEventRecord | null {
  if (record.googleEventId) {
    const hit = ctx.gcalByGoogleEventId.get(record.googleEventId);
    if (hit) return hit;
  }
  const fromCal = calendar?.sourceId?.trim();
  if (fromCal) {
    const hit = ctx.gcalByGoogleEventId.get(fromCal);
    if (hit) return hit;
  }
  return null;
}
