import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";

/** Kelly OS copilot roles — guided placement (not SaaS tenancy). */
export type RoleCopilotId =
  | "candidate"
  | "campaign_manager"
  | "treasurer"
  | "event_planner"
  | "volunteer_coordinator"
  | "volunteer"
  | "intern"
  | "field_manager"
  | "county_lead"
  | "host"
  | "social_media_lead"
  | "communications_lead"
  | "finance_helper"
  | "new_admin"
  | "operator";

export type CopilotSkillLevel = "beginner" | "intermediate" | "advanced";
export type CopilotProgressLevel = 1 | 2 | 3;

export type RoleCopilotDefinition = {
  id: RoleCopilotId;
  label: string;
  campaignUserRole: CampaignUserRole;
  mission: string;
  focusAreas: string[];
  firstTasks: { label: string; href: string }[];
  dailyTasks: string[];
  weeklyTasks: string[];
  trainingModuleIds: string[];
  dashboardModuleIds: DashboardBlockId[];
  safeActions: string[];
  gatedActions: string[];
  doNotTouch: string[];
  escalationPath: string;
  explanationStyle: "warm" | "direct" | "precise" | "educational";
  skillLevels: CopilotSkillLevel[];
  progressionLevels: CopilotProgressLevel[];
  successMetrics: string[];
  linkedToolIds: string[];
};

export type RoleCopilotBrief = {
  role: RoleCopilotId;
  headline: string;
  mission: string;
  focusToday: string[];
  doNotTouch: string[];
  escalation: string;
  trainingHref: string;
  commandCenterHref: string;
};

export type RecommendRoleCopilotInput = {
  who?: string;
  helpingWith?: string;
  experience?: "none" | "some" | "experienced";
  availableHoursPerWeek?: number;
  preferredRole?: RoleCopilotId;
  pathname?: string;
};
