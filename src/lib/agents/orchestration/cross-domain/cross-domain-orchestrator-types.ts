/**
 * Cross-Domain Agent Tool Orchestrator — canonical types (Phase 4B).
 * This layer turns isolated tools into human-gated cross-section campaign packets.
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type { AgentToolRecommendation, AgentToolSafetyLevel, PreparedAgentAction } from "../tooling/agent-tooling-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";

export type CampaignSectionId =
  | "executive_command"
  | "county_intelligence"
  | "communications"
  | "email_os_ecc"
  | "events_calendar"
  | "volunteer_field"
  | "finance_reimbursement"
  | "compliance"
  | "content_media"
  | "donor_fundraising"
  | "scheduling"
  | "research_strategy"
  | "ask_kelly"
  | "tool_builder"
  | "training_copilots"
  | "memory_observations"
  | "public_site"
  | "deployment_readiness";

export type CampaignSection = {
  id: CampaignSectionId;
  label: string;
  mission: string;
  ownedDomains: CampaignDomainId[];
  routePaths: string[];
  apiPaths: string[];
  sourcePaths: string[];
  primaryTools: string[];
  relatedTools: string[];
  upstreamDependencies: CampaignSectionId[];
  downstreamDependencies: CampaignSectionId[];
  sourceHealthIds: string[];
  campaignStateFields: string[];
  knowledgeGraphEntityTypes: string[];
  humanOwners: string[];
  restrictedActions: string[];
  improvesCampaignUnderstandingHow: string;
};

export type CampaignSectionNode = {
  id: CampaignSectionId;
  label: string;
  domains: CampaignDomainId[];
  health: "strong" | "stable" | "weak" | "blocked";
  routePaths: string[];
  toolCount: number;
  ownerRoles: string[];
};

export type CampaignSectionEdge = {
  from: CampaignSectionId;
  to: CampaignSectionId;
  relationship: "depends_on" | "unlocks" | "blocks" | "informs" | "requires_review";
  whyItMatters: string;
  evidence: string[];
};

export type CrossDomainDependencyGraph = {
  nodes: CampaignSectionNode[];
  edges: CampaignSectionEdge[];
  weakSections: CampaignSectionId[];
  blockedSections: CampaignSectionId[];
  highLeverageSections: CampaignSectionId[];
  dependencyWarnings: string[];
};

export type SectionToolDiagnosis = {
  sectionId: CampaignSectionId;
  label: string;
  health: CampaignSectionNode["health"];
  whyNeedsAttention: string;
  affectedSections: CampaignSectionId[];
  recommendedTools: AgentToolRecommendation[];
  blockedTools: string[];
  missingTools: string[];
  humanApprovalGates: string[];
  expectedLearningOutputs: CrossDomainLearningHook[];
};

export type CrossDomainLearningHook = {
  id: string;
  playbookId: string;
  sectionId: CampaignSectionId;
  prompt: string;
  expectedObservationType: "recommendation_feedback" | "workflow_outcome" | "event_hot_wash" | "human_decision" | "tool_usage_signal";
  suggestedLessonType:
    | "what_worked"
    | "what_failed"
    | "county_learning"
    | "message_learning"
    | "event_learning"
    | "workflow_learning"
    | "tool_learning"
    | "strategic_warning"
    | "strategic_opportunity";
  requiresApproval: boolean;
  sensitivity: "public" | "internal" | "strategic" | "sensitive";
  improvesCampaignUnderstandingHow: string;
};

export type CrossDomainPlaybookStep = {
  order: number;
  sectionId: CampaignSectionId;
  toolIds: string[];
  title: string;
  purpose: string;
  output: string;
  safety: AgentToolSafetyLevel;
  humanGateRequired: boolean;
};

export type CrossDomainPlaybook = {
  id: string;
  title: string;
  summary: string;
  trigger: string;
  sections: CampaignSectionId[];
  domains: CampaignDomainId[];
  steps: CrossDomainPlaybookStep[];
  outputs: string[];
  humanReviewChecklist: string[];
  safetyNotes: string[];
  expectedCampaignStateImprovement: string;
  expectedLessons: string[];
  learningHooks: CrossDomainLearningHook[];
};

export type CrossDomainActionPacket = {
  id: string;
  title: string;
  playbookId: string;
  sections: CampaignSectionId[];
  summary: string;
  recommendedOwner: string;
  whyNow: string;
  sourceEvidence: string[];
  preparedActions: PreparedAgentAction[];
  humanApprovalsRequired: string[];
  blockedBy: string[];
  risks: string[];
  expectedCampaignStateImprovement: string;
  expectedLessons: string[];
  doneWhen: string;
  safetySummary: {
    canExecuteNow: false;
    autoExecutionDisabled: true;
    restrictedActions: string[];
    humanGateRequired: true;
  };
  createdAt: string;
};

export type CrossDomainSectionCoverage = {
  sectionId: CampaignSectionId;
  readyToolCount: number;
  plannedToolCount: number;
  blockedToolCount: number;
  coverageStatus: "strong" | "adequate" | "weak" | "missing";
  recommendedNextTool: string;
};

export type CrossDomainSafetySummary = {
  autoExecutionDisabled: true;
  packetsArePreparationOnly: true;
  humanGateRequired: true;
  restrictedActions: string[];
  approvalGateCount: number;
};

export type CrossDomainOrchestrationState = {
  sectionMap: CampaignSection[];
  dependencyGraph: CrossDomainDependencyGraph;
  recommendedSectionFocus: SectionToolDiagnosis | null;
  sectionDiagnoses: SectionToolDiagnosis[];
  playbooks: CrossDomainPlaybook[];
  actionPackets: CrossDomainActionPacket[];
  learningHooks: CrossDomainLearningHook[];
  sectionCoverage: CrossDomainSectionCoverage[];
  safetySummary: CrossDomainSafetySummary;
  sourceHealth: OrchestrationSourceHealth[];
  summary: string;
};

export function emptyCrossDomainOrchestrationState(): CrossDomainOrchestrationState {
  return {
    sectionMap: [],
    dependencyGraph: {
      nodes: [],
      edges: [],
      weakSections: [],
      blockedSections: [],
      highLeverageSections: [],
      dependencyWarnings: [],
    },
    recommendedSectionFocus: null,
    sectionDiagnoses: [],
    playbooks: [],
    actionPackets: [],
    learningHooks: [],
    sectionCoverage: [],
    safetySummary: {
      autoExecutionDisabled: true,
      packetsArePreparationOnly: true,
      humanGateRequired: true,
      restrictedActions: [],
      approvalGateCount: 0,
    },
    sourceHealth: [],
    summary: "Cross-domain agent orchestrator not loaded.",
  };
}
