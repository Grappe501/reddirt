import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import { buildDashboardBlueprint } from "@/lib/agents/dashboard-builder/dashboard-blueprint-builder";
import { recommendUserRolePlacement } from "./user-role-placement-agent";

export type OnboardingRoleId =
  | "candidate"
  | "campaign_manager"
  | "treasurer"
  | "event_planner"
  | "volunteer_coordinator"
  | "county_lead"
  | "host_helper"
  | "finance_helper"
  | "new_admin"
  | "operator";

export type RoleOnboardingProfile = {
  who: string;
  helpingWith: string;
  experience: "none" | "some" | "experienced";
  shouldDo: string[];
  shouldNot: string[];
};

export type RoleOnboardingResult = {
  recommendedRole: OnboardingRoleId;
  campaignUserRole: CampaignUserRole;
  dashboardBlueprintId: string;
  dashboardTitle: string;
  firstThreeTasks: { label: string; href: string }[];
  trainingLinks: { label: string; href: string }[];
  placement: ReturnType<typeof recommendUserRolePlacement>;
};

const ROLE_MAP: Record<OnboardingRoleId, CampaignUserRole> = {
  candidate: "candidate",
  campaign_manager: "campaign_manager",
  treasurer: "treasurer",
  event_planner: "campaign_manager",
  volunteer_coordinator: "operator",
  county_lead: "operator",
  host_helper: "operator",
  finance_helper: "treasurer",
  new_admin: "operator",
  operator: "operator",
};

export function completeRoleOnboarding(profile: RoleOnboardingProfile, roleId: OnboardingRoleId): RoleOnboardingResult {
  const placement = recommendUserRolePlacement({
    who: profile.who,
    helpingWith: profile.helpingWith,
    experience: profile.experience,
    preferredRole: roleId,
  });

  const blueprint = buildDashboardBlueprint({
    roleLabel: roleId,
    taskDescription: profile.helpingWith,
    experience: profile.experience === "none" ? "new" : profile.experience === "experienced" ? "expert" : "experienced",
    detailLevel: profile.experience === "none" ? "simple" : "standard",
    month: "2026-03",
  });

  const campaignUserRole = ROLE_MAP[roleId] ?? "operator";

  return {
    recommendedRole: roleId,
    campaignUserRole,
    dashboardBlueprintId: blueprint.id,
    dashboardTitle: blueprint.title,
    firstThreeTasks: placement.firstTasks,
    trainingLinks: placement.trainingPath,
    placement,
  };
}

export const ONBOARDING_ROLE_OPTIONS: { id: OnboardingRoleId; label: string; description: string }[] = [
  { id: "candidate", label: "Candidate (Kelly)", description: "Approvals, travel totals, calendar truth." },
  { id: "campaign_manager", label: "Campaign manager", description: "Workbench, month review, promotions." },
  { id: "treasurer", label: "Treasurer / finance", description: "Reimbursement packets, receipts, mileage." },
  { id: "event_planner", label: "Event planner", description: "Drilldown planning, workbench queues." },
  { id: "volunteer_coordinator", label: "Volunteer coordinator", description: "Asks, hosts, events (scaffold)." },
  { id: "county_lead", label: "County lead", description: "County memory, local events." },
  { id: "host_helper", label: "Host helper", description: "Intake review, host follow-up." },
  { id: "finance_helper", label: "Finance helper", description: "Receipts, mileage support." },
  { id: "new_admin", label: "New admin", description: "Guided tour — simple surfaces only." },
  { id: "operator", label: "Steve / operator", description: "Full command center, all workflows." },
];
