/**
 * Research playbook: all 75 Arkansas counties + where to look for candidate-suitable public events.
 *
 * - County seats are from the Wikipedia "List of counties in Arkansas" (dual seats noted).
 * - `fips5` matches U.S. Census / common GIS keys (e.g. Pulaski 05119) for joining to `County.fips` in Prisma.
 *
 * **What we do NOT automate here:** mass scraping of social networks or city sites without per-source agreements.
 * Add RSS/API modules under `ingest/sources/`; use this file for human review checklists and AI prompt context.
 *
 * **Wikipedia (county articles):** `npm run ingest:county-wikipedia` uses this list for FIPS/slugs and writes
 * `docs/ingested/county-wikipedia/*.md` for `npm run ingest` → `SearchChunk`. See `docs/county-wikipedia-reference-ingest.md`.
 */

export type ArkansasTourismRegion =
  | "Northwest"
  | "North Central"
  | "Northeast"
  | "Central"
  | "Upper Delta"
  | "Lower Delta"
  | "Southwest"
  | "Southeast"
  | "West Central";

export type ArkansasCountyEventDirectoryRow = {
  countyName: string;
  fips5: string;
  /** Primary county seat(s) — start calendar discovery here, then other cities in county. */
  countySeats: string;
  /** Rough map bucket for field planning (matches common Arkansas.com-style regions). */
  tourismRegion: ArkansasTourismRegion;
};

