/**
 * Public county intelligence model — which counties have dashboard v2 vs command-only scaffolds.
 * Single source for /counties cards and county command cross-links (no per-county bespoke dashboards).
 */

import { getRegistryCountyBySlug, regionMetaForId } from "@/lib/county/arkansas-county-registry";

export type CountyDashboardTier = "prototype" | "next_build" | "command_scaffold";

export type CountyIntelligenceEntry = {
  slug: string;
  displayName: string;
  regionShortLabel: string;
  dashboardTier: CountyDashboardTier;
  /** Short label for cards and filters */
  dashboardStatusLabel: string;
  organizingStatusLabel: string;
  nextActionLabel: string;
  /** Public county command */
  commandHref: string;
  /** OIS county placeholder (no live rollup) */
  intelligenceHref: string;
  /** Gold-sample v2 shell — Pope only */
  countyDashboardV2Href: string | null;
};

const TIER_BY_SLUG = new Map<string, CountyDashboardTier>([
  ["pope-county", "prototype"],
  ["benton-county", "next_build"],
  ["washington-county", "next_build"],
]);

function dashboardStatusLabel(tier: CountyDashboardTier): string {
  switch (tier) {
    case "prototype":
      return "Dashboard v2 (prototype)";
    case "next_build":
      return "Dashboard v2 — next build";
    case "command_scaffold":
    default:
      return "Command page + OIS placeholder";
  }
}

function organizingStatusFor(tier: CountyDashboardTier): string {
  switch (tier) {
    case "prototype":
      return "Prototype narrative and KPI shell live — use for training and captain recruitment.";
    case "next_build":
      return "NWA primary turf queued after Pope validation — command and intake stay active.";
    case "command_scaffold":
    default:
      return "Registry-backed command page; organizing intelligence tiles roll out county-by-county.";
  }
}

function nextActionFor(tier: CountyDashboardTier): string {
  switch (tier) {
    case "prototype":
      return "Open Dashboard v2 (prototype) and align captains on Power of 5 language.";
    case "next_build":
      return "Hold field on command page; watch for Benton/Washington v2 in a future packet.";
    case "command_scaffold":
    default:
      return "Open county command, then start or join a local team from Get Involved.";
  }
}

/**
 * Resolves intelligence entry for any Arkansas registry slug.
 */
export function getCountyIntelligenceEntryForSlug(slug: string): CountyIntelligenceEntry | null {
  const reg = getRegistryCountyBySlug(slug);
  if (!reg) return null;
  const tier = TIER_BY_SLUG.get(slug) ?? "command_scaffold";
  const regionShortLabel = regionMetaForId(reg.regionId)?.shortLabel ?? reg.regionId;
  const countyDashboardV2Href = tier === "prototype" ? "/county-briefings/pope/v2" : null;

  return {
    slug: reg.slug,
    displayName: reg.displayName,
    regionShortLabel,
    dashboardTier: tier,
    dashboardStatusLabel: dashboardStatusLabel(tier),
    organizingStatusLabel: organizingStatusFor(tier),
    nextActionLabel: nextActionFor(tier),
    commandHref: `/counties/${reg.slug}`,
    intelligenceHref: `/organizing-intelligence/counties/${reg.slug}`,
    countyDashboardV2Href,
  };
}

export function listCountyIntelligenceTiers(): CountyDashboardTier[] {
  return ["prototype", "next_build", "command_scaffold"];
}

export function countyDashboardTierShortLabel(tier: CountyDashboardTier): string {
  switch (tier) {
    case "prototype":
      return "Prototype";
    case "next_build":
      return "Next build";
    case "command_scaffold":
    default:
      return "Standard";
  }
}
