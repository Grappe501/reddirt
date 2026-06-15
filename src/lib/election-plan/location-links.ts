import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";

/**
 * Canonical county playbook — leader workbench (events, calendar, leaders, tasks, goals).
 * Falls back to RedDirt briefing v2, public county command, then admin bridge.
 */
export function countyPlaybookHref(countyName: string, electionPlanSlug?: string): string {
  const bundle = buildCountyEventLinkBundle(`${countyName} County`);
  if (bundle?.workbenchLeaderHref) return bundle.workbenchLeaderHref;
  if (bundle?.redDirtBriefingV2Href) return bundle.redDirtBriefingV2Href;
  if (bundle?.redDirtCountyHref) return bundle.redDirtCountyHref;
  const slug = electionPlanSlug ?? countyName.toLowerCase().replace(/\s+/g, "-");
  const registrySlug = slug.endsWith("-county") ? slug : `${slug}-county`;
  return `/counties/${registrySlug}`;
}

/** @deprecated Prefer countyPlaybookHref — same destination. */
export function countyWorkbenchHref(countyName: string, electionPlanSlug?: string): string {
  return countyPlaybookHref(countyName, electionPlanSlug);
}

export function countyPlaybookOpensInNewTab(countyName: string): boolean {
  return Boolean(buildCountyEventLinkBundle(`${countyName} County`)?.workbenchLeaderHref);
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

export const COUNTY_COVERAGE_EXPLAINER =
  "Coverage = campaign visit contacts completed vs planned for this county’s opportunity tier (Tier A: 5, B: 3, C: 2, D: 1). It measures Kelly/field touch progress — not vote share or registration.";
