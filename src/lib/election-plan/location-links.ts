import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";

/** Full county workbench — sister app dashboard-v2 when configured, else RedDirt admin bridge. */
export function countyWorkbenchHref(countyName: string, electionPlanSlug?: string): string {
  const bundle = buildCountyEventLinkBundle(`${countyName} County`);
  if (bundle?.workbenchDashboardV2Href) return bundle.workbenchDashboardV2Href;
  if (bundle?.adminBridgeHref) return bundle.adminBridgeHref;
  const slug = electionPlanSlug ?? countyName.toLowerCase().replace(/\s+/g, "-");
  const registrySlug = slug.endsWith("-county") ? slug : `${slug}-county`;
  return `/admin/counties/${registrySlug}`;
}

export function cityLocationBriefHref(citySlug: string): string {
  return `/election-plan/cities/${citySlug}`;
}

export function cityLocationsHubHref(): string {
  return "/election-plan/cities";
}

export function locationBriefMasterPlanHref(): string {
  return "/election-plan/locations/master-plan";
}
