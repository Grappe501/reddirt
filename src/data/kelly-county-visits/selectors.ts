import { ARKANSAS_COUNTIES, ARKANSAS_COUNTY_COUNT } from "./arkansas-counties";
import { UNPOSTED_COMPLETED_STOPS_PENDING_RECONCILE } from "./field-totals";
import { kellyCampaignStops } from "./kelly-county-visits";
import type { KellyCampaignStop } from "./types";

const PUBLIC_STATUSES = new Set(["completed", "scheduled", "needs-review"]);

export function getPublicStops(): KellyCampaignStop[] {
  return kellyCampaignStops.filter(
    (s) => s.includeOnPublicPage && PUBLIC_STATUSES.has(s.status),
  );
}

export function getCompletedPublicStops(): KellyCampaignStop[] {
  return getPublicStops()
    .filter((s) => s.status === "completed" || (s.status === "needs-review" && s.date < todayIso()))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getUpcomingPublicStops(): KellyCampaignStop[] {
  return getPublicStops()
    .filter((s) => s.status === "scheduled" || (s.status === "needs-review" && s.date >= todayIso()))
    .filter((s) => s.date <= "2026-11-03")
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

function todayIso(): string {
  // Campaign reference day for Pass 1 status display; override via env if needed.
  return process.env.KELLY_VISITS_AS_OF?.trim() || new Date().toISOString().slice(0, 10);
}

export type CountyVisitBucket = "visited" | "scheduled" | "undocumented";
/** Map paint: navy fill, gold fill, or navy fill + gold outline when both. */
export type CountyVisitPaint = "visited" | "scheduled" | "visited-scheduled" | "undocumented";

export function getCountyVisitSets(): { visited: Set<string>; scheduled: Set<string> } {
  const visited = new Set<string>();
  const scheduled = new Set<string>();
  for (const s of getPublicStops()) {
    for (const c of s.counties) {
      if (s.status === "completed" || (s.status === "needs-review" && s.date < todayIso())) {
        visited.add(c);
      } else if (s.status === "scheduled" || s.status === "needs-review") {
        scheduled.add(c);
      }
    }
  }
  return { visited, scheduled };
}

function paintFor(name: string, visited: Set<string>, scheduled: Set<string>): CountyVisitPaint {
  const isVisited = visited.has(name);
  const isScheduled = scheduled.has(name);
  if (isVisited && isScheduled) return "visited-scheduled";
  if (isVisited) return "visited";
  if (isScheduled) return "scheduled";
  return "undocumented";
}

export function getCountyPaint(name: string): CountyVisitPaint {
  const { visited, scheduled } = getCountyVisitSets();
  return paintFor(name, visited, scheduled);
}

export function getCountyPaintMap(): Record<string, CountyVisitPaint> {
  const { visited, scheduled } = getCountyVisitSets();
  const out: Record<string, CountyVisitPaint> = {};
  for (const name of ARKANSAS_COUNTIES) out[name] = paintFor(name, visited, scheduled);
  return out;
}

export function getCountyBuckets(): Record<CountyVisitBucket, string[]> {
  const { visited, scheduled } = getCountyVisitSets();
  const scheduledOnly = ARKANSAS_COUNTIES.filter((c) => scheduled.has(c) && !visited.has(c));
  const undocumented = ARKANSAS_COUNTIES.filter((c) => !visited.has(c) && !scheduled.has(c));
  return {
    visited: ARKANSAS_COUNTIES.filter((c) => visited.has(c)),
    scheduled: scheduledOnly,
    undocumented: [...undocumented],
  };
}

export type VisitSummary = {
  visitedCounties: number;
  totalCounties: number;
  percentVisited: number;
  /** Dated public ledger rows marked completed. */
  completedLedgerCount: number;
  /** Same-day / unposted completed stops still waiting on a ledger row. */
  completedUnpostedCount: number;
  /** Field total: dated ledger + unposted pending reconcile. */
  completedStopCount: number;
  scheduledStopCount: number;
  /** Lifetime public stops (completed + upcoming through Election Day). */
  totalPublicStopCount: number;
  needsReviewCount: number;
  buckets: Record<CountyVisitBucket, string[]>;
  /** Visited counties that also have an upcoming public stop (gold outline on navy). */
  returningCounties: string[];
};

export function getVisitSummary(): VisitSummary {
  const buckets = getCountyBuckets();
  const { visited, scheduled } = getCountyVisitSets();
  const completedStops = getCompletedPublicStops();
  const upcomingStops = getUpcomingPublicStops();
  const needsReview = getPublicStops().filter(
    (s) => s.status === "needs-review" || s.counties.length === 0,
  );
  const visitedCount = buckets.visited.length;
  const completedLedgerCount = completedStops.length;
  const completedUnpostedCount = UNPOSTED_COMPLETED_STOPS_PENDING_RECONCILE;
  const completedStopCount = completedLedgerCount + completedUnpostedCount;
  return {
    visitedCounties: visitedCount,
    totalCounties: ARKANSAS_COUNTY_COUNT,
    percentVisited: Math.round((visitedCount / ARKANSAS_COUNTY_COUNT) * 1000) / 10,
    completedLedgerCount,
    completedUnpostedCount,
    completedStopCount,
    scheduledStopCount: upcomingStops.length,
    totalPublicStopCount: completedStopCount + upcomingStops.length,
    needsReviewCount: needsReview.length,
    buckets,
    returningCounties: ARKANSAS_COUNTIES.filter((c) => visited.has(c) && scheduled.has(c)),
  };
}

export function displayTitle(stop: KellyCampaignStop): string {
  return stop.publicTitle?.trim() || stop.title;
}

export function formatStopDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}
