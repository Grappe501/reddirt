import type { AgentDomain } from "../orchestration/cross-domain-context-composer";
import type { MemoryWritePlan } from "../memory/agent-memory-write-planner";
import type { MasterToolRegistryEntry } from "../master-tool-registry/types";
import type { CampaignUserRole } from "../user-intelligence/user-personas";

export type AgentRiskLevel = "low" | "medium" | "high" | "blocked";

export type ClassifiedIntent = {
  domain: AgentDomain;
  task: string;
  urgency: "now" | "today" | "this_week" | "when_ready";
  riskLevel: AgentRiskLevel;
  likelyRoute: string;
  neededData: string[];
  humanApprovalRequired: boolean;
  suggestedToolIds: string[];
  rawMessage: string;
};

export type ToolRouteResult = {
  recommended: MasterToolRegistryEntry[];
  blocked: { tool: MasterToolRegistryEntry; reason: string }[];
  explanation: string;
  requiredHumanApprovals: string[];
  actionLinks: { label: string; href: string }[];
};

export type AgentPlanStep = {
  id: string;
  title: string;
  kind: "read" | "review" | "fix" | "draft" | "route" | "blocked";
  href?: string;
  toolId?: string;
};

export type AgentRuntimeRequest = {
  message: string;
  pathname: string;
  role: CampaignUserRole;
  period: string;
  eventRecordId?: string | null;
  actor?: string;
};

export type AgentRuntimeResponse = {
  interpretedIntent: ClassifiedIntent;
  activeDomain: AgentDomain;
  contextSummary: string;
  blockers: string[];
  selectedTools: MasterToolRegistryEntry[];
  blockedTools: { tool: MasterToolRegistryEntry; reason: string }[];
  proposedPlan: AgentPlanStep[];
  safeActions: AgentPlanStep[];
  blockedActions: { action: string; reason: string }[];
  nextLinks: { label: string; href: string }[];
  responseCopy: string;
  calmSummary: string;
  observationEvents: string[];
  memoryCandidates: MemoryWritePlan[];
  auditId: string;
  humanControlNote: string;
};
