/** Arkansas Battlefield cluster + county dashboard route helpers. */

export function battlefieldClusterHref(clusterId: string): string {
  return `/election-plan/battlefield/${clusterId}`;
}

export function battlefieldOverviewHref(): string {
  return "/election-plan/battlefield";
}

/** Election Plan county workbench v3 — primary county intelligence surface. */
export function countyDashboardHref(countySlug: string): string {
  const short = countySlug.replace(/-county$/, "");
  return `/election-plan/counties/${short}`;
}

export function countyDashboardLabel(_countySlug: string): string {
  return "Open county workbench v4";
}
