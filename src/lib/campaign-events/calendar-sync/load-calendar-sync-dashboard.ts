import { isGoogleCalendarConfigured, getGoogleCalendarEnv } from "@/lib/calendar/env";
import { getKellyGoogleLaneStatus, listSafeCalendarSourceStatuses } from "@/lib/calendar/google-calendar-source-status";
import { listCampaignEventRecordsByPeriod } from "../persistence/records";
import { loadNormalizedCalendarItems } from "../load-march-events";
import { buildWebsiteIntakeCalendarItem } from "../intake/website-intake-calendar";
import { buildCalendarSyncContext } from "./resolve-ledger-calendar-sync";
import { loadNormalizedJsonFreshness } from "./normalized-json-freshness";
import {
  LEDGER_CALENDAR_TRUTH_STATUSES,
  TRUTH_STATUS_LABELS,
  type LedgerCalendarTruthStatus,
} from "./calendar-sync-truth-types";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { mergePersistedMarchRow } from "../merge-persisted-row";

export type CalendarSyncDashboardSnapshot = {
  period: string;
  checkedAt: string;
  googleConfigured: boolean;
  googleEnv: { hasClientId: boolean; hasClientSecret: boolean; hasRedirectUri: boolean };
  kellyLanes: Awaited<ReturnType<typeof getKellyGoogleLaneStatus>>;
  sources: Awaited<ReturnType<typeof listSafeCalendarSourceStatuses>>;
  jsonFreshness: Awaited<ReturnType<typeof loadNormalizedJsonFreshness>>;
  countsByTruth: Record<LedgerCalendarTruthStatus, number>;
  rows: WorkbenchEventRow[];
  staleRows: WorkbenchEventRow[];
  conflictRows: WorkbenchEventRow[];
  websiteOnlyRows: WorkbenchEventRow[];
  importedOnlyRows: WorkbenchEventRow[];
  googleMatchedRows: WorkbenchEventRow[];
  readOnlyCommands: { label: string; command: string; note: string }[];
  writeDisabledNotice: string;
};

const READ_ONLY_COMMANDS = [
  {
    label: "Read-only Google ingest (Kelly tentative + confirmed)",
    command: "npm run calendar:google:sync-kelly",
    note: "Pulls from Google into GoogleCalendarEventRecord + CampaignEvent. Does not write to Google.",
  },
  {
    label: "Ensure Kelly calendar sources exist",
    command: "npm run calendar:google:ensure",
    note: "Creates/finds CalendarSource rows and OAuth targets. Run before first sync.",
  },
  {
    label: "List calendar sources (safe status)",
    command: "npm run calendar:google:list-sources",
    note: "Shows syncEnabled and refresh-token presence without secrets.",
  },
  {
    label: "Re-seed ledger month from normalized JSON",
    command: "npm run campaign-events:seed-month -- 2026-03",
    note: "Idempotent upsert for YYYY-MM after JSON or Google ingest refresh. Replace month as needed.",
  },
  {
    label: "Verify calendar sync truth (read-only)",
    command: "npm run campaign-events:verify-calendar-sync",
    note: "Counts ledger rows by truth status for a month.",
  },
] as const;

export async function loadCalendarSyncDashboard(period = "2026-03"): Promise<CalendarSyncDashboardSnapshot> {
  const [jsonFreshness, kellyLanes, sources, records, all, syncCtx] = await Promise.all([
    loadNormalizedJsonFreshness(period),
    getKellyGoogleLaneStatus(),
    listSafeCalendarSourceStatuses(),
    listCampaignEventRecordsByPeriod(period),
    loadNormalizedCalendarItems(),
    buildCalendarSyncContext(period),
  ]);

  const calendarById = new Map(all.map((item) => [item.id, item]));
  const syntheticById = new Map<string, ReturnType<typeof buildWebsiteIntakeCalendarItem>>();
  for (const record of records) {
    if (record.entrySource === "WEBSITE_ENTRY" && !calendarById.has(record.calendarSourceId)) {
      syntheticById.set(record.calendarSourceId, buildWebsiteIntakeCalendarItem(record));
    }
  }
  const allForPeers = [...all, ...syntheticById.values()];

  const countsByTruth = Object.fromEntries(
    LEDGER_CALENDAR_TRUTH_STATUSES.map((s) => [s, 0]),
  ) as Record<LedgerCalendarTruthStatus, number>;

  const rows: WorkbenchEventRow[] = [];
  for (const record of records) {
    const calendar = calendarById.get(record.calendarSourceId) ?? syntheticById.get(record.calendarSourceId);
    if (!calendar) continue;
    const row = mergePersistedMarchRow(record, calendar, allForPeers, syncCtx);
    rows.push(row);
    countsByTruth[row.calendarTruthStatus] += 1;
  }

  const env = getGoogleCalendarEnv();
  return {
    period,
    checkedAt: new Date().toISOString(),
    googleConfigured: isGoogleCalendarConfigured(),
    googleEnv: {
      hasClientId: Boolean(env.clientId),
      hasClientSecret: Boolean(env.clientSecret),
      hasRedirectUri: Boolean(env.redirectUri),
    },
    kellyLanes,
    sources,
    jsonFreshness,
    countsByTruth,
    rows,
    staleRows: rows.filter((r) => r.calendarTruthStatus === "GOOGLE_READ_STALE"),
    conflictRows: rows.filter((r) => r.calendarTruthStatus === "GOOGLE_READ_CONFLICT"),
    websiteOnlyRows: rows.filter((r) => r.calendarTruthStatus === "WEBSITE_ENTRY_ONLY"),
    importedOnlyRows: rows.filter((r) => r.calendarTruthStatus === "IMPORTED_FROM_NORMALIZED_JSON"),
    googleMatchedRows: rows.filter((r) => r.calendarTruthStatus === "GOOGLE_READ_MATCHED"),
    readOnlyCommands: [...READ_ONLY_COMMANDS],
    writeDisabledNotice:
      "Google Calendar write and tentative→official promotion are disabled in this sprint. Use read-only sync CLI, then re-seed the ledger month.",
  };
}

/** Lightweight status for dashboard cards without full row merge. */
export async function summarizeCalendarSyncForPeriod(period: string) {
  const dash = await loadCalendarSyncDashboard(period);
  return {
    period,
    jsonStale: dash.jsonFreshness.isStale,
    googleConfigured: dash.googleConfigured,
    websiteOnly: dash.countsByTruth.WEBSITE_ENTRY_ONLY,
    importedOnly: dash.countsByTruth.IMPORTED_FROM_NORMALIZED_JSON,
    googleMatched: dash.countsByTruth.GOOGLE_READ_MATCHED,
    stale: dash.countsByTruth.GOOGLE_READ_STALE,
    conflicts: dash.countsByTruth.GOOGLE_READ_CONFLICT,
    notLinked: dash.countsByTruth.NOT_LINKED,
    labels: TRUTH_STATUS_LABELS,
  };
}
