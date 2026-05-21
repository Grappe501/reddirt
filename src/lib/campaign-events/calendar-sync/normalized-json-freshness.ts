import { stat } from "node:fs/promises";
import path from "node:path";
import { loadNormalizedCalendarItems } from "../load-march-events";

const CALENDAR_PATH = path.join(process.cwd(), "data", "calendar-command-center", "calendar-items.normalized.json");

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export type NormalizedJsonFreshness = {
  path: string;
  exists: boolean;
  lastModifiedAt: string | null;
  lastModifiedMs: number | null;
  totalRows: number;
  monthsCovered: string[];
  isStale: boolean;
  staleReason: string | null;
  currentMonthMissing: boolean;
  checkedAt: string;
};

function monthsFromItems(items: { start: string }[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    if (item.start?.length >= 7) set.add(item.start.slice(0, 7));
  }
  return [...set].sort();
}

export async function loadNormalizedJsonFreshness(currentMonth?: string): Promise<NormalizedJsonFreshness> {
  const month = currentMonth ?? new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());

  let lastModifiedMs: number | null = null;
  let exists = false;
  try {
    const s = await stat(CALENDAR_PATH);
    exists = true;
    lastModifiedMs = s.mtimeMs;
  } catch {
    exists = false;
  }

  const items = await loadNormalizedCalendarItems();
  const monthsCovered = monthsFromItems(items);
  const currentMonthMissing = exists && items.length > 0 && !monthsCovered.includes(month);

  let isStale = false;
  let staleReason: string | null = null;
  if (!exists) {
    isStale = true;
    staleReason = "Normalized JSON file missing.";
  } else if (lastModifiedMs != null && Date.now() - lastModifiedMs > STALE_AFTER_MS) {
    isStale = true;
    staleReason = "File older than 7 days — run travel reconcile or refresh export.";
  } else if (items.length === 0) {
    isStale = true;
    staleReason = "File exists but has zero items.";
  }

  return {
    path: "data/calendar-command-center/calendar-items.normalized.json",
    exists,
    lastModifiedAt: lastModifiedMs ? new Date(lastModifiedMs).toISOString() : null,
    lastModifiedMs,
    totalRows: items.length,
    monthsCovered,
    isStale,
    staleReason,
    currentMonthMissing,
    checkedAt: new Date().toISOString(),
  };
}
