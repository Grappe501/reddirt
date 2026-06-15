/** Arkansas Battlefield cluster + county dashboard route helpers. */

const COUNTY_DASHBOARD_V2 = new Set(["pope", "pulaski", "faulkner"]);

export function battlefieldClusterHref(clusterId: string): string {
  return `/election-plan/battlefield/${clusterId}`;
}

export function battlefieldOverviewHref(): string {
  return "/election-plan/battlefield";
}

/** Full county command / briefing dashboard — v2 where shipped, else county command page. */
export function countyDashboardHref(countySlug: string): string {
  const short = countySlug.replace(/-county$/, "");
  if (COUNTY_DASHBOARD_V2.has(short)) {
    return `/county-briefings/${short}/v2`;
  }
  const fullSlug = countySlug.endsWith("-county") ? countySlug : `${countySlug}-county`;
  return `/counties/${fullSlug}`;
}

export function countyDashboardLabel(countySlug: string): string {
  const short = countySlug.replace(/-county$/, "");
  return COUNTY_DASHBOARD_V2.has(short) ? "Open county dashboard v2" : "Open county command page";
}
