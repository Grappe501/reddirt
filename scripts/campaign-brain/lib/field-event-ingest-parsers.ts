/**
 * Parsers for field event lead batches (vendor fairs, county fairs, festival index).
 */

import { ARKANSAS_COUNTY_EVENT_DIRECTORY } from "../../../src/lib/festivals/arkansas-county-event-directory";
import { ARKANSAS_TOP_100_CITIES } from "../../strategic-plan/data/arkansas-top-40-cities";

export type IngestLead = {
  eventName: string;
  startDate: string | null;
  endDate: string | null;
  city: string;
  county: string;
  venue: string;
  source: string;
  vendorTypes: string;
  category: "festival" | "fair" | "farmers_market" | "community" | "county_fair";
  discontinued?: boolean;
};

const CITY_TO_COUNTY = new Map<string, string>();

for (const row of ARKANSAS_COUNTY_EVENT_DIRECTORY) {
  for (const seat of row.countySeats.split(/,\s*/)) {
    CITY_TO_COUNTY.set(seat.toLowerCase(), row.countyName);
  }
  CITY_TO_COUNTY.set(row.countyName.toLowerCase(), row.countyName);
}

for (const c of ARKANSAS_TOP_100_CITIES) {
  CITY_TO_COUNTY.set(c.name.toLowerCase(), c.county);
}

const ALIASES: Record<string, string> = {
  "helena-west helena": "Phillips",
  "north little rock": "Pulaski",
  "little rock": "Pulaski",
  "fort smith": "Sebastian",
  "hot springs": "Garland",
  "pine bluff": "Jefferson",
  "mountain home": "Baxter",
  "bella vista": "Benton",
  "bentonville": "Benton",
  "fayetteville": "Washington",
  "springdale": "Washington",
  "rogers": "Benton",
  "conway": "Faulkner",
  "jonesboro": "Craighead",
  "russellville": "Pope",
  "searcy": "White",
  "texarkana": "Miller",
  "el dorado": "Union",
  "mount vernon": "Faulkner",
  "mount ida": "Montgomery",
  "heber springs": "Cleburne",
  "fairfield bay": "Van Buren",
  "eureka springs": "Carroll",
  "berryville": "Carroll",
  "mountain view": "Stone",
  "harrison": "Boone",
  "clarksville": "Johnson",
  "hope": "Hempstead",
  "camden": "Ouachita",
  "magnolia": "Columbia",
  "warren": "Bradley",
  "paragould": "Greene",
  "batesville": "Independence",
  "jasper": "Newton",
  "greenwood": "Sebastian",
  "rose bud": "White",
  "lonoke": "Lonoke",
  "van buren": "Crawford",
  "mena": "Polk",
  "arkadelphia": "Clark",
  "malvern": "Hot Spring",
  "sheridan": "Grant",
  "cabot": "Lonoke",
  "jacksonville": "Pulaski",
  "west memphis": "Crittenden",
  "forrest city": "St. Francis",
  "harrisburg": "Poinsett",
  "crossett": "Ashley",
  "clinton": "Van Buren",
  "dardanelle": "Yell",
  "perryville": "Perry",
  "morrilton": "Conway",
  "newport": "Jackson",
  "helena": "Phillips",
  "ozark": "Franklin",
  "lowell": "Benton",
  "prairie grove": "Washington",
  "hindsville": "Madison",
  "canehill": "Washington",
  "winslow": "Washington",
  "marked tree": "Poinsett",
  "dover": "Pope",
  "hardy": "Sharp",
  "gurdon": "Clark",
  "weiner": "Poinsett",
  "prescott": "Nevada",
  "waldrons": "Scott",
  "waldron": "Scott",
};

for (const [city, county] of Object.entries(ALIASES)) {
  CITY_TO_COUNTY.set(city, county);
}

