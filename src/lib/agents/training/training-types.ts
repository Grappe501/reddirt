import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";

export type TrainingLevel = "intro" | "core" | "advanced";
export type TrainingCategory =
  | "campaign_basics"
  | "campaign_os"
  | "candidate_approvals"
  | "event_planning"
  | "travel_reimbursement"
  | "finance_receipts"
  | "compliance"
  | "hot_wash"
  | "county_intelligence"
  | "volunteer_management"
  | "field_organizing"
  | "power_of_five"
  | "communications"
  | "social_media"
  | "host_support"
  | "data_privacy"
  | "ai_command_center"
  | "dashboard_builder"
  | "onboarding_users";

export type TrainingModule = {
  id: string;
  title: string;
  category: TrainingCategory;
  roleTargets: RoleCopilotId[];
  level: TrainingLevel;
  estimatedMinutes: number;
  description: string;
  learningObjectives: string[];
  checklist: string[];
  handsOnTask: string;
  completionCriteria: string[];
  prerequisiteModuleIds: string[];
  unlocksModuleIds: string[];
  unlocksDashboardModules: DashboardBlockId[];
  humanSupervisorRequired: boolean;
  safetyNotes: string[];
  linkedRoute: string;
  linkedToolIds: string[];
};

export type TrainingProgressRecord = {
  operatorId: string;
  role: RoleCopilotId;
  completedModuleIds: string[];
  startedModuleIds: string[];
  currentPathId?: string;
  level: number;
  updatedAt: string;
};
