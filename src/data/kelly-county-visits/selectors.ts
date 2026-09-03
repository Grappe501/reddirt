import { ARKANSAS_COUNTIES, ARKANSAS_COUNTY_COUNT } from "./arkansas-counties";
import { UNPOSTED_COMPLETED_STOPS_PENDING_RECONCILE } from "./field-totals";
import { kellyCampaignStops } from "./kelly-county-visits";
import type { KellyCampaignStop } from "./types";

const PUBLIC_STATUSES = new Set(["completed", "scheduled", "needs-review"]);

export type PublicStopFilter = {
  /** Event slugs unpublished or archived on the Scheduler. Upcoming rows only. */
  hiddenUpcomingSlugs?: Iterable<string>;
};

export function visitsAsOfYmd(): string {
  return process.env.KELLY_VISITS_AS_OF?.trim() || new Date().toISOString().slice(0, 10);
}

export function eventSlugFromCampaignStop(stop: KellyCampaignStop): string | null {
  const match = stop.notes?.match(/\/events\/([a-z0-9-]+)/i);
  return match?.[1] ?? null;
}

function hiddenUpcomingSet(filter?: PublicStopFilter): Set<string> {
  return new Set(filter?.hiddenUpcomingSlugs ?? []);
}

function isRemovedUpcomingStop(stop: KellyCampaignStop, hidden: Set<string>, asOfYmd: string): boolean {
  if (hidden.size === 0 || stop.date < asOfYmd) return false;
  const slug = eventSlugFromCampaignStop(stop);
  return Boolean(slug && hidden.has(slug));
}

export function getPublicStops(): KellyCampaignStop[] {
  return kellyCampaignStops.filter(
    (s) => s.includeOnPublicPage && PUBLIC_STATUSES.has(s.status),
  );
}

export function getCompletedPublicStops(): KellyCampaignStop[] {
  return getPublicStops()
    .filter((s) => s.status === "completed" || (s.status === "needs-review" && s.date < visitsAsOfYmd()))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getUpcomingPublicStops(filter?: PublicStopFilter): KellyCampaignStop[] {
  const hidden = hiddenUpcomingSet(filter);
  const asOfYmd = visitsAsOfYmd();
  return getPublicStops()
    .filter((s) => s.status === "scheduled" || (s.status === "needs-review" && s.date >= asOfYmd))
    .filter((s) => s.date <= "2026-11-03")
    .filter((s) => !isRemovedUpcomingStop(s, hidden, asOfYmd))
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

function todayIso(): string {
  return visitsAsOfYmd();
}

export type CountyVisitBucket = "visited" | "scheduled" | "undocumented";

export function getCountyBuckets(filter?: PublicStopFilter): Record<CountyVisitBucket, string[]> {
  const hidden = hiddenUpcomingSet(filter);
  const asOfYmd = visitsAsOfYmd();
  const visited = new Set<string>();
  const scheduled = new Set<string>();
  for (const s of getPublicStops()) {
    for (const c of s.counties) {
      if (s.status === "completed" || (s.status === "needs-review" && s.date < asOfYmd)) {
        visited.add(c);
      } else if (
        (s.status === "scheduled" || s.status === "needs-review") &&
        !isRemovedUpcomingStop(s, hidden, asOfYmd)
      ) {
        scheduled.add(c);
      }
    }
  }
  // Visited wins over scheduled
  for (const c of visited) scheduled.delete(c);
  const undocumented = ARKANSAS_COUNTIES.filter((c) => !visited.has(c) && !scheduled.has(c));
  return {
    visited: ARKANSAS_COUNTIES.filter((c) => visited.has(c)),
    scheduled: ARKANSAS_COUNTIES.filter((c) => scheduled.has(c)),
    undocumented: [...undocumented],
  };
}

export type VisitSummary = {
  visitedCounties: number;
  totalCounties: number;
  percentVisited: number;
  /** Dated public ledger rows counted as completed. */
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
};

export function getVisitSummary(filter?: PublicStopFilter): VisitSummary {
  const buckets = getCountyBuckets(filter);
  const completedStops = getCompletedPublicStops();
  const upcomingStops = getUpcomingPublicStops(filter);
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
