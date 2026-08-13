import { ARKANSAS_COUNTY_SVG_PATHS } from "@/data/kelly-county-visits/arkansas-county-svg-paths";
import type { CountyMapFeature } from "@/components/organizing/events-map/county-map-types";
import {
  buildCountyCampaignSummaries,
  countyAriaLabel,
  countyMapHref,
  type CountyCampaignSummary,
} from "@/lib/events/county-campaign-summary";
import type { CountyVisitLedger } from "@/lib/events/county-visit-ledger";
import type { EventItem } from "@/content/types";

export function countySummariesToMapFeatures(summaries: CountyCampaignSummary[]): CountyMapFeature[] {
  const byKey = new Map(summaries.map((s) => [s.countyKey, s]));
  return ARKANSAS_COUNTY_SVG_PATHS.map((path) => {
    const summary = byKey.get(path.key);
    if (!summary) {
      throw new Error(`Missing county summary for SVG key ${path.key}`);
    }
    const upcoming = [...summary.confirmedUpcomingEvents, ...summary.tentativeUpcomingEvents];
    const upcomingHeading = summary.confirmedUpcomingEvents.length
      ? "Upcoming"
      : summary.tentativeUpcomingEvents.length
        ? "Tentative"
        : null;
    return {
      key: path.key,
      name: path.name,
      d: path.d,
      publicState: summary.publicState,
      upcomingIndicator: summary.upcomingIndicator,
      visited: summary.visited,
      href: countyMapHref(summary),
      ariaLabel: countyAriaLabel(summary),
      visitedLabel: summary.visited ? `Visited: Yes${summary.visitCount > 1 ? ` (${summary.visitCount} stops)` : ""}` : "Not yet visited",
      upcomingHeading,
      upcomingLines: upcoming.map((ev) => ({ href: ev.href, text: ev.line })),
    };
  });
}

export function buildEventsMapModel(ledger: CountyVisitLedger, events: EventItem[], now?: Date) {
  const summaries = buildCountyCampaignSummaries({ ledger, events, now });
  return { summaries, features: countySummariesToMapFeatures(summaries) };
}
