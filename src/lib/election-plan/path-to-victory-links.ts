import { normalizeCountySlug } from "@/lib/election-plan/county-playbook-links";

export function countyPathToVictoryHref(countySlug: string): string {
  return `/election-plan/counties/${normalizeCountySlug(countySlug)}/path-to-victory`;
}

export function cityPathToVictoryHref(citySlug: string): string {
  return `/election-plan/cities/${citySlug}/path-to-victory`;
}
