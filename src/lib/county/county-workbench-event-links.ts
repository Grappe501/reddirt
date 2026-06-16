import { getCountyWorkbenchPortalUrl } from "@/lib/county/county-workbench-portal-url";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import type { ArkansasRegistryCounty } from "@/lib/county/arkansas-county-registry";

/** Sister countyWorkbench app uses short slugs (`pulaski`); RedDirt registry uses `pulaski-county`. */
export function workbenchCountySlug(registrySlug: string): string {
  return registrySlug.replace(/-county$/, "");
}

/** RedDirt county briefing dashboard v2 pages (subset of 75). */
export const REDDIRT_COUNTY_BRIEFING_V2_SLUGS = new Set(["pope", "pulaski", "faulkner"]);

/**
 * County surfaces for campaign-event linking.
 * Primary operator product: `countyWorkbench` (`/counties/[slug]/leader`, calendar, dashboard-v2).
 * RedDirt bridge: `/counties/[slug]` public command + `/admin/counties/[slug]`.
 */
export type CountyEventLinkBundle = {
  registry: ArkansasRegistryCounty;
  displayName: string;
  /** Primary Election Plan county intelligence drilldown. */
  electionPlanCountyHref: string;
  /** RedDirt admin bridge (placeholder panels + outbound links). */
  adminBridgeHref: string;
  /** Public RedDirt county command page. */
  redDirtCountyHref: string;
  /** OIS county placeholder. */
  organizingIntelligenceHref: string;
  /** Sister app — county leader workbench (events, tasks, goals, calendar links). */
  workbenchLeaderHref: string | null;
  /** Sister app — county calendar. */
  workbenchCalendarHref: string | null;
  /** Sister app — County Dashboard V2 (field preview tabs). */
  workbenchDashboardV2Href: string | null;
  /** RedDirt briefing dashboard v2 when built for this county. */
  redDirtBriefingV2Href: string | null;
  workbenchIntelligenceHref: string | null;
  workbenchDirectoryHref: string | null;
  portalConfigured: boolean;
};

export function buildCountyEventLinkBundle(countyLabel: string | null | undefined): CountyEventLinkBundle | null {
  const registry = resolveRegistryCountyFromLabel(countyLabel);
  if (!registry) return null;
  const portal = getCountyWorkbenchPortalUrl();
  const slug = registry.slug;
  const wbSlug = workbenchCountySlug(slug);
  const briefingV2 = REDDIRT_COUNTY_BRIEFING_V2_SLUGS.has(wbSlug) ? `/county-briefings/${wbSlug}/v2` : null;
  return {
    registry,
    displayName: registry.displayName,
    electionPlanCountyHref: `/election-plan/counties/${wbSlug}`,
    adminBridgeHref: `/admin/counties/${slug}`,
    redDirtCountyHref: `/counties/${slug}`,
    organizingIntelligenceHref: `/organizing-intelligence/counties/${slug}`,
    workbenchLeaderHref: portal ? `${portal}/counties/${wbSlug}/leader` : null,
    workbenchCalendarHref: portal ? `${portal}/counties/${wbSlug}/calendar` : null,
    workbenchDashboardV2Href: portal ? `${portal}/counties/${wbSlug}/dashboard-v2` : null,
    redDirtBriefingV2Href: briefingV2,
    workbenchIntelligenceHref: portal ? `${portal}/counties/${wbSlug}/intelligence` : null,
    workbenchDirectoryHref: portal ? `${portal}/counties` : null,
    portalConfigured: Boolean(portal),
  };
}
