/** Shared leadership workbench shell — mirrors LEADERSHIP_WORKBENCH_ARCHITECTURE.md v2 sections. */

export const LEADER_WORKBENCH_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "command-flow", label: "Command flow" },
  { id: "geography", label: "City & county" },
  { id: "work-pages", label: "Work pages" },
  { id: "hierarchy", label: "Hierarchy & branches" },
  { id: "lead-templates", label: "Lead templates & KPIs" },
  { id: "role", label: "Role & responsibilities" },
  { id: "areas", label: "My areas" },
  { id: "kpi", label: "KPI dashboard" },
  { id: "power-of-5", label: "Power of 5" },
  { id: "my-five", label: "My Five" },
  { id: "next-actions", label: "Next actions" },
  { id: "my-work", label: "My work" },
  { id: "training", label: "Training & tools" },
] as const;

export type LeaderWorkbenchSectionId = (typeof LEADER_WORKBENCH_SECTIONS)[number]["id"];

export const LANE_RESPONSIBILITIES: Record<string, string[]> = {
  county: [
    "Own county playbook progress and local leadership slots",
    "Coordinate community workbenches inside your county",
    "Report field results and relationship growth weekly",
  ],
  events: [
    "Plan and execute local events — host, committee, and follow-up",
    "Coordinate with photography, fundraising, and comms lanes",
    "Log attendance and post-event relational follow-ups",
  ],
  fundraising: [
    "Identify and steward grassroots fundraising opportunities",
    "Support ride-alongs and donor conversations",
    "Track asks, thank-yous, and follow-up within 48 hours",
  ],
  comms: [
    "Coordinate local social and message distribution",
    "Support debate prep and earned media where assigned",
    "Keep county/city narrative aligned with statewide message hub",
  ],
  campus: [
    "Build campus relational networks and youth outreach",
    "Partner with student leaders and faculty allies",
    "Connect campus activity to county registration goals",
  ],
  coalition: [
    "Grow trusted relationships across faith, labor, and community orgs",
    "Bridge NAACP, Muslim community, union, and civic partners",
    "Escalate coalition gaps to campaign command when blocked",
  ],
  "voter-registration": [
    "Lead registration drives and Help 10 participation",
    "Track registration deadlines and drop-off locations",
    "Pair registration work with relational follow-up",
  ],
  operations: [
    "Support volunteer HQ, intake, and cross-lane coordination",
    "Assist campaign manager with statewide flex assignments",
    "Keep operator field entries current for your geography",
  ],
};
