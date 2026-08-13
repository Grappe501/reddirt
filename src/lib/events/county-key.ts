import {
  ARKANSAS_COUNTIES,
  type ArkansasCountyName,
} from "@/data/kelly-county-visits/arkansas-counties";

/**
 * Canonical map / route key: `hot-spring`, `st-francis`, `pulaski`.
 * EventItem.countySlug stays `hot-spring-county` for existing content.
 *
 * Hot Springs (the city) must never resolve to Hot Spring County.
 */
const NAME_BY_KEY = new Map<string, ArkansasCountyName>(
  ARKANSAS_COUNTIES.map((name) => [countyNameToKey(name), name]),
);

function countyNameToKey(name: ArkansasCountyName): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ALIASES: Record<string, string> = {
  "saint-francis": "st-francis",
  "st-francis": "st-francis",
  "stfrancis": "st-francis",
  "hot-spring": "hot-spring",
  "hotspring": "hot-spring",
  "van-buren": "van-buren",
  "vanburen": "van-buren",
  "little-river": "little-river",
  "littleriver": "little-river",
};

const REJECTED_KEYS = new Set(["hot-springs", "hotsprings"]);

export function arkansasCountyKey(name: ArkansasCountyName): string {
  return countyNameToKey(name);
}

export function arkansasCountySlugFromKey(key: string): string {
  return `${key}-county`;
}

export function normalizeArkansasCountyKey(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let s = raw.trim().toLowerCase();
  s = s.replace(/,?\s*ar(kansas)?\.?$/i, "").trim();
  s = s.replace(/\s+county$/i, "").trim();
  s = s.replace(/-county$/i, "");
  s = s.replace(/^saint\s+/i, "st. ");
  s = s.replace(/^st\s+(?=[a-z])/i, "st. ");
  const compact = s.replace(/\./g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (REJECTED_KEYS.has(compact.replace(/-/g, "")) || REJECTED_KEYS.has(compact)) {
    return null;
  }
  const aliased = ALIASES[compact] ?? ALIASES[compact.replace(/-/g, "")] ?? compact;
  return NAME_BY_KEY.has(aliased) ? aliased : null;
}

export function countyNameFromKey(key: string | null | undefined): ArkansasCountyName | null {
  const k = normalizeArkansasCountyKey(key);
  if (!k) return null;
  return NAME_BY_KEY.get(k) ?? null;
}

export function countyNameFromAnySlug(slug: string | null | undefined): ArkansasCountyName | null {
  return countyNameFromKey(slug);
}

export function formatCountyEyebrow(name: ArkansasCountyName): string {
  return `${name.toUpperCase()} COUNTY`;
}

export const STATEWIDE_VIRTUAL_EYEBROW = "Statewide / Virtual";
export const COUNTY_TO_VERIFY_EYEBROW = "County to verify";
