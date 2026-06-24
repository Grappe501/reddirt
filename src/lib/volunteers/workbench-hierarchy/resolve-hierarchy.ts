import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { getEffectiveTeamLanes } from "@/lib/volunteers/leader-roster";
import { hasVolunteerManagerRole } from "@/lib/volunteers/leader-workbench-templates";
import { resolveLeaderGeographyScope } from "@/lib/volunteers/leader-scope";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import type { VolunteerLeader } from "@/lib/volunteers/types";

import {
  TIER_EXTENSION_SECTIONS,
  VOLUNTEER_WORKBENCH_SECTIONS,
  type WorkbenchTemplateSection,
} from "./volunteer-template";
import {
  branchesForLeader,
  type WorkBranchTemplate,
} from "./work-branch-templates";
import {
  tierLabel,
  tierOrder,
  tiersThrough,
  upstreamTiers,
  type WorkbenchHierarchyTierId,
} from "./tiers";

export type NestedWorkbenchLink = {
  tier: WorkbenchHierarchyTierId;
  label: string;
  href: string;
  description: string;
  /** True when this leader's tier can open this bench (upstream sees all downstream). */
  accessible: boolean;
};

export type LeaderHierarchyPayload = {
  currentTier: WorkbenchHierarchyTierId;
  currentTierLabel: string;
  tierChain: Array<{
    id: WorkbenchHierarchyTierId;
    label: string;
    active: boolean;
    inherited: boolean;
  }>;
  upstreamTierLabels: string[];
  inheritedSections: WorkbenchTemplateSection[];
  workBranches: WorkBranchTemplate[];
  nestedWorkbenches: NestedWorkbenchLink[];
  doctrine: string;
};

export function resolveLeaderWorkbenchTier(leader: VolunteerLeader): WorkbenchHierarchyTierId {
  if (leader.workbenchTier) return leader.workbenchTier;
  if (leader.slug === "steve-cm" || leader.slug === "kelly-grappe") return "campaign_manager";
  if (leader.assistantCm) return "assistant_campaign_manager";

  const scope = resolveLeaderGeographyScope(leader);
  if (scope.countySlugs.length > 1) return "cluster";

  if (scope.citySlugs.length > 0) {
    if (leader.notes?.toLowerCase().includes("city leader")) return "city";
    if (leader.connections[0]?.kind === "city") return "city";
  }

  if (scope.countySlugs.length > 0) return "county";
  if (leader.commandAccess) return "campaign_manager";
  return "county";
}

function mergeSections(tierIds: WorkbenchHierarchyTierId[]): WorkbenchTemplateSection[] {
  const seen = new Set<string>();
  const out: WorkbenchTemplateSection[] = [];

  for (const section of VOLUNTEER_WORKBENCH_SECTIONS) {
    if (seen.has(section.id)) continue;
    seen.add(section.id);
    out.push(section);
  }

  for (const tierId of tierIds) {
    if (tierId === "volunteer") continue;
    for (const section of TIER_EXTENSION_SECTIONS[tierId] ?? []) {
      if (seen.has(section.id)) continue;
      seen.add(section.id);
      out.push(section);
    }
  }

  return out;
}

function cityWorkbenchHref(citySlug: string): string {
  return `/election-plan/workbenches/${citySlug}`;
}

function cityStrategyHref(citySlug: string): string {
  return `/election-plan/cities/${citySlug}`;
}

