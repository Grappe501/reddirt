import { buildCountyEventLinkBundle } from "@/lib/county/county-workbench-event-links";

/** In-app county playbook hub — KPIs, outreach contacts, link to full workbench. */
export function countyPlaybookHref(_countyName: string, electionPlanSlug?: string): string {
  const slug = electionPlanSlug ?? _countyName.toLowerCase().replace(/\s+/g, "-");
  return `/election-plan/counties/${slug.replace(/-county$/, "")}`;
}

/** Sister workbench / public county command (external drill-down). */
export function countyWorkbenchExternalHref(countyName: string, electionPlanSlug?: string): string {
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

export function countyPlaybookOpensInNewTab(_countyName: string): boolean {
  return false;
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

export function eventApprovalsHref(opts?: { city?: string; county?: string }): string {
  const base = "/election-plan/event-approvals";
  if (!opts?.city && !opts?.county) return base;
  const params = new URLSearchParams();
  if (opts.city) params.set("city", opts.city);
  if (opts.county) params.set("county", opts.county);
  return `${base}?${params.toString()}`;
}

export const COUNTY_COVERAGE_EXPLAINER =
  "Coverage = campaign visit contacts completed vs planned for this county’s opportunity tier (Tier A: 5, B: 3, C: 2, D: 1). It measures Kelly/field touch progress — not vote share or registration.";
