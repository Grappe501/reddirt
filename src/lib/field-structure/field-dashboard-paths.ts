import type { ArCommandRegionId } from "@/lib/county/arkansas-county-registry";

export const FIELD_DIRECTOR_BASE = "/dashboard/field" as const;

export function fieldDirectorHref(): string {
  return FIELD_DIRECTOR_BASE;
}

export function fieldRegionsIndexHref(): string {
  return `${FIELD_DIRECTOR_BASE}/regions`;
}

export function fieldRegionHref(regionId: ArCommandRegionId): string {
  return `${FIELD_DIRECTOR_BASE}/regions/${regionId}`;
}

export function fieldCountyHref(regionId: ArCommandRegionId, countySlug: string): string {
  return `${FIELD_DIRECTOR_BASE}/regions/${regionId}/counties/${countySlug}`;
}

export function fieldCountyLaneHref(
  regionId: ArCommandRegionId,
  countySlug: string,
  lane: "events" | "social-media" | "power-of-5",
): string {
  return `${fieldCountyHref(regionId, countySlug)}/lanes/${lane}`;
}

export function fieldCityHref(regionId: ArCommandRegionId, countySlug: string, citySlug: string): string {
  return `${fieldCountyHref(regionId, countySlug)}/cities/${citySlug}`;
}

export function fieldPrecinctHref(
  regionId: ArCommandRegionId,
  countySlug: string,
  citySlug: string,
  precinctSlug: string,
): string {
  return `${fieldCityHref(regionId, countySlug, citySlug)}/precincts/${precinctSlug}`;
}

export function fieldNeighborhoodHref(
  regionId: ArCommandRegionId,
  countySlug: string,
  citySlug: string,
  precinctSlug: string,
  neighborhoodSlug: string,
): string {
  return `${fieldPrecinctHref(regionId, countySlug, citySlug, precinctSlug)}/neighborhoods/${neighborhoodSlug}`;
}

/** Example slugs for empty geographies — safe to ship as navigation targets only. */
export const FIELD_TEMPLATE_CITY_SLUG = "template-city" as const;
export const FIELD_TEMPLATE_PRECINCT_SLUG = "template-precinct" as const;
export const FIELD_TEMPLATE_NEIGHBORHOOD_SLUG = "template-neighborhood" as const;