export function resolveNestedWorkbenches(
  leader: VolunteerLeader,
  currentTier: WorkbenchHierarchyTierId,
): NestedWorkbenchLink[] {
  const scope = resolveLeaderGeographyScope(leader);
  const currentOrder = tierOrder(currentTier);
  const links: NestedWorkbenchLink[] = [];

  const add = (link: NestedWorkbenchLink) => {
    if (!links.some((l) => l.href === link.href && l.tier === link.tier)) {
      links.push(link);
    }
  };

  add({
    tier: "volunteer",
    label: `${leader.displayName} · volunteer template`,
    href: leaderWorkbenchHref(leader.slug),
    description: "My Five, field log, tasks, and personal CRM — base layer for every leader.",
    accessible: currentOrder >= tierOrder("volunteer"),
  });

  for (const citySlug of scope.citySlugs) {
    const conn = leader.connections.find((c) => c.kind === "city" && c.citySlug === citySlug);
    add({
      tier: "city",
      label: conn?.label ?? `${citySlug} community workbench`,
      href: cityWorkbenchHref(citySlug),
      description: "City leadership slots, events, relationships, and field log.",
      accessible: currentOrder >= tierOrder("city"),
    });
    add({
      tier: "city",
      label: `${citySlug} city strategy`,
      href: cityStrategyHref(citySlug),
      description: "Priority city brief and vote target model.",
      accessible: currentOrder >= tierOrder("city"),
    });
  }

  for (const countySlug of scope.countySlugs) {
    const conn = leader.connections.find((c) => c.kind === "county" && c.countySlug === countySlug);
    const countyName = conn?.kind === "county" ? conn.county : countySlug;
    add({
      tier: "county",
      label: conn?.label ?? `${countyName} County playbook`,
      href: countyPlaybookHref(countyName, countySlug),
      description: "County leadership, registration lane, and nested city workbenches.",
      accessible: currentOrder >= tierOrder("county"),
    });
  }

  if (currentOrder >= tierOrder("cluster") && scope.countySlugs.length > 1) {
    add({
      tier: "cluster",
      label: `Cluster · ${scope.countySlugs.length} counties`,
      href: `/election-plan/operators/leaders/${leader.slug}#hierarchy`,
      description: "Multi-county corridor rollup — county and city workbenches below.",
      accessible: true,
    });
  }

  if (currentOrder >= tierOrder("assistant_campaign_manager") || hasVolunteerManagerRole(leader)) {
    add({
      tier: "assistant_campaign_manager",
      label: "Operators command",
      href: "/election-plan/operators/leaders/command",
      description: "Full leader roster, field log heatmap, and operator sync.",
      accessible: true,
    });
    add({
      tier: "assistant_campaign_manager",
      label: "Field operators",
      href: "/election-plan/operators/field",
      description: "Volunteer management — operator whitelist and capabilities.",
      accessible: true,
    });
  }

  if (currentOrder >= tierOrder("campaign_manager")) {
    add({
      tier: "campaign_manager",
      label: "Election Plan command",
      href: "/election-plan",
      description: "Campaign OS root — statewide CRM rollups and escalations.",
      accessible: true,
    });
    add({
      tier: "campaign_manager",
      label: "Community workbench hub",
      href: "/election-plan/workbenches",
      description: "All city and program workbenches statewide.",
      accessible: true,
    });
  }

  return links.sort((a, b) => tierOrder(a.tier) - tierOrder(b.tier));
}

export function buildLeaderHierarchyPayload(leader: VolunteerLeader): LeaderHierarchyPayload {
  const currentTier = resolveLeaderWorkbenchTier(leader);
  const chainIds = tiersThrough(currentTier);
  const lanes = getEffectiveTeamLanes(leader);
  const includeVolMgmt = Boolean(
    leader.commandAccess || leader.assistantCm || leader.volunteerManagerInterim || hasVolunteerManagerRole(leader) || lanes.includes("operations"),
  );

  const tierChain = tiersThrough("campaign_manager").map((id) => ({
    id,
    label: tierLabel(id),
    active: id === currentTier,
    inherited: tierOrder(id) <= tierOrder(currentTier),
  }));

  const nested = resolveNestedWorkbenches(leader, currentTier);
  const accessibleCount = nested.filter((n) => n.accessible).length;

  return {
    currentTier,
    currentTierLabel: tierLabel(currentTier),
    tierChain,
    upstreamTierLabels: upstreamTiers(currentTier).map(tierLabel),
    inheritedSections: mergeSections(chainIds),
    workBranches: branchesForLeader(lanes, includeVolMgmt),
    nestedWorkbenches: nested,
    doctrine: `Every upstream manager sees all ${accessibleCount} nested workbench surfaces below their tier. Volunteer template sections inherit upward — full CRM path merges field log, My Five, team roster, and participation layer.`,
  };
}

export { volunteerCrmModules } from "./volunteer-template";
