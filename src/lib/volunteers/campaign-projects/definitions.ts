import type { CampaignProjectStatus, CampaignTaskStatus } from "@prisma/client";

export const CAMPAIGN_PROJECT_PACKET = "CAMPAIGN-PROJECT-5" as const;

export const PROJECT_STATUS_LABELS: Record<CampaignProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const KANBAN_COLUMNS: Array<{ status: CampaignTaskStatus; label: string }> = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "BLOCKED", label: "Blocked" },
  { status: "DONE", label: "Done" },
];

export function slugifyProjectTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function campaignProjectHref(slug: string): string {
  return `/election-plan/operators/projects/${slug}`;
}

export function adminCampaignProjectHref(slug: string): string {
  return `/admin/projects/${slug}`;
}

export type CampaignProjectTemplate = {
  templateKey: string;
  title: string;
  description: string;
  laneId?: string;
  countySlug?: string;
  ownerKind: "campaign_manager" | "lane_lead" | "county_chair" | "leader";
  ownerRole?: string;
  defaultTasks: Array<{ title: string; description: string; dueDays: number; assignedRole: string }>;
};

export const CAMPAIGN_PROJECT_TEMPLATES: CampaignProjectTemplate[] = [
  {
    templateKey: "vr-drive-push",
    title: "Statewide VR drive push",
    description: "Coordinate registration events, Help 10 reporting, and county chair follow-through.",
    laneId: "voter-registration",
    ownerKind: "lane_lead",
    ownerRole: "vr_lane_lead",
    defaultTasks: [
      {
        title: "Confirm county VR goals for this push",
        description: "Review registration dashboard targets and assign county captains.",
        dueDays: 3,
        assignedRole: "vr_lane_lead",
      },
      {
        title: "Schedule two registration events per priority county",
        description: "Align with events command and Mobilize listings.",
        dueDays: 7,
        assignedRole: "events_lane_lead",
      },
    ],
  },
  {
    templateKey: "pulaski-coalition-build",
    title: "Pulaski coalition build",
    description: "Partner outreach, workbench activation, and liaison check-ins for Central Metro.",
    laneId: "coalition",
    countySlug: "pulaski",
    ownerKind: "lane_lead",
    ownerRole: "coalition_lane_lead",
    defaultTasks: [
      {
        title: "Audit Pulaski coalition workbench readiness",
        description: "Open each workbench lane and note blockers.",
        dueDays: 4,
        assignedRole: "coalition_lane_lead",
      },
      {
        title: "Partner intake review — Pulaski",
        description: "Triage new partner leads and assign liaison follow-up.",
        dueDays: 5,
        assignedRole: "coalition_lane_lead",
      },
    ],
  },
  {
    templateKey: "labor-day-readiness",
    title: "Labor Day readiness",
    description: "Cross-lane push: events, comms, travel, and field coverage for Labor Day weekend.",
    ownerKind: "campaign_manager",
    ownerRole: "campaign_manager",
    defaultTasks: [
      {
        title: "Labor Day event promotion checklist",
        description: "Confirm official calendar promotion and public listings.",
        dueDays: 10,
        assignedRole: "events_lane_lead",
      },
      {
        title: "Labor Day comms packet draft",
        description: "Editorial + email draft for weekend visibility.",
        dueDays: 8,
        assignedRole: "comms_lane_lead",
      },
      {
        title: "County fair / Labor Day staffing matrix",
        description: "Assign leaders and volunteers to priority stops.",
        dueDays: 12,
        assignedRole: "volunteer_ops",
      },
    ],
  },
];

export function projectTemplateByKey(key: string): CampaignProjectTemplate | undefined {
  return CAMPAIGN_PROJECT_TEMPLATES.find((t) => t.templateKey === key);
}
