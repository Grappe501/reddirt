import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { loadCampaignEventsWorkbench } from "./load-workbench-events";
import type { WorkbenchEventRow } from "./merge-persisted-row";

export type PersistedMarchEventRow = WorkbenchEventRow;

const CALENDAR_PATH = path.join(process.cwd(), "data", "calendar-command-center", "calendar-items.normalized.json");

export async function loadNormalizedCalendarItems(): Promise<CampaignCalendarItem[]> {
  try {
    const raw = await readFile(CALENDAR_PATH, "utf8");
    return JSON.parse(raw) as CampaignCalendarItem[];
  } catch (error) {
    console.warn("March campaign events: calendar JSON read failed:", error);
    return [];
  }
}

export async function loadMarch2026CampaignEvents(): Promise<{
  rows: PersistedMarchEventRow[];
  seed: { scanned: number; created: number; updated: number };
}> {
  const result = await loadCampaignEventsWorkbench();
  return { rows: result.rows, seed: result.seed };
}

export function groupEventsByDay(rows: PersistedMarchEventRow[]): Map<string, PersistedMarchEventRow[]> {
  const map = new Map<string, PersistedMarchEventRow[]>();
  for (const row of rows) {
    const list = map.get(row.dateYmd) ?? [];
    list.push(row);
    map.set(row.dateYmd, list);
  }
  return map;
}

export function formatLedgerDayHeading(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