export function resolveCounty(city: string, hint?: string): string {
  if (hint) {
    const m = hint.match(/([A-Za-z .'-]+)\s+County/i);
    if (m) return m[1].trim().replace(/\s+County$/i, "");
  }
  const key = city.toLowerCase().replace(/,.*$/, "").trim();
  return CITY_TO_COUNTY.get(key) ?? "";
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^2026\s+/i, "")
    .replace(/\*+$/, "")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s&'-]/g, "")
    .trim();
}

export function slugId(name: string, date: string | null, city: string): string {
  const base = normalizeName(name).slice(0, 48).replace(/\s+/g, "-");
  const d = date ?? "nodate";
  const c = city.toLowerCase().replace(/\s+/g, "-").slice(0, 20);
  return `fest-${d}-${c}-${base}`.replace(/-+/g, "-");
}

/** Parse vendor-fair blocks: title line, date line, Location line */
export function parseVendorFairBlocks(text: string): IngestLead[] {
  const out: IngestLead[] = [];
  const blocks = text.split(/\n(?=2026 )/);
  for (const block of blocks) {
    const lines = block.trim().split("\n").map((l) => l.trim());
    if (!lines[0]?.startsWith("2026")) continue;
    const title = lines[0].replace(/^2026\s+/, "").trim();
    const dateLine = lines.find((l) => /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+/i.test(l));
    const locLine = lines.find((l) => l.startsWith("Location:"));
    const vendorLine = lines.find((l) => l.startsWith("Types of Vendor:"));
    if (!locLine) continue;

    const locMatch = locLine.replace(/^Location:\s*/, "").match(/^([^,]+),\s*AR\s*(.*)$/i);
    if (!locMatch) continue;
    const city = locMatch[1].trim();
    const venue = locMatch[2].trim();

    let startDate: string | null = null;
    let endDate: string | null = null;
    if (dateLine) {
      const range = dateLine.match(/(\w+)\s+(\d+)\s*-\s*(\d+),?\s*(\d{4})/i);
      const single = dateLine.match(/(\w+)\s+(\d+)\s+(\d{4})/i);
      if (range) {
        startDate = parseUsDate(range[1], range[2], range[4]);
        endDate = parseUsDate(range[1], range[3], range[4]);
      } else if (single) {
        startDate = parseUsDate(single[1], single[2], single[3]);
      }
    }

    out.push({
      eventName: title,
      startDate,
      endDate,
      city,
      county: resolveCounty(city),
      venue,
      source: "field-ingest-vendor-fair",
      vendorTypes: vendorLine?.replace(/^Types of Vendor:\s*/, "") ?? "",
      category: title.toLowerCase().includes("fair") && title.toLowerCase().includes("county") ? "county_fair" : "festival",
    });
  }
  return out;
}

/** Parse county fair schedule lines: 2026-07-10 - 2026-07-18\nName at City, County */
export function parseCountyFairLines(text: string): IngestLead[] {
  const out: IngestLead[] = [];
  const re = /(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})\n([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const line = m[3].trim();
    const atMatch = line.match(/^(.+?)\s+at\s+([^,]+),\s*(.+)$/i);
    if (!atMatch) continue;
    const eventName = atMatch[1].trim();
    const city = atMatch[2].trim();
    const countyHint = atMatch[3].trim();
    out.push({
      eventName,
      startDate: m[1],
      endDate: m[2],
      city,
      county: resolveCounty(city, countyHint),
      venue: "",
      source: "field-ingest-county-fair-schedule",
      vendorTypes: "",
      category: "county_fair",
    });
  }
  return out;
}

/** Parse festivalindex-style: Name / Month DD, YYYY / Name / Venue, City, AR */
export function parseFestivalIndexBlocks(text: string): IngestLead[] {
  const out: IngestLead[] = [];
  const re =
    /^([^\n]+)\n((?:January|February|March|April|May|June|July|August|September|October|November|December)[^\n]*\d{4}[^\n]*)\n\1\n([^,\n]+),\s*([^,]+),\s*AR/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const eventName = m[1].trim();
    const dateLine = m[2].trim();
    const venue = m[3].trim();
    const city = m[4].trim();
    if (/^ROBBIE!|^Wednesday Spins|^Meditative Sundays|^Art Insights|^Family Fest:/i.test(eventName)) continue;

    let startDate: string | null = null;
    let endDate: string | null = null;
    const range = dateLine.match(/(\w+)\s+(\d+)\s*-\s*(\d+),?\s*(\d{4})/i);
    const single = dateLine.match(/(\w+)\s+(\d+),?\s*(\d{4})/i);
    const monthOnly = dateLine.match(/(\w+)\s+(\d{4})/i);
    if (range) {
      startDate = parseUsDate(range[1], range[2], range[4]);
      endDate = parseUsDate(range[1], range[3], range[4]);
    } else if (single) {
      startDate = parseUsDate(single[1], single[2], single[3]);
    } else if (monthOnly && /dates not updated/i.test(dateLine)) {
      startDate = null;
    }

    out.push({
      eventName,
      startDate,
      endDate,
      city,
      county: resolveCounty(city),
      venue,
      source: "field-ingest-festivalindex",
      vendorTypes: "",
      category: eventName.toLowerCase().includes("fair") ? "fair" : "festival",
    });
  }
  return out;
}

/** FestivalIndex alt: Name / dates / Venue, City, AR (title not repeated) */
export function parseFestivalIndexAlt(text: string): IngestLead[] {
  const out: IngestLead[] = [];
  const re =
    /^([^\n]+)\n((?:January|February|March|April|May|June|July|August|September|October|November|December)[^\n]*\d{4}[^\n]*)\n([^,\n]+),\s*([^,\n]+),\s*AR\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const eventName = m[1].trim();
    const dateLine = m[2].trim();
    const venue = m[3].trim();
    const city = m[4].trim();
    if (/^2026\s/i.test(eventName)) continue;
    if (/^ROBBIE!|^Wednesday Spins|^Meditative Sundays|^Art Insights|^Family Fest:|^Status:|^Get more details|^Ezoic$/i.test(eventName))
      continue;
    if (/^Location:/i.test(eventName)) continue;

    let startDate: string | null = null;
    let endDate: string | null = null;
    const range = dateLine.match(/(\w+)\s+(\d+)\s*-\s*(\d+),?\s*(\d{4})/i);
    const single = dateLine.match(/(\w+)\s+(\d+),?\s*(\d{4})/i);
    if (range) {
      startDate = parseUsDate(range[1], range[2], range[4]);
      endDate = parseUsDate(range[1], range[3], range[4]);
    } else if (single) {
      startDate = parseUsDate(single[1], single[2], single[3]);
    }

    out.push({
      eventName,
      startDate,
      endDate,
      city,
      county: resolveCounty(city),
      venue,
      source: "field-ingest-festivalindex-alt",
      vendorTypes: "",
      category: eventName.toLowerCase().includes("fair") ? "fair" : "festival",
    });
  }
  return out;
}

