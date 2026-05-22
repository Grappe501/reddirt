import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import { buildDashboardBlueprint } from "@/lib/agents/dashboard-builder/dashboard-blueprint-builder";
import {
  buildRoleCopilotBrief,
  buildRoleFirstTasks,
  recommendRoleCopilot,
} from "@/lib/agents/role-copilots/role-copilot-engine";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { getRoleTrainingPath } from "@/lib/agents/training/training-path-builder";
import { buildProgressionSummary } from "@/lib/agents/progression/progression-summary";
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
  /** V2 */
  availableHoursPerWeek?: number;
  preferredWorkStyle?: "async" | "meetings" | "mixed";
  skillConfidence?: "low" | "medium" | "high";
  campaignExperience?: "first" | "some" | "veteran";
  techComfort?: "low" | "medium" | "high";
  interests?: string[];
  supervisorContact?: string;
};

export type RoleOnboardingResult = {
  recommendedRole: OnboardingRoleId;
  copilotRole: RoleCopilotId;
  campaignUserRole: CampaignUserRole;
  dashboardBlueprintId: string;
  dashboardTitle: string;
  firstThreeTasks: { label: string; href: string }[];
  trainingLinks: { label: string; href: string }[];
  placement: ReturnType<typeof recommendUserRolePlacement>;
  copilotBrief: ReturnType<typeof buildRoleCopilotBrief>;
  trainingPath: ReturnType<typeof getRoleTrainingPath>;
  progression: ReturnType<typeof buildProgressionSummary>;
  doNotTouch: string[];
  escalationPath: string;
  onboardingScore: number;
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

const ONBOARDING_TO_COPILOT: Record<OnboardingRoleId, RoleCopilotId> = {
  candidate: "candidate",
  campaign_manager: "campaign_manager",
  treasurer: "treasurer",
  event_planner: "event_planner",
  volunteer_coordinator: "volunteer_coordinator",
  county_lead: "county_lead",
  host_helper: "host",
  finance_helper: "finance_helper",
  new_admin: "new_admin",
  operator: "operator",
};

function skillFromProfile(profile: RoleOnboardingProfile): "beginner" | "intermediate" | "advanced" {
  if (profile.skillConfidence === "high" || profile.experience === "experienced") return "advanced";
  if (profile.skillConfidence === "low" || profile.experience === "none") return "beginner";
  return "intermediate";
}

export function completeRoleOnboarding(profile: RoleOnboardingProfile, roleId: OnboardingRoleId): RoleOnboardingResult {
  return completeRoleOnboardingV2(profile, roleId);
}

export function completeRoleOnboardingV2(
  profile: RoleOnboardingProfile,
  roleId: OnboardingRoleId,
): RoleOnboardingResult {
  const copilotRole = ONBOARDING_TO_COPILOT[roleId] ?? "new_admin";
  const placement = recommendUserRolePlacement({
    who: profile.who,
    helpingWith: profile.helpingWith,
    experience: profile.experience,
    preferredRole: roleId,
  });

  const rec = recommendRoleCopilot({
    who: profile.who,
    helpingWith: profile.helpingWith,
    experience: profile.experience,
    availableHoursPerWeek: profile.availableHoursPerWeek,
    preferredRole: copilotRole,
  });

  const blueprint = buildDashboardBlueprint({
    roleLabel: roleId,
    taskDescription: profile.helpingWith,
    experience:
      profile.experience === "none" ? "new" : profile.experience === "experienced" ? "expert" : "experienced",
    detailLevel: profile.techComfort === "low" || profile.experience === "none" ? "simple" : "standard",
    month: "2026-03",
  });

  const campaignUserRole = ROLE_MAP[roleId] ?? "operator";
  const skill = skillFromProfile(profile);
  const hours = profile.availableHoursPerWeek ?? 5;
  const firstThreeTasks = buildRoleFirstTasks(rec.role, hours / 3, skill);
  const trainingPath = getRoleTrainingPath(rec.role, skill);
  const copilotBrief = buildRoleCopilotBrief(rec.role);
  const progression = buildProgressionSummary(rec.role);
  const def = buildRoleCopilotBrief(rec.role);

  let onboardingScore = 40;
  if (profile.who.trim()) onboardingScore += 10;
  if (profile.helpingWith.trim()) onboardingScore += 10;
  if (profile.availableHoursPerWeek) onboardingScore += 10;
  if (profile.supervisorContact) onboardingScore += 10;
  if (profile.techComfort) onboardingScore += 10;
  onboardingScore = Math.min(100, onboardingScore);

  return {
    recommendedRole: roleId,
    copilotRole: rec.role,
    campaignUserRole,
    dashboardBlueprintId: blueprint.id,
    dashboardTitle: blueprint.title,
    firstThreeTasks: firstThreeTasks.length ? firstThreeTasks : placement.firstTasks,
    trainingLinks: trainingPath.moduleIds.slice(0, 5).map((id) => ({
      label: id,
      href: `/admin/training?role=${rec.role}&module=${id}`,
    })),
    placement,
    copilotBrief,
    trainingPath,
    progression,
    doNotTouch: def.doNotTouch,
    escalationPath: def.escalation,
    onboardingScore,
  };
}

export const ONBOARDING_ROLE_OPTIONS: { id: OnboardingRoleId; label: string; description: string }[] = [
  { id: "candidate", label: "Candidate (Kelly)", description: "Approvals, travel totals, calendar truth." },
  { id: "campaign_manager", label: "Campaign manager", description: "Workbench, month review, promotions." },
  { id: "treasurer", label: "Treasurer / finance", description: "Reimbursement packets, receipts, mileage." },
  { id: "event_planner", label: "Event planner", description: "Drilldown planning, workbench queues." },
  { id: "volunteer_coordinator", label: "Volunteer coordinator", description: "Staffing, assignments, training." },
  { id: "county_lead", label: "County lead", description: "County memory, local events." },
  { id: "host_helper", label: "Host helper", description: "Intake review, host follow-up." },
  { id: "finance_helper", label: "Finance helper", description: "Receipts, mileage support." },
  { id: "new_admin", label: "New admin", description: "Guided tour — simple surfaces only." },
  { id: "operator", label: "Steve / operator", description: "Full command center, all workflows." },
];
