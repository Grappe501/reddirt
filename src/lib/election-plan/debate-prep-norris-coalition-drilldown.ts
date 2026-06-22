/**
 * Day 2/3 v3 — Norris coalition location intel drill-down links for Kelly's limited time.
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

export const DAY2_V3_KELLY_MINIMUM_SUMMARY =
  "Minimum path (~45 min): five ACCA study clips + trap lane 1. Optional: pick one Norris-coalition county below if you are traveling there this week.";

export const DAY3_V3_KELLY_MINIMUM_SUMMARY =
  "Minimum path (~50 min): qualification stack + claims gate. Optional: one high-opportunity county brief for local contrast lines.";

export const NORRIS_KELLY_ALIGNMENT_FRAME =
  "Norris voters wanted an outsider SOS — many agree with Kelly on direct democracy and transparency, and resist Hammer's paper-ballot mandates framed as voter oppression. Lead with service, not pile-on.";
