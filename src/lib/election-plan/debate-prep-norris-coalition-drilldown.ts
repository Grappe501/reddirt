/**
 * Server-side Norris coalition drill links (reads county election JSON).
 */

import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import {
  getGopSos2026StatewideSummary,
  listGopSos2026HighOpportunityCounties,
} from "@/lib/election-plan/load-gop-sos-2026-results";

export type NorrisCoalitionDrillLink = {
  label: string;
  href: string;
  minutes: number;
  teaser: string;
  norrisRunoffPct?: number;
};

export function getNorrisCoalitionStatewideOneLiner(): string {
  const sw = getGopSos2026StatewideSummary();
  if (!sw) {
    return "2026 GOP SOS runoff was a 918-vote statewide margin — county maps are loading from election data.";
  }
  return `Statewide GOP runoff: Hammer ${sw.runoff.hammerPct.toFixed(1)}% · Norris ${sw.runoff.norrisPct.toFixed(1)}% (${sw.runoff.marginVotes.toLocaleString()}-vote margin). Norris won ${sw.runoff.norrisCountiesWon} counties; Hammer won ${sw.runoff.hammerCountiesWon}.`;
}

export function buildNorrisCoalitionDrillLinks(limit = 6): NorrisCoalitionDrillLink[] {
  const high = listGopSos2026HighOpportunityCounties(limit);
  return high.map((row) => ({
    label: `${row.county} County`,
    href: countyPlaybookHref(row.county, row.countySlug),
    minutes: 3,
    teaser: row.analysis.headline,
    norrisRunoffPct: row.runoff.norrisPct,
  }));
}
