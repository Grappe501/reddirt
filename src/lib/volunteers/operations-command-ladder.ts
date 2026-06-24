import type { WorkbenchHierarchyTierId } from "@/lib/volunteers/workbench-hierarchy/tiers";

/** Operational management stack — campaign manager at root, volunteer field signals at base. */
export type OperationsCommandTierId =
  | "campaign_manager"
  | "operators_hub"
  | "lane_command"
  | "leader_command"
  | "leader_workbench"
  | "volunteer_field";

export type OperationsCommandTier = {
  id: OperationsCommandTierId;
  hierarchyTier: WorkbenchHierarchyTierId;
  label: string;
  roleLabel: string;
  description: string;
  dashboardHref: string;
  /** What this tier receives from below (feedback loop). */
  feedbackReceives: string;
  /** What this tier pushes downward (command flow). */
  commandsDown: string;
  /** Key operator dashboards at this tier (lane command only). */
  childLinks?: Array<{ label: string; href: string }>;
};

export const OPERATIONS_COMMAND_STACK: OperationsCommandTier[] = [
  {
    id: "campaign_manager",
    hierarchyTier: "campaign_manager",
    label: "Campaign manager",
    roleLabel: "Steve · CM command",
    description: "Campaign OS root — events, finance, approvals, and statewide rollups from every tier below.",
    dashboardHref: "/admin/campaign-manager-dashboard",
    feedbackReceives: "Quiet leaders, intake backlog, lane gaps, field log totals, finance blockers",
    commandsDown: "Weekly priorities, lane ownership, escalation clears, promotion decisions",
  },
  {
    id: "operators_hub",
    hierarchyTier: "assistant_campaign_manager",
    label: "Operators hub",
    roleLabel: "ACM · statewide operators",
    description: "Eight lane command dashboards plus leader roster — Election Plan operator entry.",
    dashboardHref: "/election-plan/operators",
    feedbackReceives: "Lane-specific queues roll up here before CM — intake, comms, VR, events, coalition, coverage, settlement",
    commandsDown: "Operator review, placement, lane drill-downs, workbench unlocks",
    childLinks: [
      { label: "Volunteer intake", href: "/election-plan/operators/volunteer-intake" },
      { label: "Comms command", href: "/election-plan/operators/comms-command" },
      { label: "Voter registration", href: "/election-plan/operators/voter-registration" },
      { label: "Events & Mobilize", href: "/election-plan/operators/events-command" },
      { label: "Coalition", href: "/election-plan/operators/coalition-command" },
      { label: "Leader dashboard", href: "/election-plan/operators/leader-dashboard" },
      { label: "Lane coverage", href: "/election-plan/operators/lane-coverage" },
      { label: "Grassroots settlement", href: "/election-plan/operators/grassroots-fundraising-settlement" },
    ],
  },
  {
    id: "lane_command",
    hierarchyTier: "cluster",
    label: "Lane command boards",
    roleLabel: "Cluster · lane owners",
    description: "Statewide lane rollups — each board mirrors a workbench template (vol manager, comms lead, VR lead, etc.).",
    dashboardHref: "/election-plan/operators/volunteer-intake",
    feedbackReceives: "Partner intake, Mobilize gaps, registration drives, coalition readiness — per lane",
    commandsDown: "County and city chairs execute lane rhythm inside their geography",
  },
  {
    id: "leader_command",
    hierarchyTier: "county",
    label: "Leader command",
    roleLabel: "County · field leaders",
    description: "Roster heatmap — who is active, quiet, and missing My Five or leadership fills.",
    dashboardHref: "/election-plan/operators/leaders/command",
    feedbackReceives: "Per-leader field log qty, leadership slot fills, lane assignments",
    commandsDown: "Coach quiet leaders, assign open workbench roles, clear first-touch gaps",
  },
  {
    id: "leader_workbench",
    hierarchyTier: "city",
    label: "Leader workbench",
    roleLabel: "City · personal command",
    description: "v4.0 workbench — My Five, team roster, field log, lane drill-downs, work pages, templates.",
    dashboardHref: "/election-plan/operators/leaders/me",
    feedbackReceives: "My Five mapping, follow-up debt, open leadership slots, live KPIs",
    commandsDown: "Personal next actions, lane checklists, geographic workbench edits",
    childLinks: [
      { label: "Leader dashboard", href: "/election-plan/operators/leader-dashboard" },
      { label: "County coverage", href: "/election-plan/leadership/county-coverage" },
    ],
  },
  {
    id: "volunteer_field",
    hierarchyTier: "volunteer",
    label: "Volunteer field layer",
    roleLabel: "Volunteer · relational base",
    description: "Field log, My Five slots, conversations, and follow-ups — every entry tags operator initials.",
    dashboardHref: "/election-plan/operators/leaders/me#field-log",
    feedbackReceives: "Raw relational signals — conversations, volunteer contacts, leader referrals",
    commandsDown: "Power of 5 walkthrough, onboarding, and campaign pins from workbench",
  },
];

export type OperationsFeedbackSignal = {
  id: string;
  label: string;
  count: number;
  href: string;
  severity: "ok" | "watch" | "action";
  tierId: OperationsCommandTierId;
  description: string;
  /** Open ops work item spawned from this ladder signal, if any. */
  openOpsTask?: { id: string; title: string; status: string } | null;
  /** True when operators can create a CampaignTask from this signal. */
  taskAssignable?: boolean;
};

export function tierById(id: OperationsCommandTierId): OperationsCommandTier | undefined {
  return OPERATIONS_COMMAND_STACK.find((t) => t.id === id);
}
