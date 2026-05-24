/**
 * Cross-Domain Agent Tool Orchestrator — canonical types (Phase 4B).
 * The orchestrator prepares section-aware packets only; it never executes campaign actions.
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type { AgentToolRecommendation, AgentToolSafetyLevel, PreparedAgentAction } from "../tooling/agent-tooling-types";

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

export type CampaignSectionMapEntry = {
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
  health: "strong" | "stable" | "weak" | "blocked";
  leverageScore: number;
  summary: string;
  ownedDomains: CampaignDomainId[];
};

export type CampaignSectionEdge = {
  from: CampaignSectionId;
  to: CampaignSectionId;
  relationship: "unlocks" | "depends_on" | "informs" | "blocks" | "requires_review";
  whyItMatters: string;
  strength: "high" | "medium" | "low";
};

export type CrossDomainDependencyGraph = {
  nodes: CampaignSectionNode[];
  edges: CampaignSectionEdge[];
  weakSections: CampaignSectionId[];
  blockedSections: CampaignSectionId[];
  highLeverageSections: CampaignSectionId[];
  dependencyWarnings: string[];
};

export type SectionDiagnosis = {
  sectionId: CampaignSectionId;
  label: string;
  urgency: "P0" | "P1" | "P2";
  confidence: "high" | "medium" | "low";
  summary: string;
  affectedSections: CampaignSectionId[];
  recommendedTools: AgentToolRecommendation[];
  blockedTools: string[];
  missingTools: AgentToolRecommendation[];
  humanApprovalGates: string[];
  expectedLearningOutputs: CrossDomainLearningHook[];
};

export type CrossDomainRouterResult = {
  sectionDiagnoses: SectionDiagnosis[];
  recommendedToolsBySection: Record<CampaignSectionId, AgentToolRecommendation[]>;
  crossSectionSequences: CrossDomainPlaybook[];
  blockedTools: string[];
  missingTools: AgentToolRecommendation[];
  humanApprovalGates: string[];
  expectedLearningOutputs: CrossDomainLearningHook[];
  recommendedSectionFocus: SectionDiagnosis | null;
};

export type CrossDomainPlaybookStep = {
  order: number;
  sectionId: CampaignSectionId;
  toolId: string;
  title: string;
  purpose: string;
  safety: AgentToolSafetyLevel;
  humanGateRequired: boolean;
  expectedOutput: string;
};

export type CrossDomainPlaybook = {
  id: string;
  title: string;
  summary: string;
  sections: CampaignSectionId[];
  trigger: string;
  steps: CrossDomainPlaybookStep[];
  outputPacketTitle: string;
  expectedOutcome: string;
  humanGateRequired: true;
  safetyNotes: string[];
  learningHookIds: string[];
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
    autoExecutionDisabled: true;
    canExecuteNow: false;
    restrictedActions: string[];
  };
  createdAt: string;
};

export type CrossDomainLearningHook = {
  id: string;
  playbookId: string;
  packetId?: string;
  sectionId: CampaignSectionId;
  prompt: string;
  expectedObservationType: "recommendation_feedback" | "workflow_outcome" | "event_hot_wash" | "human_decision" | "tool_usage_signal";
  suggestedLessonType: "what_worked" | "what_failed" | "emerging_pattern" | "county_learning" | "message_learning" | "workflow_learning" | "knowledge_gap";
  requiresApproval: boolean;
  sensitivity: "public" | "internal" | "strategic" | "sensitive";
  updatesCampaignStateFields: string[];
};

export type CrossDomainSectionCoverage = {
  sectionId: CampaignSectionId;
  readyToolCount: number;
  blockedToolCount: number;
  coverageStatus: "strong" | "adequate" | "weak" | "missing";
  bestNextTool?: string;
};

export type CrossDomainSafetySummary = {
  autoExecutionDisabled: true;
  humanGateRequired: true;
  packetCount: number;
  restrictedActions: string[];
  unsafeExecutionButtonsExposed: false;
};

export type CrossDomainOrchestrationState = {
  sectionMap: CampaignSectionMapEntry[];
  dependencyGraph: CrossDomainDependencyGraph;
  recommendedSectionFocus: SectionDiagnosis | null;
  playbooks: CrossDomainPlaybook[];
  actionPackets: CrossDomainActionPacket[];
  learningHooks: CrossDomainLearningHook[];
  sectionCoverage: CrossDomainSectionCoverage[];
  safetySummary: CrossDomainSafetySummary;
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
    playbooks: [],
    actionPackets: [],
    learningHooks: [],
    sectionCoverage: [],
    safetySummary: {
      autoExecutionDisabled: true,
      humanGateRequired: true,
      packetCount: 0,
      restrictedActions: [],
      unsafeExecutionButtonsExposed: false,
    },
    summary: "Cross-domain agent orchestrator not loaded.",
  };
}
