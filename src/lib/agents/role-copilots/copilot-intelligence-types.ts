import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import type { CopilotSkillLevel, RoleCopilotId } from "./role-copilot-types";

export type CopilotTaskPackageType =
  | "first"
  | "daily"
  | "urgent"
  | "training"
  | "approval"
  | "event"
  | "volunteer"
  | "finance"
  | "communications"
  | "county"
  | "dashboard_setup";

export type CopilotTaskPackage = {
  id: string;
  type: CopilotTaskPackageType;
  title: string;
  role: RoleCopilotId;
  whyItMatters: string;
  estimatedMinutes: number;
  difficulty: "easy" | "moderate" | "advanced";
  prerequisites: string[];
  steps: string[];
  routeLinks: { label: string; href: string }[];
  toolsNeeded: string[];
  trainingNeeded: string[];
  humanApprovalGates: string[];
  completionCriteria: string[];
  escalationRole: string;
  observationEvents: string[];
  safeOnly: boolean;
};

export type CopilotReadinessDimensions = {
  roleReadiness: number;
  trainingReadiness: number;
  dashboardReadiness: number;
  taskReadiness: number;
  riskReadiness: number;
  autonomyReadiness: number;
  overall: number;
};

export type CopilotReadinessReport = {
  role: RoleCopilotId;
  dimensions: CopilotReadinessDimensions;
  safeNow: string[];
  needsTrainingFirst: string[];
  needsSupervisor: string[];
  tooAdvancedModules: DashboardBlockId[];
  hiddenUntilLater: string[];
  label: "getting_started" | "building_skills" | "operational" | "expert";
};

export type CopilotRoleSnapshot = {
  role: RoleCopilotId;
  label: string;
  mission: string;
  skillLevel: CopilotSkillLevel;
  progressionLevel: number;
  month: string;
  pathname?: string;
};

export type CopilotCampaignContext = {
  month: string;
  systemHealthScore?: number;
  activeBlockers: string[];
  pendingApprovals?: number;
  routeContext: string;
  recentFriction: string[];
};

export type CopilotIntelligenceBrief = {
  snapshot: CopilotRoleSnapshot;
  campaignContext: CopilotCampaignContext;
  recommendedNextTask: CopilotTaskPackage;
  topThreeTasks: CopilotTaskPackage[];
  trainingRecommendation: { moduleId: string; title: string; href: string; reason: string };
  dashboardModules: DashboardModuleRecommendation[];
  riskWarnings: string[];
  escalationNote: string;
  confidence: "high" | "medium" | "low";
  explanationStyle: "warm" | "direct" | "precise" | "educational";
  safeActionLinks: { label: string; href: string; risk: "safe" | "gated" | "forbidden" }[];
  toolIds: string[];
  generatedAt: string;
};

export type DashboardModuleRecommendation = {
  id: DashboardBlockId;
  title: string;
  locked: boolean;
  trainingModuleId?: string;
};

export type CopilotIntelligenceInput = {
  role: RoleCopilotId;
  skillLevel?: CopilotSkillLevel;
  availableMinutes?: number;
  pathname?: string;
  month?: string;
  completedTrainingIds?: string[];
  progressionLevel?: number;
  observations?: UserObservationEntry[];
  osSnapshot?: {
    systemHealthScore?: number;
    activeBlockers?: string[];
    pendingApprovals?: number;
  };
};
