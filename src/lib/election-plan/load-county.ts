import type { ElectionPlanCounty, ElectionPlanCity, ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";

/** Election-plan county slugs omit the `-county` suffix (e.g. `washington`, not `washington-county`). */
export function normalizeElectionPlanCountySlug(countySlug: string): string {
  return countySlug.trim().toLowerCase().replace(/-county$/, "");
}

export function getCountyBySlug(
  data: ElectionPlanWorkbenchSnapshot,
  countySlug: string,
): ElectionPlanCounty | undefined {
  const normalized = normalizeElectionPlanCountySlug(countySlug);
  return data.counties.find((c) => c.slug === normalized);
}

export function getCountyByName(
  data: ElectionPlanWorkbenchSnapshot,
  countyName: string,
): ElectionPlanCounty | undefined {
  const norm = countyName.replace(/\s+County$/i, "").trim().toLowerCase();
  return data.counties.find((c) => c.county.toLowerCase() === norm);
}

export function getCitiesInCounty(cities: ElectionPlanCity[], countyName: string): ElectionPlanCity[] {
  const norm = countyName.replace(/\s+County$/i, "").trim().toLowerCase();
  return cities.filter((c) => c.county.toLowerCase() === norm).sort((a, b) => a.rank - b.rank);
}

export function countyElectionPlanHref(countySlug: string): string {
  return `/election-plan/counties/${countySlug}`;
}
