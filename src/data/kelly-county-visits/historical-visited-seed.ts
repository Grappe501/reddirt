import { ARKANSAS_COUNTIES, type ArkansasCountyName } from "./arkansas-counties";
import { kellyCampaignStops } from "./kelly-county-visits";

/** Public visit snapshot used by the county ledger. */
export const HISTORICAL_VISIT_SNAPSHOT_AS_OF = "2026-09-02";

function normalizeName(raw: string): ArkansasCountyName | null {
  const hit = ARKANSAS_COUNTIES.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  return hit ?? null;
}

function visitedAsOfSnapshot(): ArkansasCountyName[] {
  const names = new Set<ArkansasCountyName>();
  for (const stop of kellyCampaignStops) {
    if (!stop.includeOnPublicPage) continue;
    if (stop.date > HISTORICAL_VISIT_SNAPSHOT_AS_OF) continue;
    const completed =
      stop.status === "completed" ||
      (stop.status === "needs-review" && stop.date < HISTORICAL_VISIT_SNAPSHOT_AS_OF);
    if (!completed) continue;
    for (const raw of stop.counties) {
      const name = normalizeName(raw);
      if (name) names.add(name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export const HISTORICAL_VISITED_COUNTIES: readonly ArkansasCountyName[] = visitedAsOfSnapshot();

export function isHistoricalVisitedCounty(name: ArkansasCountyName): boolean {
  return HISTORICAL_VISITED_COUNTIES.includes(name);
}

export function isHistoricalUnvisitedCounty(name: ArkansasCountyName): boolean {
  return !isHistoricalVisitedCounty(name);
}
