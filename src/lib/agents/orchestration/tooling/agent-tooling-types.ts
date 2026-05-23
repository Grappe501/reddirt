/**
 * AI Agent Tooling Brain — canonical types (Phase 4A).
 */

import type { CampaignDomainId } from "../campaign-state-types";

export type AgentToolSafetyLevel = "safe_read" | "safe_prepare" | "approval_required" | "prohibited";

export type AgentToolCapabilityStatus = "ready" | "partial" | "planned" | "deprecated" | "blocked";

export type AgentToolCapability = {
  id: string;
  label: string;
  description: string;
  domain: CampaignDomainId;
  domains: CampaignDomainId[];
  category: string;
  inputShape: string;
  outputShape: string;
  readOnly: boolean;
  preparesAction: boolean;
  executesAction: boolean;
  requiresHumanApproval: boolean;
  restrictedActionType?: string;
  safetyLevel: AgentToolSafetyLevel;
  sourcePaths: string[];
  routePaths: string[];
  testPaths: string[];
  docsPaths: string[];
  improvesCampaignUnderstandingHow: string;
  campaignStateInputs: string[];
  knowledgeGraphInputs: string[];
  lessonsInputs: string[];
  producedSignals: string[];
  producedObservations: string[];
  producedLessons: string[];
  freshness: "fresh" | "aging" | "stale";
  status: AgentToolCapabilityStatus;
  blockers: string[];
  ownerRole?: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type AgentToolRecommendation = {
  id: string;
  toolId: string;
  title: string;
  summary: string;
  whyNow: string;
  campaignNeed: string;
  domain: CampaignDomainId;
  urgency: "P0" | "P1" | "P2";
  confidence: "high" | "medium" | "low";
  expectedOutput: string;
  expectedCampaignStateImprovement: string;
  expectedKnowledgeGraphImprovement: string;
  requiredHumanApproval: boolean;
  blockedBy: string[];
  suggestedInputs: Record<string, string>;
  doneWhen: string;
  safety: AgentToolSafetyLevel;
  sourceEvidence: string[];
};

export type AgentToolSequenceStep = {
  order: number;
  toolId: string;
  title: string;
  purpose: string;
  safety: AgentToolSafetyLevel;
  humanGate: boolean;
};

export type AgentToolSequence = {
  id: string;
  title: string;
  summary: string;
  trigger: string;
  steps: AgentToolSequenceStep[];
  ownerRole: string;
  domains: CampaignDomainId[];
  expectedOutcome: string;
  humanGateRequired: boolean;
  safetyNotes: string[];
  blockedBy: string[];
  doneWhen: string;
};

export type PreparedAgentAction = {
  id: string;
  title: string;
  description: string;
  actionType: string;
  domain: CampaignDomainId;
  preparedByToolId: string;
  suggestedPayload: Record<string, string | number | boolean | null>;
  humanApprovalRequired: true;
  approvalPrompt: string;
  restrictedExecution: true;
  canExecuteNow: false;
  safetyNotes: string[];
  dataSources: string[];
  teachesCampaignIfCompleted: string;
  createdAt: string;
};

export type AgentToolDomainCoverage = {
  domain: CampaignDomainId;
  domainLabel: string;
  coverageStatus: "strong" | "adequate" | "weak" | "missing";
  readyToolCount: number;
  plannedToolCount: number;
  blockedToolCount: number;
  recommendedNextTool: string;
  whyItMatters: string;
};

export type AgentToolingSafetySummary = {
  autoExecutionDisabled: true;
  prohibitedActionTypes: string[];
  safeReadCount: number;
  approvalRequiredCount: number;
  prohibitedCount: number;
  humanGateRequired: true;
};

export type AgentToolingState = {
  registryToolCount: number;
  topRecommendedTools: AgentToolRecommendation[];
  recommendedSequences: AgentToolSequence[];
  preparedActions: PreparedAgentAction[];
  coverageByDomain: AgentToolDomainCoverage[];
  blockedTools: AgentToolCapability[];
  missingTools: AgentToolRecommendation[];
  safetySummary: AgentToolingSafetySummary;
  bestNextToolForCampaignState: AgentToolRecommendation | null;
  toolingSummary: string;
};

export function emptyAgentToolingState(): AgentToolingState {
  return {
    registryToolCount: 0,
    topRecommendedTools: [],
    recommendedSequences: [],
    preparedActions: [],
    coverageByDomain: [],
    blockedTools: [],
    missingTools: [],
    safetySummary: {
      autoExecutionDisabled: true,
      prohibitedActionTypes: [],
      safeReadCount: 0,
      approvalRequiredCount: 0,
      prohibitedCount: 0,
      humanGateRequired: true,
    },
    bestNextToolForCampaignState: null,
    toolingSummary: "Agent tooling brain not loaded.",
  };
}
