/**
 * Display helpers for `countySlug` / `city` on content cards.
 * County **pages** are not implemented yet; links point at stable on-site pathways
 * so we can swap to `/counties/[slug]` later without changing card markup much.
 */

/** Reserved path segment for future county hubs; cards do not link here until routes exist. */
export const FUTURE_COUNTY_PAGE_PREFIX = "/counties" as const;

/**
 * Human-readable county line from a slug (e.g. `pulaski` → `Pulaski`, `van-buren` → `Van Buren`).
 * Editors can still put fuller context in `city`.
 */
export function formatCountySlugLabel(countySlug: string): string {
  return countySlug
    .trim()
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Where to send someone who taps county context: volunteer + optional county hint in query
 * (forms may adopt `county` later; safe no-op today).
 */
export function countyVolunteerPath(countySlug: string): string {
  const q = new URLSearchParams();
  q.set("county", countySlug.trim());
  q.set("from", "content-hub");
  return `/get-involved?${q.toString()}#volunteer`;
}

/** Future county hub URL — use when `app/counties/[slug]` exists. */
export function futureCountyHubHref(countySlug: string): string {
  return `${FUTURE_COUNTY_PAGE_PREFIX}/${encodeURIComponent(countySlug.trim())}`;
}
