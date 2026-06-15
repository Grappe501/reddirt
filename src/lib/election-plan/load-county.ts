import type { ElectionPlanCounty, ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";

export function getCountyBySlug(
  data: ElectionPlanWorkbenchSnapshot,
  countySlug: string,
): ElectionPlanCounty | undefined {
  return data.counties.find((c) => c.slug === countySlug);
}

export function countyElectionPlanHref(countySlug: string): string {
  return `/election-plan/counties/${countySlug}`;
}
