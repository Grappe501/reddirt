/**
 * Phase 11 P2 — Staff strategy command surface inventory.
 */
export const STAFF_STRATEGY_COMMAND_HUB_HREF = "/admin/intelligence/staff-strategy-command";

export type StaffStrategySurfaceId =
  | "morning-brief"
  | "briefing-papers"
  | "writing-toolbox"
  | "strategic-target-pathway"
  | "campaign-intelligence-graph"
  | "scenario-simulation";

export type StaffStrategySurface = {
  id: StaffStrategySurfaceId;
  title: string;
  summary: string;
  href: string;
  nsiTag?: string;
  campaignSystemRefs: string[];
};

export const STAFF_STRATEGY_SURFACES: StaffStrategySurface[] = [
  {
    id: "morning-brief",
    title: "Morning intelligence brief",
    summary: "NSI-7 governed daily composition for leadership review — not autonomous publishing.",
    href: "/admin/intelligence/morning-brief",
    nsiTag: "NSI-7",
    campaignSystemRefs: ["WORKBENCH_MORNING_BRIEF_AND_DAILY_OBJECTIVE_SYSTEM"],
  },
  {
    id: "briefing-papers",
    title: "Briefing papers",
    summary: "Strategic briefing paper engine — staff-authored depth before media hits and debate prep.",
    href: "/admin/intelligence/briefing-papers",
    nsiTag: "NSI-7",
    campaignSystemRefs: ["MESSAGE_CREATION_TO_DISTRIBUTION"],
  },
  {
    id: "writing-toolbox",
    title: "Writing toolbox",
    summary: "Governed writing surfaces — tone, claims gate, and distribution discipline for staff comms.",
    href: "/admin/intelligence/writing-toolbox",
    campaignSystemRefs: ["MESSAGE_CREATION_TO_DISTRIBUTION"],
  },
  {
    id: "strategic-target-pathway",
    title: "Strategic target pathway",
    summary: "Victory math, registration goals, county briefings rollup — NSI-7 field math command.",
    href: "/admin/intelligence/strategic-target-pathway",
    nsiTag: "NSI-7",
    campaignSystemRefs: ["SIMULATION_AND_FORECASTING_SYSTEM_PLAN"],
  },
  {
    id: "campaign-intelligence-graph",
    title: "Campaign intelligence graph",
    summary: "Unified entity resolution — bills, narratives, doctrines, philosophy nodes (NSI-4).",
    href: "/admin/intelligence/campaign-intelligence-graph",
    nsiTag: "NSI-4",
    campaignSystemRefs: ["CAMPAIGN_TOOL_STACK_OPERATING_SYSTEM_MAP"],
  },
  {
    id: "scenario-simulation",
    title: "Scenario simulation",
    summary: "Strategic scenario modeling for debate and field decisions — pairs with simulation plan manual.",
    href: "/admin/intelligence/scenario-simulation",
    campaignSystemRefs: ["SIMULATION_AND_FORECASTING_SYSTEM_PLAN"],
  },
];

export function listStaffStrategySurfaces(): StaffStrategySurface[] {
  return STAFF_STRATEGY_SURFACES;
}

export function getStaffStrategySurface(id: StaffStrategySurfaceId): StaffStrategySurface | undefined {
  return STAFF_STRATEGY_SURFACES.find((s) => s.id === id);
}
