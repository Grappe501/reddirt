import type { ArkansasCountyName } from "./arkansas-counties";
import { ARKANSAS_COUNTIES, ARKANSAS_COUNTY_COUNT } from "./arkansas-counties";

/**
 * Frozen campaign-history snapshot (as-of 2026-08-13, America/Chicago).
 * Source: existing Kelly county-visit ledger selectors — not the unlabeled Regnat Populus PNG.
 * Howard is scheduled-only and is not in the visited set.
 */
export const HISTORICAL_VISIT_SNAPSHOT_AS_OF = "2026-08-13";

export const HISTORICAL_VISITED_COUNTIES = [
  "Arkansas",
  "Baxter",
  "Benton",
  "Boone",
  "Bradley",
  "Carroll",
  "Clark",
  "Clay",
  "Cleburne",
  "Cleveland",
  "Columbia",
  "Conway",
  "Craighead",
  "Crawford",
  "Cross",
  "Desha",
  "Drew",
  "Faulkner",
  "Franklin",
  "Fulton",
  "Garland",
  "Grant",
  "Greene",
  "Hempstead",
  "Hot Spring",
  "Independence",
  "Izard",
  "Johnson",
  "Lafayette",
  "Lee",
  "Lonoke",
  "Marion",
  "Mississippi",
  "Montgomery",
  "Nevada",
  "Ouachita",
  "Pike",
  "Poinsett",
  "Polk",
  "Pope",
  "Pulaski",
  "Saline",
  "Searcy",
  "Sebastian",
  "Sharp",
  "Stone",
  "Union",
  "Van Buren",
  "Washington",
  "White",
  "Yell",
] as const satisfies readonly ArkansasCountyName[];

export const HISTORICAL_UNVISITED_COUNTIES = [
  "Ashley",
  "Calhoun",
  "Chicot",
  "Crittenden",
  "Dallas",
  "Jackson",
  "Jefferson",
  "Lawrence",
  "Lincoln",
  "Little River",
  "Logan",
  "Madison",
  "Miller",
  "Monroe",
  "Newton",
  "Perry",
  "Phillips",
  "Prairie",
  "Randolph",
  "St. Francis",
  "Scott",
  "Sevier",
  "Woodruff",
] as const satisfies readonly ArkansasCountyName[];

export const HISTORICAL_SCHEDULED_ONLY_COUNTIES = ["Howard"] as const satisfies readonly ArkansasCountyName[];

const VISITED_SET = new Set<string>(HISTORICAL_VISITED_COUNTIES);
const UNVISITED_SET = new Set<string>(HISTORICAL_UNVISITED_COUNTIES);
const SCHEDULED_SET = new Set<string>(HISTORICAL_SCHEDULED_ONLY_COUNTIES);

export function isHistoricalVisitedCounty(name: string): boolean {
  return VISITED_SET.has(name);
}

export function isHistoricalUnvisitedCounty(name: string): boolean {
  return UNVISITED_SET.has(name);
}

export function isHistoricalScheduledOnlyCounty(name: string): boolean {
  return SCHEDULED_SET.has(name);
}

/** Throws if the frozen snapshot is internally inconsistent. Safe to call from validate scripts. */
export function assertHistoricalCountyVisitSeed(): void {
  const all = [...HISTORICAL_VISITED_COUNTIES, ...HISTORICAL_UNVISITED_COUNTIES, ...HISTORICAL_SCHEDULED_ONLY_COUNTIES];
  if (HISTORICAL_VISITED_COUNTIES.length !== 51) {
    throw new Error(`Historical visited seed must be 51 counties, got ${HISTORICAL_VISITED_COUNTIES.length}`);
  }
  if (HISTORICAL_UNVISITED_COUNTIES.length !== 23) {
    throw new Error(`Historical unvisited seed must be 23 counties, got ${HISTORICAL_UNVISITED_COUNTIES.length}`);
  }
  if (all.length !== ARKANSAS_COUNTY_COUNT) {
    throw new Error(`Historical seed union must be ${ARKANSAS_COUNTY_COUNT}, got ${all.length}`);
  }
  const seen = new Set<string>();
  for (const name of all) {
    if (!ARKANSAS_COUNTIES.includes(name)) throw new Error(`Unknown county in seed: ${name}`);
    if (seen.has(name)) throw new Error(`Duplicate county in seed: ${name}`);
    seen.add(name);
  }
}