/** One row per county (75). County seats: Wikipedia, List of counties in Arkansas. */
export const ARKANSAS_COUNTY_EVENT_DIRECTORY: readonly ArkansasCountyEventDirectoryRow[] = [
  { countyName: "Arkansas", fips5: "05001", countySeats: "Stuttgart, DeWitt", tourismRegion: "Lower Delta" },
  { countyName: "Ashley", fips5: "05003", countySeats: "Hamburg", tourismRegion: "Southeast" },
  { countyName: "Baxter", fips5: "05005", countySeats: "Mountain Home", tourismRegion: "North Central" },
  { countyName: "Benton", fips5: "05007", countySeats: "Bentonville", tourismRegion: "Northwest" },
  { countyName: "Boone", fips5: "05009", countySeats: "Harrison", tourismRegion: "Northwest" },
  { countyName: "Bradley", fips5: "05011", countySeats: "Warren", tourismRegion: "Southwest" },
  { countyName: "Calhoun", fips5: "05013", countySeats: "Hampton", tourismRegion: "Southwest" },
  { countyName: "Carroll", fips5: "05015", countySeats: "Berryville, Eureka Springs", tourismRegion: "Northwest" },
  { countyName: "Chicot", fips5: "05017", countySeats: "Lake Village", tourismRegion: "Lower Delta" },
  { countyName: "Clark", fips5: "05019", countySeats: "Arkadelphia", tourismRegion: "Southwest" },
  { countyName: "Clay", fips5: "05021", countySeats: "Piggott, Corning", tourismRegion: "Northeast" },
  { countyName: "Cleburne", fips5: "05023", countySeats: "Heber Springs", tourismRegion: "North Central" },
  { countyName: "Cleveland", fips5: "05025", countySeats: "Rison", tourismRegion: "Southwest" },
  { countyName: "Columbia", fips5: "05027", countySeats: "Magnolia", tourismRegion: "Southwest" },
  { countyName: "Conway", fips5: "05029", countySeats: "Morrilton", tourismRegion: "Central" },
  { countyName: "Craighead", fips5: "05031", countySeats: "Jonesboro, Lake City", tourismRegion: "Northeast" },
  { countyName: "Crawford", fips5: "05033", countySeats: "Van Buren", tourismRegion: "Northwest" },
  { countyName: "Crittenden", fips5: "05035", countySeats: "Marion", tourismRegion: "Upper Delta" },
  { countyName: "Cross", fips5: "05037", countySeats: "Wynne", tourismRegion: "Upper Delta" },
  { countyName: "Dallas", fips5: "05039", countySeats: "Fordyce", tourismRegion: "Southwest" },
  { countyName: "Desha", fips5: "05041", countySeats: "Arkansas City", tourismRegion: "Lower Delta" },
  { countyName: "Drew", fips5: "05043", countySeats: "Monticello", tourismRegion: "Southeast" },
  { countyName: "Faulkner", fips5: "05045", countySeats: "Conway", tourismRegion: "Central" },
  { countyName: "Franklin", fips5: "05047", countySeats: "Ozark, Charleston", tourismRegion: "North Central" },
  { countyName: "Fulton", fips5: "05049", countySeats: "Salem", tourismRegion: "North Central" },
  { countyName: "Garland", fips5: "05051", countySeats: "Hot Springs", tourismRegion: "Central" },
  { countyName: "Grant", fips5: "05053", countySeats: "Sheridan", tourismRegion: "Central" },
  { countyName: "Greene", fips5: "05055", countySeats: "Paragould", tourismRegion: "Northeast" },
  { countyName: "Hempstead", fips5: "05057", countySeats: "Hope", tourismRegion: "Southwest" },
  { countyName: "Hot Spring", fips5: "05059", countySeats: "Malvern", tourismRegion: "Southwest" },
  { countyName: "Howard", fips5: "05061", countySeats: "Nashville", tourismRegion: "Southwest" },
  { countyName: "Independence", fips5: "05063", countySeats: "Batesville", tourismRegion: "North Central" },
  { countyName: "Izard", fips5: "05065", countySeats: "Melbourne", tourismRegion: "North Central" },
  { countyName: "Jackson", fips5: "05067", countySeats: "Newport", tourismRegion: "Northeast" },
  { countyName: "Jefferson", fips5: "05069", countySeats: "Pine Bluff", tourismRegion: "Central" },
  { countyName: "Johnson", fips5: "05071", countySeats: "Clarksville", tourismRegion: "Northwest" },
  { countyName: "Lafayette", fips5: "05073", countySeats: "Lewisville", tourismRegion: "Lower Delta" },
  { countyName: "Lawrence", fips5: "05075", countySeats: "Walnut Ridge", tourismRegion: "Northeast" },
  { countyName: "Lee", fips5: "05077", countySeats: "Marianna", tourismRegion: "Upper Delta" },
  { countyName: "Lincoln", fips5: "05079", countySeats: "Star City", tourismRegion: "Southeast" },
  { countyName: "Little River", fips5: "05081", countySeats: "Ashdown", tourismRegion: "Southwest" },
  { countyName: "Logan", fips5: "05083", countySeats: "Booneville, Paris", tourismRegion: "Northwest" },
  { countyName: "Lonoke", fips5: "05085", countySeats: "Lonoke", tourismRegion: "Central" },
  { countyName: "Madison", fips5: "05087", countySeats: "Huntsville", tourismRegion: "Northwest" },
  { countyName: "Marion", fips5: "05089", countySeats: "Yellville", tourismRegion: "North Central" },
  { countyName: "Miller", fips5: "05091", countySeats: "Texarkana", tourismRegion: "Southwest" },
  { countyName: "Mississippi", fips5: "05093", countySeats: "Blytheville, Osceola", tourismRegion: "Upper Delta" },
  { countyName: "Monroe", fips5: "05095", countySeats: "Clarendon", tourismRegion: "Lower Delta" },
  { countyName: "Montgomery", fips5: "05097", countySeats: "Mount Ida", tourismRegion: "Central" },
  { countyName: "Nevada", fips5: "05099", countySeats: "Prescott", tourismRegion: "Southwest" },
  { countyName: "Newton", fips5: "05101", countySeats: "Jasper", tourismRegion: "Northwest" },
  { countyName: "Ouachita", fips5: "05103", countySeats: "Camden", tourismRegion: "Southwest" },
  { countyName: "Perry", fips5: "05105", countySeats: "Perryville", tourismRegion: "Central" },
  { countyName: "Phillips", fips5: "05107", countySeats: "Helena–West Helena", tourismRegion: "Lower Delta" },
  { countyName: "Pike", fips5: "05109", countySeats: "Murfreesboro", tourismRegion: "Southwest" },
  { countyName: "Poinsett", fips5: "05111", countySeats: "Harrisburg", tourismRegion: "Northeast" },
  { countyName: "Polk", fips5: "05113", countySeats: "Mena", tourismRegion: "Southwest" },
  { countyName: "Pope", fips5: "05115", countySeats: "Russellville", tourismRegion: "North Central" },
  { countyName: "Prairie", fips5: "05117", countySeats: "Des Arc, DeValls Bluff", tourismRegion: "Upper Delta" },
  { countyName: "Pulaski", fips5: "05119", countySeats: "Little Rock", tourismRegion: "Central" },
  { countyName: "Randolph", fips5: "05121", countySeats: "Pocahontas", tourismRegion: "Northeast" },
  { countyName: "St. Francis", fips5: "05123", countySeats: "Forrest City", tourismRegion: "Upper Delta" },
  { countyName: "Saline", fips5: "05125", countySeats: "Benton, Bryant", tourismRegion: "Central" },
  { countyName: "Scott", fips5: "05127", countySeats: "Waldron", tourismRegion: "West Central" },
  { countyName: "Searcy", fips5: "05129", countySeats: "Marshall", tourismRegion: "North Central" },
  { countyName: "Sebastian", fips5: "05131", countySeats: "Fort Smith, Greenwood", tourismRegion: "Northwest" },
  { countyName: "Sevier", fips5: "05133", countySeats: "De Queen", tourismRegion: "Southwest" },
  { countyName: "Sharp", fips5: "05135", countySeats: "Ash Flat", tourismRegion: "North Central" },
  { countyName: "Stone", fips5: "05137", countySeats: "Mountain View", tourismRegion: "North Central" },
  { countyName: "Union", fips5: "05139", countySeats: "El Dorado", tourismRegion: "Southwest" },
  { countyName: "Van Buren", fips5: "05141", countySeats: "Clinton", tourismRegion: "North Central" },
  { countyName: "Washington", fips5: "05143", countySeats: "Fayetteville", tourismRegion: "Northwest" },
  { countyName: "White", fips5: "05145", countySeats: "Searcy", tourismRegion: "North Central" },
  { countyName: "Woodruff", fips5: "05147", countySeats: "Augusta", tourismRegion: "Upper Delta" },
  { countyName: "Yell", fips5: "05149", countySeats: "Dardanelle, Danville", tourismRegion: "North Central" },
] as const;

