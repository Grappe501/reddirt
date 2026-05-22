import { getCountyWorkbenchPortalUrl } from "@/lib/county/county-workbench-portal-url";
import { resolveRegistryCountyFromLabel } from "@/lib/county/resolve-county-label";
import type { ArkansasRegistryCounty } from "@/lib/county/arkansas-county-registry";

/**
 * County surfaces for campaign-event linking.
 * Primary operator product: `countyWorkbench` (`/counties/[slug]/dashboard-v2`, etc.).
 * RedDirt bridge: `/admin/counties/[slug]` + public `/counties/[slug]`.
 */
export type CountyEventLinkBundle = {
  registry: ArkansasRegistryCounty;
  displayName: string;
  /** RedDirt admin bridge (placeholder panels + outbound links). */
  adminBridgeHref: string;
  /** Public RedDirt county command page. */
  redDirtCountyHref: string;
  /** OIS county placeholder. */
  organizingIntelligenceHref: string;
  /** Sister app — County Dashboard V2 (canonical operator view when portal URL set). */
  workbenchDashboardV2Href: string | null;
  workbenchIntelligenceHref: string | null;
  workbenchDirectoryHref: string | null;
  portalConfigured: boolean;
};

export function buildCountyEventLinkBundle(countyLabel: string | null | undefined): CountyEventLinkBundle | null {
  const registry = resolveRegistryCountyFromLabel(countyLabel);
  if (!registry) return null;
  const portal = getCountyWorkbenchPortalUrl();
  const slug = registry.slug;
  return {
    registry,
    displayName: registry.displayName,
    adminBridgeHref: `/admin/counties/${slug}`,
    redDirtCountyHref: `/counties/${slug}`,
    organizingIntelligenceHref: `/organizing-intelligence/counties/${slug}`,
    workbenchDashboardV2Href: portal ? `${portal}/counties/${slug}/dashboard-v2` : null,
    workbenchIntelligenceHref: portal ? `${portal}/counties/${slug}/intelligence` : null,
    workbenchDirectoryHref: portal ? `${portal}/counties` : null,
    portalConfigured: Boolean(portal),
  };
}
