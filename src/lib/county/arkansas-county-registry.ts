/**
 * Single source of truth for all 75 Arkansas county command slugs, FIPS, and regional groupings
 * (public /counties hub, voter registration rosters, and DB sync).
 */

export type ArCommandRegionId =
  | "northwest"
  | "north_central"
  | "northeast"
  | "central"
  | "west_central"
  | "southwest"
  | "southeast"
  | "south";

export type ArCommandRegionMeta = {
  id: ArCommandRegionId;
  /** Short label for small UI */
  shortLabel: string;
  /** Full label for big buttons and headings */
  label: string;
  /** North → south stack order in the workbench */
  sort: number;
};

/** Master regions: separate buttons + anchor targets */
export const ARKANSAS_COMMAND_REGIONS: readonly ArCommandRegionMeta[] = [
  { id: "northwest", shortLabel: "Northwest", label: "Northwest (NWA & Ozarks gateway)", sort: 1 },
  { id: "north_central", shortLabel: "North Central", label: "North Central (River Valley & Boston Mountains)", sort: 2 },
  { id: "northeast", shortLabel: "Northeast", label: "Northeast (Upper Delta & Crowley’s Ridge)", sort: 3 },
  { id: "central", shortLabel: "Central", label: "Central (incl. Little Rock & I-30 corridor)", sort: 4 },
  { id: "west_central", shortLabel: "West Central", label: "West Central (Ouachitas & Hot Springs–Fort Smith)", sort: 5 },
  { id: "southwest", shortLabel: "Southwest", label: "Southwest (Texarkana, timber, and hill country)", sort: 6 },
  { id: "southeast", shortLabel: "Southeast", label: "Southeast (Delta, Pine Bluff, and river counties)", sort: 7 },
  { id: "south", shortLabel: "South", label: "South (southern timber & oil belt)", sort: 8 },
] as const;

export type ArkansasRegistryCounty = {
  fips: string;
  displayName: string;
  slug: string;
  regionId: ArCommandRegionId;
  sortOrder: number;
};

const ENTRIES: Array<{ fips: string; displayName: string; regionId: ArCommandRegionId }> = [
  { fips: "05001", displayName: "Arkansas County", regionId: "southeast" },
  { fips: "05003", displayName: "Ashley County", regionId: "south" },
  { fips: "05005", displayName: "Baxter County", regionId: "north_central" },
  { fips: "05007", displayName: "Benton County", regionId: "northwest" },
  { fips: "05009", displayName: "Boone County", regionId: "north_central" },
  { fips: "05011", displayName: "Bradley County", regionId: "south" },
  { fips: "05013", displayName: "Calhoun County", regionId: "south" },
  { fips: "05015", displayName: "Carroll County", regionId: "northwest" },
  { fips: "05017", displayName: "Chicot County", regionId: "southeast" },
  { fips: "05019", displayName: "Clark County", regionId: "south" },
  { fips: "05021", displayName: "Clay County", regionId: "northeast" },
  { fips: "05023", displayName: "Cleburne County", regionId: "north_central" },
  { fips: "05025", displayName: "Cleveland County", regionId: "south" },
  { fips: "05027", displayName: "Columbia County", regionId: "south" },
  { fips: "05029", displayName: "Conway County", regionId: "central" },
  { fips: "05031", displayName: "Craighead County", regionId: "northeast" },
  { fips: "05033", displayName: "Crawford County", regionId: "west_central" },
  { fips: "05035", displayName: "Crittenden County", regionId: "northeast" },
  { fips: "05037", displayName: "Cross County", regionId: "northeast" },
  { fips: "05039", displayName: "Dallas County", regionId: "south" },
  { fips: "05041", displayName: "Desha County", regionId: "southeast" },
  { fips: "05043", displayName: "Drew County", regionId: "southeast" },
  { fips: "05045", displayName: "Faulkner County", regionId: "central" },
  { fips: "05047", displayName: "Franklin County", regionId: "west_central" },
  { fips: "05049", displayName: "Fulton County", regionId: "north_central" },
  { fips: "05051", displayName: "Garland County", regionId: "west_central" },
  { fips: "05053", displayName: "Grant County", regionId: "central" },
  { fips: "05055", displayName: "Greene County", regionId: "northeast" },
  { fips: "05057", displayName: "Hempstead County", regionId: "southwest" },
  { fips: "05059", displayName: "Hot Spring County", regionId: "west_central" },
  { fips: "05061", displayName: "Howard County", regionId: "southwest" },
  { fips: "05063", displayName: "Independence County", regionId: "north_central" },
  { fips: "05065", displayName: "Izard County", regionId: "north_central" },
  { fips: "05067", displayName: "Jackson County", regionId: "northeast" },
  { fips: "05069", displayName: "Jefferson County", regionId: "southeast" },
  { fips: "05071", displayName: "Johnson County", regionId: "north_central" },
  { fips: "05073", displayName: "Lafayette County", regionId: "southwest" },
  { fips: "05075", displayName: "Lawrence County", regionId: "northeast" },
  { fips: "05077", displayName: "Lee County", regionId: "southeast" },
  { fips: "05079", displayName: "Lincoln County", regionId: "south" },
  { fips: "05081", displayName: "Little River County", regionId: "southwest" },
  { fips: "05083", displayName: "Logan County", regionId: "west_central" },
  { fips: "05085", displayName: "Lonoke County", regionId: "central" },
  { fips: "05087", displayName: "Madison County", regionId: "northwest" },
  { fips: "05089", displayName: "Marion County", regionId: "north_central" },
  { fips: "05091", displayName: "Miller County", regionId: "southwest" },
  { fips: "05093", displayName: "Mississippi County", regionId: "northeast" },
  { fips: "05095", displayName: "Monroe County", regionId: "southeast" },
  { fips: "05097", displayName: "Montgomery County", regionId: "west_central" },
  { fips: "05099", displayName: "Nevada County", regionId: "south" },
  { fips: "05101", displayName: "Newton County", regionId: "north_central" },
  { fips: "05103", displayName: "Ouachita County", regionId: "south" },
  { fips: "05105", displayName: "Perry County", regionId: "central" },
  { fips: "05107", displayName: "Phillips County", regionId: "southeast" },
  { fips: "05109", displayName: "Pike County", regionId: "southwest" },
  { fips: "05111", displayName: "Poinsett County", regionId: "northeast" },
  { fips: "05113", displayName: "Polk County", regionId: "west_central" },
  { fips: "05115", displayName: "Pope County", regionId: "central" },
  { fips: "05117", displayName: "Prairie County", regionId: "central" },
  { fips: "05119", displayName: "Pulaski County", regionId: "central" },
  { fips: "05121", displayName: "Randolph County", regionId: "northeast" },
  { fips: "05123", displayName: "St. Francis County", regionId: "northeast" },
  { fips: "05125", displayName: "Saline County", regionId: "central" },
  { fips: "05127", displayName: "Scott County", regionId: "west_central" },
  { fips: "05129", displayName: "Searcy County", regionId: "north_central" },
  { fips: "05131", displayName: "Sebastian County", regionId: "west_central" },
  { fips: "05133", displayName: "Sevier County", regionId: "southwest" },
  { fips: "05135", displayName: "Sharp County", regionId: "north_central" },
  { fips: "05137", displayName: "Stone County", regionId: "north_central" },
  { fips: "05139", displayName: "Union County", regionId: "south" },
  { fips: "05141", displayName: "Van Buren County", regionId: "north_central" },
  { fips: "05143", displayName: "Washington County", regionId: "northwest" },
  { fips: "05145", displayName: "White County", regionId: "north_central" },
  { fips: "05147", displayName: "Woodruff County", regionId: "northeast" },
  { fips: "05149", displayName: "Yell County", regionId: "west_central" },
];

