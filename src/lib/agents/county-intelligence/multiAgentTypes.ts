export type MultiAgentStatus = "PRESENT" | "MISSING" | "LOW_CONFIDENCE";

export type MultiAgentMode =
  | "READ_ONLY_CONTEXT_LAYER"
  | "READ_ONLY_OPERATIONAL_FORECASTING"
  | "READ_ONLY_PUBLIC_SIGNAL_ANALYSIS"
  | "READ_ONLY_MODELING_AND_FORECASTING"
  | "READ_ONLY_COORDINATED_SYNTHESIS";

export type CampaignBrainAgentRegistryFile = {
  version: number;
  generatedAt: string;
  agents: Array<{
    agentId: string;
    label: string;
    mode: MultiAgentMode;
    active: boolean;
    confidenceScore: number;
    sourceLayers: string[];
    limitations: string[];
  }>;
};

export type AgentCapabilityMapFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    agentId: string;
    can: string[];
    cannot: string[];
    safetyConstraints: string[];
  }>;
};

export type AgentRuntimeCoordinationMapFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    participatingAgents: string[];
    coordinationConfidence: number;
    synthesizedReadiness: number;
    blockedCapabilities: string[];
  }>;
};

export type AgentDependencyGraphFile = {
  version: number;
  generatedAt: string;
  nodes: Array<{ id: string; label: string }>;
  edges: Array<{ from: string; to: string; dependency: string; status: MultiAgentStatus }>;
};

export type AgentSafetyPolicyMapFile = {
  version: number;
  generatedAt: string;
  policies: Array<{
    policyId: string;
    description: string;
    blockedActions: string[];
    appliesToAgents: string[];
  }>;
};

export type AgentRuntimeStateTableFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    activeAgents: number;
    conflicts: number;
    executiveUrgency: number;
    coordinationConfidence: number;
    status: MultiAgentStatus;
  }>;
};

export type CrossAgentInsightStreamFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    insight: string;
    sourceAgents: string[];
    confidenceScore: number;
    label: "SIGNAL" | "TREND" | "MODEL";
  }>;
};

export type MultiAgentCoordinationReadinessFile = {
  version: number;
  generatedAt: string;
  countyCount: number;
  rows: Array<{
    countySlug: string;
    countyName: string;
    registryReady: MultiAgentStatus;
    capabilityMapReady: MultiAgentStatus;
    dependencyGraphReady: MultiAgentStatus;
    runtimeCoordinationReady: MultiAgentStatus;
    safetyPolicyReady: MultiAgentStatus;
    insightStreamReady: MultiAgentStatus;
    coordinationConfidence: number;
    conflictsSurfaced: boolean;
    missingCoverage: string[];
    requiredHumanApprovals: string[];
  }>;
};

export type ExecutiveCoordinationBrief = {
  countySlug: string;
  countyName: string;
  activeCopilots: string[];
  crossAgentInsights: string[];
  synthesizedCountyStatus: string;
  operationalConflicts: string[];
  readinessFusion: string;
  statewideDependencies: string[];
  executiveUrgency: number;
  coordinationConfidence: number;
  blockedCapabilities: string[];
  requiredHumanApprovals: string[];
};

