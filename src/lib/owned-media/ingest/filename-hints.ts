import path from "node:path";

/** Common county slug tokens (extend as needed). */
const KNOWN_COUNTY_SLUGS = new Set(
  [
    "pulaski",
    "benton",
    "washington",
    "sebastian",
    "faulkner",
    "garland",
    "jefferson",
    "craighead",
    "arkansas",
    "lonoke",
    "saline",
    "white",
    "baxter",
    "mississippi",
    "crittenden",
    "lincoln",
    "pope",
    "union",
    "desha",
    "boone",
    "carroll",
    "conway",
    "clark",
    "greene",
    "miller",
    "hot-spring",
    "perry",
    "newton",
    "searcy",
    "stone",
    "randolph",
    "van-buren",
    "nw-ark",
    "northwest-arkansas",
  ].map((s) => s.toLowerCase())
);

/**
 * Heuristic filename parsing: `2024-03-10_pulaski_labor-clip` → date, county slug, keywords.
 * Advisory only; use with `needsGeoReview`.
 */
export function parseFilenameHints(fileName: string): {
  date: Date | null;
  countySlug: string | null;
  keywords: string[];
} {
  const base = path.basename(fileName, path.extname(fileName));
  const out = { date: null as Date | null, countySlug: null as string | null, keywords: [] as string[] };
  if (!base) return out;

  const m = base.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!Number.isNaN(d.getTime())) out.date = d;
  }

  const parts = base.split(/[_\s-]+/).filter(Boolean);
  for (const p of parts) {
    const pl = p.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (KNOWN_COUNTY_SLUGS.has(pl)) {
      if (!out.countySlug) out.countySlug = pl;
    } else if (pl.match(/-county$/) && pl.length < 32) {
      if (!out.countySlug) out.countySlug = pl;
    } else if (pl.length > 1 && out.keywords.length < 12 && !/^\d{4}/.test(pl) && isNaN(Number(pl))) {
      if (!/^\d{1,2}$/.test(pl)) out.keywords.push(pl);
    }
  }

  return out;
}