function slugFromDisplayName(displayName: string): string {
  const base = displayName
    .replace(/\s+County$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-county`;
}

/**
 * 75 counties, FIPS order (05001…05149 odd series).
 * Slugs match public routes `/counties/[slug]`.
 */
export const ARKANSAS_COUNTY_REGISTRY: readonly ArkansasRegistryCounty[] = ENTRIES.map((e, i) => ({
  fips: e.fips,
  displayName: e.displayName,
  slug: slugFromDisplayName(e.displayName),
  regionId: e.regionId,
  sortOrder: i,
}));

const REGISTRY_BY_SLUG = new Map(ARKANSAS_COUNTY_REGISTRY.map((c) => [c.slug, c]));
const REGISTRY_BY_FIPS = new Map(ARKANSAS_COUNTY_REGISTRY.map((c) => [c.fips, c]));

export function getRegistryCountyBySlug(slug: string): ArkansasRegistryCounty | null {
  return REGISTRY_BY_SLUG.get(slug) ?? null;
}

export function getRegistryCountyByFips(fips: string): ArkansasRegistryCounty | null {
  return REGISTRY_BY_FIPS.get(fips) ?? null;
}

export function isValidArkansasCountySlug(slug: string): boolean {
  return REGISTRY_BY_SLUG.has(slug);
}

export function regionLabelForId(id: ArCommandRegionId): string {
  return ARKANSAS_COMMAND_REGIONS.find((r) => r.id === id)?.label ?? id;
}

export function regionMetaForId(id: ArCommandRegionId): ArCommandRegionMeta | undefined {
  return ARKANSAS_COMMAND_REGIONS.find((r) => r.id === id);
}

/** Counties grouped by region (fixed region sort), each group sorted by FIPS. */
export function countiesByRegionOrdered(): ReadonlyMap<ArCommandRegionId, ArkansasRegistryCounty[]> {
  const m = new Map<ArCommandRegionId, ArkansasRegistryCounty[]>();
  for (const r of ARKANSAS_COMMAND_REGIONS) {
    m.set(r.id, []);
  }
  for (const c of ARKANSAS_COUNTY_REGISTRY) {
    m.get(c.regionId)?.push(c);
  }
  for (const [_id, list] of m) {
    list.sort((a, b) => a.fips.localeCompare(b.fips));
  }
  return m;
}
