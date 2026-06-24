/** Leadership workbench hierarchy — volunteer nested under city under county under cluster under ACM under CM. */

export const WORKBENCH_HIERARCHY_TIERS = [
  {
    id: "volunteer",
    label: "Volunteer",
    shortLabel: "Volunteer",
    order: 0,
    description: "Simple participant workbench — My Five, field log, tasks, and personal CRM.",
  },
  {
    id: "city",
    label: "City leader",
    shortLabel: "City",
    order: 1,
    description: "Community workbench owner — city leadership slots, local events, volunteer pipeline.",
  },
  {
    id: "county",
    label: "County leader",
    shortLabel: "County",
    order: 2,
    description: "County playbook owner — all city workbenches in county, county KPI rollups.",
  },
  {
    id: "cluster",
    label: "Cluster leader",
    shortLabel: "Cluster",
    order: 3,
    description: "Multi-county corridor oversight — regional coordinators and cross-county rollups.",
  },
  {
    id: "assistant_campaign_manager",
    label: "Assistant campaign manager",
    shortLabel: "ACM",
    order: 4,
    description: "Statewide flex command — operators, field admin, all lanes open while role is assigned.",
  },
  {
    id: "campaign_manager",
    label: "Campaign manager",
    shortLabel: "CM",
    order: 5,
    description: "Campaign OS root — full hierarchy visibility, escalations, and CRM rollups.",
  },
] as const;

export type WorkbenchHierarchyTierId = (typeof WORKBENCH_HIERARCHY_TIERS)[number]["id"];

export function tierOrder(id: WorkbenchHierarchyTierId): number {
  return WORKBENCH_HIERARCHY_TIERS.find((t) => t.id === id)?.order ?? 0;
}

export function tierLabel(id: WorkbenchHierarchyTierId): string {
  return WORKBENCH_HIERARCHY_TIERS.find((t) => t.id === id)?.label ?? id;
}

/** Upstream tiers inherit every section and downstream bench from lower tiers. */
export function tiersThrough(current: WorkbenchHierarchyTierId): WorkbenchHierarchyTierId[] {
  const max = tierOrder(current);
  return WORKBENCH_HIERARCHY_TIERS.filter((t) => t.order <= max).map((t) => t.id);
}

export function upstreamTiers(current: WorkbenchHierarchyTierId): WorkbenchHierarchyTierId[] {
  const max = tierOrder(current);
  return WORKBENCH_HIERARCHY_TIERS.filter((t) => t.order > max).map((t) => t.id);
}