/** Parse campaign calendar lines: 6/14 – Name – City */
export function parseCampaignCalendarLines(text: string): IngestLead[] {
  const out: IngestLead[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^(\d{1,2}\/\d{1,2}(?:-\d{1,2}\/\d{1,2})?)\s*[–—-]\s*(.+?)\s*[–—-]\s*(.+?)(?:\s*[–—-]\s*DISCONTINUED)?$/i);
    if (!m) continue;
    const datePart = m[1];
    const eventName = m[2].replace(/\*+$/, "").trim();
    const city = m[3].trim();
    const discontinued = /DISCONTINUED/i.test(line);

    let startDate: string | null = null;
    let endDate: string | null = null;
    const range = datePart.match(/^(\d{1,2})\/(\d{1,2})-(\d{1,2})\/(\d{1,2})$/);
    const single = datePart.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (range) {
      startDate = `2026-${range[1].padStart(2, "0")}-${range[2].padStart(2, "0")}`;
      endDate = `2026-${range[3].padStart(2, "0")}-${range[4].padStart(2, "0")}`;
    } else if (single) {
      startDate = `2026-${single[1].padStart(2, "0")}-${single[2].padStart(2, "0")}`;
    }

    out.push({
      eventName,
      startDate,
      endDate,
      city,
      county: resolveCounty(city),
      venue: "",
      source: "field-ingest-campaign-calendar",
      vendorTypes: "",
      category: "festival",
      discontinued,
    });
  }
  return out;
}

