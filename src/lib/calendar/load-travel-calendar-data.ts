import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  CampaignCalendarItem,
  CountyMeetingTentativeRow,
  CountyPrioritySnapshotRow,
  FestivalLeadVerifiedRow,
} from "./campaign-calendar-item";

const DATA = "data/calendar-command-center";

function readJson<T>(name: string): T | null {
  const p = path.join(process.cwd(), DATA, name);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

export function loadTravelCalendarItems(): CampaignCalendarItem[] {
  return readJson<CampaignCalendarItem[]>("calendar-items.normalized.json") ?? [];
}

export function loadCountyPrioritySnapshot(): CountyPrioritySnapshotRow[] {
  return readJson<CountyPrioritySnapshotRow[]>("county-priority-snapshot.json") ?? [];
}

export function loadFestivalLeadsVerified(): FestivalLeadVerifiedRow[] {
  return readJson<FestivalLeadVerifiedRow[]>("festival-leads.verified.json") ?? [];
}

export function loadCountyMeetingsTentative(): CountyMeetingTentativeRow[] {
  return readJson<CountyMeetingTentativeRow[]>("county-meetings.tentative.json") ?? [];
}

export function travelCalendarDataPresent(): boolean {
  return existsSync(path.join(process.cwd(), DATA, "calendar-items.normalized.json"));
}

export type CountyFactsFileRow = {
  countySeat: string;
  population: string;
  povertyRate: string;
  unemploymentRate: string;
  registeredVoters: string;
  recentTurnout: string;
  countyMeetingStatus: string;
};

export function loadCountyFactsByKey(): Record<string, CountyFactsFileRow> {
  const raw = readJson<{ version: number; byCountyKey: Record<string, CountyFactsFileRow> }>("county-facts.json");
  return raw?.byCountyKey ?? {};
}

export function loadCountyTouchMap(): Map<string, { touches: number; lastYmd: string }> {
  const raw = readJson<[string, { touches: number; lastYmd: string }][]>("county-touch-summary.json") ?? [];
  const m = new Map<string, { touches: number; lastYmd: string }>();
  for (const row of raw) {
    if (Array.isArray(row) && row.length >= 2 && typeof row[0] === "string" && row[1] && typeof row[1] === "object") {
      m.set(row[0], row[1] as { touches: number; lastYmd: string });
    }
  }
  return m;
}

export function filterCalendarItemsInWindow(
  items: CampaignCalendarItem[],
  startMs: number,
  endExclusiveMs: number,
): CampaignCalendarItem[] {
  return items.filter((i) => {
    const t = new Date(i.start).getTime();
    return t >= startMs && t < endExclusiveMs;
  });
}
