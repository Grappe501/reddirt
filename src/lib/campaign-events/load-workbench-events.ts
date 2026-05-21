import { MARCH_2026_LEDGER_PERIOD } from "./constants";
import { loadNormalizedCalendarItems } from "./load-march-events";
import { mergePersistedMarchRow, type WorkbenchEventRow } from "./merge-persisted-row";
import { ensureCampaignEventRecordsForPeriod, listCampaignEventRecordsByPeriod } from "./persistence/records";
import { buildWebsiteIntakeCalendarItem } from "./intake/website-intake-calendar";

export type WorkbenchLoadOptions = {
  /** Ledger month bucket e.g. `2026-03`. Defaults to March 2026 pilot. */
  period?: string;
  /** Skip auto-seed on load (used by verification after explicit seed). */
  skipAutoSeed?: boolean;
};

export type WorkbenchLoadResult = {
  period: string;
  rows: WorkbenchEventRow[];
  seed: { scanned: number; created: number; updated: number };
};

export async function loadCampaignEventsWorkbench(
  options: WorkbenchLoadOptions = {},
): Promise<WorkbenchLoadResult> {
  const period = options.period ?? MARCH_2026_LEDGER_PERIOD;
  const seed = options.skipAutoSeed
    ? { period, scanned: 0, created: 0, updated: 0 }
    : await ensureCampaignEventRecordsForPeriod(period);
  const all = await loadNormalizedCalendarItems();
  const records = await listCampaignEventRecordsByPeriod(period);
  const calendarById = new Map(all.map((item) => [item.id, item]));

  const syntheticById = new Map<string, ReturnType<typeof buildWebsiteIntakeCalendarItem>>();
  for (const record of records) {
    if (record.entrySource === "WEBSITE_ENTRY" && !calendarById.has(record.calendarSourceId)) {
      syntheticById.set(record.calendarSourceId, buildWebsiteIntakeCalendarItem(record));
    }
  }
  const allForPeers = [...all, ...syntheticById.values()];

  const rows: WorkbenchEventRow[] = [];
  for (const record of records) {
    const calendar = calendarById.get(record.calendarSourceId) ?? syntheticById.get(record.calendarSourceId);
    if (!calendar) continue;
    rows.push(mergePersistedMarchRow(record, calendar, allForPeers));
  }

  rows.sort((a, b) => a.startAtMs - b.startAtMs || a.calendar.title.localeCompare(b.calendar.title));
  return { period, rows, seed };
}

export function serializeWorkbenchRows(rows: WorkbenchEventRow[]): WorkbenchEventRow[] {
  return JSON.parse(JSON.stringify(rows)) as WorkbenchEventRow[];
}