/** Encyclopedia-style: Event Name\nCity (County) — no dates */
export function parseEncyclopediaMonthLists(text: string): IngestLead[] {
  const out: IngestLead[] = [];
  const re = /^([A-Za-z0-9][^\n(]+)\n([A-Za-z .'-]+)\s*\(([A-Za-z .'-]+)\s+County\)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const eventName = m[1].trim();
    const city = m[2].trim();
    const county = m[3].trim();
    if (eventName.length < 4 || /^(February|March|April|May|June|July|August|September|October|November|December|January)$/i.test(eventName))
      continue;
    out.push({
      eventName,
      startDate: null,
      endDate: null,
      city,
      county,
      venue: "",
      source: "field-ingest-encyclopedia",
      vendorTypes: "",
      category: "community",
    });
  }
  return out;
}

/** Little Rock tourism list — event names without 2026 dates */
export function parseLittleRockAnnualEvents(text: string): IngestLead[] {
  if (!/Little Rock Pride|Annual Festivals & Events/i.test(text)) return [];
  const names = [
    "Little Rock Pride",
    "Juneteenth in Little Rock",
    "Pops on the River",
    "Arkansas Cinema Society — Filmland",
    "Arkansas Comic Con",
    "Downtown Food Truck Festival",
    "Big Dam Bridge 100",
    "Six Bridges Book Festival",
    "International Greek Food Festival",
    "HarvestFest Little Rock",
    "Arkansas Cornbread Festival",
    "Arkansas State Fair",
    "The Little Rock Holiday Parade",
    "Arkansas State Capitol Lighting Ceremony",
    "Mardi Gras in Little Rock",
    "2026 Little Rock Marathon",
    "St. Patrick's Day in Little Rock",
    "Defeat the Beast Rodeo",
    "Lanterns at Wildwood Park for the Arts",
    "Jazz in the Park",
    "501 Fest",
    "World Cheese Dip Championship",
  ];
  const dated: Record<string, string> = {
    "Pops on the River": "2026-07-04",
    "2026 Little Rock Marathon": "2026-03-01",
  };
  return names.map((eventName) => ({
    eventName: eventName.replace(/^2026\s+Little Rock Marathon$/, "Little Rock Marathon"),
    startDate: dated[eventName] ?? null,
    endDate: null,
    city: "Little Rock",
    county: "Pulaski",
    venue: "",
    source: "field-ingest-lr-tourism",
    vendorTypes: "",
    category: "festival" as const,
  }));
}

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

function parseUsDate(month: string, day: string, year: string): string {
  const mm = MONTHS[month.toLowerCase()] ?? "01";
  return `${year}-${mm}-${day.padStart(2, "0")}`;
}

export function dedupeKey(lead: IngestLead): string {
  return `${normalizeName(lead.eventName)}|${lead.city.toLowerCase()}|${lead.startDate ?? ""}`;
}

export function mergeLeads(...groups: IngestLead[][]): IngestLead[] {
  const map = new Map<string, IngestLead>();
  for (const group of groups) {
    for (const lead of group) {
      if (lead.discontinued) continue;
      const key = dedupeKey(lead);
      const prev = map.get(key);
      if (!prev) {
        map.set(key, lead);
        continue;
      }
      // Prefer entry with date, longer venue, county filled
      const score = (l: IngestLead) =>
        (l.startDate ? 4 : 0) + (l.county ? 2 : 0) + (l.venue ? 1 : 0);
      if (score(lead) > score(prev)) map.set(key, { ...prev, ...lead, county: lead.county || prev.county });
    }
  }
  return [...map.values()].sort((a, b) => (a.startDate ?? "9999").localeCompare(b.startDate ?? "9999"));
}
