export function lanesOverviewHref(): string {
  return "/election-plan/lanes-overview";
}

export function lanesClusterHref(clusterId: string): string {
  return `/election-plan/lanes-overview/clusters/${clusterId}`;
}

export function lanesCountyHref(clusterId: string, countySlug: string): string {
  return `/election-plan/lanes-overview/clusters/${clusterId}/counties/${countySlug}`;
}