export const ARKANSAS_COUNTY_DIRECTORY_COUNT = ARKANSAS_COUNTY_EVENT_DIRECTORY.length;

/** State / regional layers — add RSS or API clients under `ingest/sources/`. */
export const STATEWIDE_EVENT_SOURCE_STARTING_POINTS: readonly { label: string; href: string; note: string }[] = [
  {
    label: "Arkansas.com events (state tourism)",
    href: "https://www.arkansas.com/events",
    note: "Statewide filter by region and category (fairs, arts, family, etc.).",
  },
  {
    label: "Association of Arkansas Counties",
    href: "https://www.arcounties.org/",
    note: "County government hub — use to find official county .gov and clerk contacts.",
  },
  {
    label: "Encyclopedia of Arkansas (context)",
    href: "https://encyclopediaofarkansas.net/",
    note: "Historical context; pair with current calendars, not a live events API.",
  },
] as const;

/**
 * Reusable research checklist (volunteer / intern script). Returns plain lines for a mail merge or printout.
 */
export function discoveryChecklistForCounty(row: ArkansasCountyEventDirectoryRow): string[] {
  const seatList = row.countySeats.split(/,|&|\/|\band\b/i).map((s) => s.replace(/[()]/g, "").trim());
  return [
    `${row.countyName} County (FIPS ${row.fips5}, ${row.tourismRegion}) — seats: ${row.countySeats}`,
    `Quorum / county judge: search "${row.countyName} County Arkansas" official site, meetings & fairs`,
    `Extension (UA / 4-H / AG): "University of Arkansas Division of Agriculture ${row.countyName} County extension" events`,
    ...seatList
      .filter((s) => s.length > 1 && !s.startsWith("also"))
      .map(
        (city) =>
          `City of ${city}: .gov "calendar", "special events", "farmers market", "freedom of information" boards`,
      ),
    `Chamber of Commerce + Main Street (search "${seatList[0] ?? row.countyName} chamber Arkansas events")`,
    `Regional paper events / community magazines (e.g. ADG, NWA Democrat-Gazette, River Valley, NEA, etc. by market)`,
    `Facebook: official county fair / homecoming / festival pages (log URL for ingest; do not clone without rights)`,
  ];
}

/** Compact string for OpenAI or internal briefings — not for public without review. */
export function formatAllCountiesForPrompt(maxChars = 24_000): string {
  const lines = ARKANSAS_COUNTY_EVENT_DIRECTORY.map(
    (c) => `${c.fips5}\t${c.countyName}\t${c.tourismRegion}\t${c.countySeats}`,
  );
  const header = "fips5\tcounty\tregion\tseats\n";
  const body = lines.join("\n");
  if (header.length + body.length <= maxChars) return header + body;
  return (header + body).slice(0, maxChars) + "\n…[truncated]";
}