import { endOfDay, parseISO, startOfDay } from "date-fns";
import { ELECTION_DAY_2026 } from "@/lib/campaign-dates";
import { loadNormalizedCalendarItems } from "./load-march-events";
import { buildCalendarSyncContext, mergePersistedMarchRow, type WorkbenchEventRow } from "./merge-persisted-row";
import { LEDGER_PERIOD_QUICK_LINKS } from "./constants";
import { ensureCampaignEventRecordsForPeriod } from "./persistence/records";
import { prisma } from "@/lib/db";
import { buildCalendarEventFlags, type CalendarEventSurfaceMeta } from "./calendar-event-flags";
import { resolveCalendarLanes, type CalendarLaneResolution } from "./calendar-lane";
import type { CampaignEventLedgerRecord } from "@prisma/client";
import { buildWebsiteIntakeCalendarItem } from "./intake/website-intake-calendar";

export type CalendarSurfaceRow = WorkbenchEventRow & {
  surface: CalendarEventSurfaceMeta;
  lanes: CalendarLaneResolution;
};

export type CampaignCalendarLoadResult = {
  rows: CalendarSurfaceRow[];
  electionDayYmd: string;
  nowMs: number;
  seed: { scanned: number; created: number; updated: number };
};

async function mergeRecordToSurfaceRow(
  record: CampaignEventLedgerRecord,
  calendarById: Map<string, import("@/lib/calendar/campaign-calendar-item").CampaignCalendarItem>,
  syntheticById: Map<string, import("@/lib/calendar/campaign-calendar-item").CampaignCalendarItem>,
  allForPeers: import("@/lib/calendar/campaign-calendar-item").CampaignCalendarItem[],
  syncCtx: Awaited<ReturnType<typeof buildCalendarSyncContext>>,
  nowMs: number,
): Promise<CalendarSurfaceRow | null> {
  const calendar = calendarById.get(record.calendarSourceId) ?? syntheticById.get(record.calendarSourceId);
  if (!calendar) return null;
  const base = mergePersistedMarchRow(record, calendar, allForPeers, syncCtx);
  return {
    ...base,
    surface: buildCalendarEventFlags(base, record, nowMs),
    lanes: resolveCalendarLanes(record),
  };
}

export async function loadCampaignCalendarSurface(): Promise<CampaignCalendarLoadResult> {
  let seedResult = { scanned: 0, created: 0, updated: 0 };
  for (const period of LEDGER_PERIOD_QUICK_LINKS) {
    const r = await ensureCampaignEventRecordsForPeriod(period);
    seedResult = {
      scanned: seedResult.scanned + r.scanned,
      created: seedResult.created + r.created,
      updated: seedResult.updated + r.updated,
    };
  }
  const electionEnd = endOfDay(parseISO(ELECTION_DAY_2026));
  const nowMs = Date.now();

  const records = await prisma.campaignEventLedgerRecord.findMany({
    where: { startAt: { lte: electionEnd } },
    orderBy: { startAt: "asc" },
  });

  const all = await loadNormalizedCalendarItems();
  const calendarById = new Map(all.map((item) => [item.id, item]));
  const syntheticById = new Map<string, ReturnType<typeof buildWebsiteIntakeCalendarItem>>();
  for (const record of records) {
    if (record.entrySource === "WEBSITE_ENTRY" && !calendarById.has(record.calendarSourceId)) {
      syntheticById.set(record.calendarSourceId, buildWebsiteIntakeCalendarItem(record));
    }
  }
  const allForPeers = [...all, ...syntheticById.values()];
  const syncCtx = await buildCalendarSyncContext();

  const rows: CalendarSurfaceRow[] = [];
  for (const record of records) {
    const row = await mergeRecordToSurfaceRow(record, calendarById, syntheticById, allForPeers, syncCtx, nowMs);
    if (row) rows.push(row);
  }

  return {
    rows,
    electionDayYmd: ELECTION_DAY_2026,
    nowMs,
    seed: { scanned: seedResult.scanned, created: seedResult.created, updated: seedResult.updated },
  };
}

export function serializeCalendarRows(rows: CalendarSurfaceRow[]): CalendarSurfaceRow[] {
  return JSON.parse(JSON.stringify(rows)) as CalendarSurfaceRow[];
}

export function getCalendarRowByRecordId(
  rows: CalendarSurfaceRow[],
  recordId: string,
): CalendarSurfaceRow | undefined {
  return rows.find((r) => r.recordId === recordId);
}

export async function loadCalendarEventDrilldown(recordId: string): Promise<{
  row: CalendarSurfaceRow;
  record: CampaignEventLedgerRecord;
} | null> {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) return null;
  const all = await loadNormalizedCalendarItems();
  const calendarById = new Map(all.map((item) => [item.id, item]));
  const syntheticById = new Map<string, ReturnType<typeof buildWebsiteIntakeCalendarItem>>();
  if (record.entrySource === "WEBSITE_ENTRY" && !calendarById.has(record.calendarSourceId)) {
    syntheticById.set(record.calendarSourceId, buildWebsiteIntakeCalendarItem(record));
  }
  const allForPeers = [...all, ...syntheticById.values()];
  const period = record.period;
  const syncCtx = await buildCalendarSyncContext(period);
  const nowMs = Date.now();
  const row = await mergeRecordToSurfaceRow(record, calendarById, syntheticById, allForPeers, syncCtx, nowMs);
  if (!row) return null;
  return { row, record };
}
