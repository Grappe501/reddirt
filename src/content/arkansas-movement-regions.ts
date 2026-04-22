import {
  type ArkansasTourismRegion,
  ARKANSAS_COUNTY_EVENT_DIRECTORY,
} from "@/lib/festivals/arkansas-county-event-directory";

/**
 * Movement /events `EventItem.region` values — one label per `ArkansasTourismRegion` in
 * `arkansas-county-event-directory` (culturally + geographically coherent), plus "Statewide".
 * All 75 counties map through the directory; events use the same string keys for filters.
 */
export const STATEWIDE_EVENT_REGION = "Statewide" as const;

const LABEL: Record<ArkansasTourismRegion, string> = {
  Northwest: "Northwest Arkansas",
  "West Central": "West Central Arkansas",
  "North Central": "North Central Arkansas",
  Northeast: "Northeast Arkansas",
  "Upper Delta": "Upper Delta",
  Central: "Central Arkansas",
  "Lower Delta": "Lower Delta",
  Southeast: "Southeast Arkansas",
  Southwest: "Southwest Arkansas",
};

const BLURB: Record<ArkansasTourismRegion, string> = {
  Northwest: "Ozarks headwaters, the NWA metro, and the national arc of growth from Bentonville to Fayetteville.",
  "West Central": "Ouachita foothills and river-hill country between the big metros — Waldron, rural connectors.",
  "North Central": "Ozarks, bridges, and river towns — from Harrison and Mountain Home to Russellville and Searcy.",
  Northeast: "Crowley’s Ridge, Jonesboro, and the northern Delta edge — ag, logistics, and college towns.",
  "Upper Delta": "The Mississippi River counties — Blytheville, West Memphis, and east-row river culture.",
  Central: "The capital region, I-30 spine, and the state’s most diverse organizing terrain.",
  "Lower Delta": "Grand Prairie, southeast row-crop, and river-adjacent communities down to the Louisiana line.",
  Southeast: "Timber, small cities, and the Delta’s southern reach — where Pine Bluff anchors the story.",
  Southwest: "Texarkana, Magnolia, El Dorado, and the red hills — border economics and small-city civic life.",
};

export type MovementRegionInfo = {
  key: ArkansasTourismRegion;
  label: string;
  blurb: string;
};

/** Fixed order: roughly north/west to south/east, then people-heavy centers where it helps. */
export const MOVEMENT_EVENT_REGIONS_ORDER: ArkansasTourismRegion[] = [
  "Northwest",
  "West Central",
  "North Central",
  "Northeast",
  "Upper Delta",
  "Central",
  "Lower Delta",
  "Southeast",
  "Southwest",
];

export function listMovementRegionInfo(): MovementRegionInfo[] {
  return MOVEMENT_EVENT_REGIONS_ORDER.map((key) => ({
    key,
    label: LABEL[key],
    blurb: BLURB[key],
  }));
}

export function movementRegionLabel(key: ArkansasTourismRegion): string {
  return LABEL[key];
}

/** Labels for the events filter (all areas + statewide). */
export function listMovementEventRegionFilterLabels(): string[] {
  return [...MOVEMENT_EVENT_REGIONS_ORDER.map((k) => LABEL[k]), STATEWIDE_EVENT_REGION];
}

/**
 * `pulaski-county` → "Central Arkansas" from the county research directory.
 */
export function getMovementRegionForCountySlug(countySlug: string): string | null {
  const key = countySlugToDirectoryKey(countySlug);
  if (!key) return null;
  const row = ARKANSAS_COUNTY_EVENT_DIRECTORY.find(
    (r) => countyNameToKey(r.countyName) === key,
  );
  if (!row) return null;
  return movementRegionLabel(row.tourismRegion);
}

function countyNameToKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/'/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join("-");
}

function countySlugToDirectoryKey(slug: string): string | null {
  const s = slug.trim().toLowerCase();
  if (!s.endsWith("-county")) return null;
  return s.slice(0, -"-county".length);
}
