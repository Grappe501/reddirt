/**
 * Role Copilot Orchestration Network — canonical types (Phase 4D).
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type { CampaignSectionId } from "../cross-domain/cross-domain-orchestrator-types";
import type { AgentToolRecommendation, AgentToolSafetyLevel } from "../tooling/agent-tooling-types";
import type { CampaignLesson } from "../knowledge/campaign-knowledge-types";

export type CampaignOrchestrationRoleId =
  | "campaign_manager"
  | "candidate"
  | "communications_director"
  | "field_director"
  | "volunteer_coordinator"
  | "finance_director"
  | "compliance_lead"
  | "scheduler"
  | "county_lead"
  | "digital_director"
  | "research_director"
  | "data_director"
  | "content_director"
  | "event_lead"
  | "operations_lead";

export type CampaignRoleDefinition = {
  id: CampaignOrchestrationRoleId;
  label: string;
  mission: string;
  dailyResponsibilities: string[];
  ownedDomains: CampaignDomainId[];
  relatedSections: CampaignSectionId[];
  primaryTools: string[];
  secondaryTools: string[];
  requiredInputs: string[];
  outputsProduced: string[];
  decisionsPrepared: string[];
  humanApprovalBoundaries: string[];
  restrictedActions: string[];
  trainingNeeds: string[];
  whatThisRoleTeachesCampaignState: string;
};

export type RoleLearningPrompt = {
  id: string;
  roleId: CampaignOrchestrationRoleId;
  prompt: string;
  target: "observation" | "lesson" | "feedback" | "workflow_outcome";
  suggestedDomain: CampaignDomainId;
  requiresApproval: boolean;
  sensitivity: "public" | "internal" | "strategic" | "sensitive";
  improvesCampaignUnderstandingHow: string;
};

export type RoleToolRoute = {
  roleId: CampaignOrchestrationRoleId;
  recommendedTools: AgentToolRecommendation[];
  blockedTools: string[];
  approvalRequiredTools: string[];
  toolSequence: string[];
  teachesCampaign: string[];
  safety: {
    autoExecutionDisabled: true;
    humanGateRequired: true;
    highestSafetyLevel: AgentToolSafetyLevel;
  };
};

export type RoleWorkflowPlan = {
  id: string;
  roleId: CampaignOrchestrationRoleId;
  title: string;
  summary: string;
  domains: CampaignDomainId[];
  sections: CampaignSectionId[];
  steps: {
    order: number;
    title: string;
    toolId?: string;
    safety: AgentToolSafetyLevel;
    humanGateRequired: boolean;
    output: string;
  }[];
  humanApprovalsRequired: string[];
  canExecuteNow: false;
  doneWhen: string;
  teachesCampaignState: string;
};

export type RoleTrainingPlan = {
  roleId: CampaignOrchestrationRoleId;
  currentAssumedLevel: 1 | 2 | 3 | 4 | 5;
  recommendedTrainingModule: string;
  nextLesson: string;
  safetyReminder: string;
  practiceTask: string;
  doneWhen: string;
};

export type RoleBriefing = {
  role: CampaignRoleDefinition;
  executiveSummary: string;
  topPriorities: string[];
  blockers: string[];
  risks: string[];
  opportunities: string[];
  recommendedTools: AgentToolRecommendation[];
  recommendedWorkflows: RoleWorkflowPlan[];
  crossDomainDependencies: string[];
  pendingApprovals: string[];
  relevantLessons: CampaignLesson[];
  learningPrompts: RoleLearningPrompt[];
  doneWhenChecklist: string[];
};

export type RoleCopilotNetworkState = {
  roles: CampaignRoleDefinition[];
  activeRoleBriefing: RoleBriefing | null;
  roleBriefings: RoleBriefing[];
  roleToolRoutes: RoleToolRoute[];
  roleWorkflows: RoleWorkflowPlan[];
  roleTraining: RoleTrainingPlan[];
  roleLearningPrompts: RoleLearningPrompt[];
  safetySummary: {
    autoExecutionDisabled: true;
    humanGateRequired: true;
    restrictedActions: string[];
  };
  summary: string;
};

export function emptyRoleCopilotNetworkState(): RoleCopilotNetworkState {
  return {
    roles: [],
    activeRoleBriefing: null,
    roleBriefings: [],
    roleToolRoutes: [],
    roleWorkflows: [],
    roleTraining: [],
    roleLearningPrompts: [],
    safetySummary: {
      autoExecutionDisabled: true,
      humanGateRequired: true,
      restrictedActions: [],
    },
    summary: "Role Copilot Network not loaded.",
  };
}
