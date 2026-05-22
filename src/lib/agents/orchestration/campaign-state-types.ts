/**
 * Master CampaignState model — Campaign Orchestration Intelligence Layer.
 */

import type { CampaignKnowledgeMemorySlice } from "@/lib/agents/campaign-knowledge/campaign-knowledge-memory-types";
import { emptyKnowledgeMemorySlice } from "@/lib/agents/campaign-knowledge/campaign-knowledge-memory-types";
import type { CampaignKnowledgeSummary } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-types";
import { emptyCampaignKnowledgeSummary } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-types";

export type CampaignHealthBand = "critical" | "weak" | "stable" | "strong";

export type CampaignOperatingMode = "live" | "degraded" | "skeleton";

export type CampaignDomainId =
  | "campaign_management"
  | "candidate"
  | "calendar"
  | "event_planning"
  | "approvals"
  | "travel"
  | "reimbursement"
  | "finance"
  | "compliance"
  | "county"
  | "field"
  | "volunteer"
  | "communications"
  | "social_media"
  | "host"
  | "hot_wash"
  | "training"
  | "dashboard_ux"
  | "memory"
  | "tool_builder";

export type DomainHealthSlice = {
  domainId: CampaignDomainId;
  band: CampaignHealthBand;
  score: number;
  summary: string;
  blockers: string[];
  opportunities: string[];
};

export type OrchestrationActionRef = {
  id: string;
  title: string;
  domainId: CampaignDomainId;
  route?: string;
  toolId?: string;
  humanGate: "none" | "review" | "forbidden";
  priority: "P0" | "P1" | "P2";
};

export type CampaignBlocker = {
  id: string;
  domainId: CampaignDomainId;
  severity: "P0" | "P1" | "P2";
  message: string;
  suggestedRoute?: string;
  missingSignal?: string;
};

export type CampaignOpportunity = {
  id: string;
  domainId: CampaignDomainId;
  message: string;
  impact: "high" | "medium" | "low";
};

export type HumanGateRef = {
  actionType: string;
  risk: "safe" | "gated" | "forbidden";
  route?: string;
};

export type PreparedOrchestrationAction = {
  id: string;
  title: string;
  why: string;
  routes: string[];
  checklist: string[];
  humanGate: "review" | "forbidden";
};

export type MemoryCandidateRef = {
  id: string;
  type: string;
  summary: string;
  requiresApproval: boolean;
};

/** Unified campaign brain snapshot for orchestration reasoning. */
export type CampaignState = {
  generatedAt: string;
  currentPeriod: string;
  isLive: boolean;
  operatingMode: CampaignOperatingMode;
  executiveSummary: string;
  confidenceLevel: "high" | "medium" | "low";
  overallHealth: CampaignHealthBand;
  operationalReadiness: number;
  candidateReadiness: number;
  campaignManagerReadiness: number;
  domainStatuses: Record<CampaignDomainId, DomainHealthSlice>;
  countyHealth: DomainHealthSlice;
  volunteerHealth: DomainHealthSlice;
  communicationsHealth: DomainHealthSlice;
  financeHealth: DomainHealthSlice;
  eventReadiness: DomainHealthSlice;
  reimbursementReadiness: DomainHealthSlice;
  complianceReadiness: DomainHealthSlice;
  trainingHealth: DomainHealthSlice;
  dashboardHealth: DomainHealthSlice;
  countyIntelligenceSummary: {
    bridgeAvailable: boolean;
    weakCountyCount: number;
    topAttentionCount: number;
    heatListTop: string[];
  };
  commsReadiness: {
    massEmailBlocked: boolean;
    bottleneckCount: number;
    volunteerAtRisk: number;
  };
  emailEccReadiness: {
    sendEnabled: boolean;
    sendGridConfigured: boolean;
    massSendBlocked: boolean;
  };
  calendarEventPressure: {
    pendingApprovals: number;
    syncStale: boolean;
    promotionReady: number;
  };
  financeComplianceWarnings: string[];
  memoryObservationSummary: {
    recentObservationCount: number;
    frictionSignals: number;
    pendingToolTickets: number;
  };
  toolCoverage: {
    readySources: number;
    degradedSources: number;
  };
  systemRisk: "low" | "medium" | "high";
  activeBlockers: CampaignBlocker[];
  activeOpportunities: CampaignOpportunity[];
  weakDomains: CampaignDomainId[];
  strongDomains: CampaignDomainId[];
  urgentActions: OrchestrationActionRef[];
  roleActions: Record<string, OrchestrationActionRef[]>;
  countyActions: OrchestrationActionRef[];
  volunteerActions: OrchestrationActionRef[];
  communicationActions: OrchestrationActionRef[];
  eventActions: OrchestrationActionRef[];
  financeActions: OrchestrationActionRef[];
  trainingActions: OrchestrationActionRef[];
  toolBuildActions: OrchestrationActionRef[];
  humanGates: HumanGateRef[];
  preparedActions: PreparedOrchestrationAction[];
  memoryCandidates: MemoryCandidateRef[];
  observationSummary: string;
  signalLoadErrors: string[];
  /** Phase 3A — living campaign memory summary. */
  knowledge: CampaignKnowledgeSummary;
  /** @deprecated Use knowledge — kept for backward-compatible UI/helpers. */
  knowledgeMemory: CampaignKnowledgeMemorySlice;
};

export function emptyDomainSlice(domainId: CampaignDomainId, summary = "Signal not loaded"): DomainHealthSlice {
  return { domainId, band: "weak", score: 0, summary, blockers: [], opportunities: [] };
}

const EMPTY_DOMAIN_STATUSES = (): Record<CampaignDomainId, DomainHealthSlice> => ({
  campaign_management: emptyDomainSlice("campaign_management"),
  candidate: emptyDomainSlice("candidate"),
  calendar: emptyDomainSlice("calendar"),
  event_planning: emptyDomainSlice("event_planning"),
  approvals: emptyDomainSlice("approvals"),
  travel: emptyDomainSlice("travel"),
  reimbursement: emptyDomainSlice("reimbursement"),
  finance: emptyDomainSlice("finance"),
  compliance: emptyDomainSlice("compliance"),
  county: emptyDomainSlice("county"),
  field: emptyDomainSlice("field"),
  volunteer: emptyDomainSlice("volunteer"),
  communications: emptyDomainSlice("communications"),
  social_media: emptyDomainSlice("social_media"),
  host: emptyDomainSlice("host"),
  hot_wash: emptyDomainSlice("hot_wash"),
  training: emptyDomainSlice("training"),
  dashboard_ux: emptyDomainSlice("dashboard_ux"),
  memory: emptyDomainSlice("memory"),
  tool_builder: emptyDomainSlice("tool_builder"),
});

/** Deterministic skeleton for tests when signals unavailable. */
export function buildSkeletonCampaignState(period = "2026-04"): CampaignState {
  const now = new Date().toISOString();
  const county = emptyDomainSlice("county", "County signals pending full loader");
  const volunteer = emptyDomainSlice("volunteer", "Volunteer bundle pending");
  const comms = emptyDomainSlice("communications", "Communications bundle pending");
  return {
    generatedAt: now,
    currentPeriod: period,
    isLive: false,
    operatingMode: "skeleton",
    executiveSummary: "Skeleton state — orchestration signals not loaded",
    confidenceLevel: "low",
    overallHealth: "stable",
    operationalReadiness: 72,
    candidateReadiness: 68,
    campaignManagerReadiness: 75,
    domainStatuses: EMPTY_DOMAIN_STATUSES(),
    countyHealth: county,
    volunteerHealth: volunteer,
    communicationsHealth: comms,
    financeHealth: emptyDomainSlice("finance"),
    eventReadiness: emptyDomainSlice("event_planning"),
    reimbursementReadiness: emptyDomainSlice("reimbursement"),
    complianceReadiness: emptyDomainSlice("compliance"),
    trainingHealth: emptyDomainSlice("training"),
    dashboardHealth: emptyDomainSlice("dashboard_ux"),
    countyIntelligenceSummary: { bridgeAvailable: false, weakCountyCount: 0, topAttentionCount: 0, heatListTop: [] },
    commsReadiness: { massEmailBlocked: true, bottleneckCount: 0, volunteerAtRisk: 0 },
    emailEccReadiness: { sendEnabled: false, sendGridConfigured: false, massSendBlocked: true },
    calendarEventPressure: { pendingApprovals: 0, syncStale: false, promotionReady: 0 },
    financeComplianceWarnings: [],
    memoryObservationSummary: { recentObservationCount: 0, frictionSignals: 0, pendingToolTickets: 0 },
    toolCoverage: { readySources: 0, degradedSources: 0 },
    systemRisk: "medium",
    activeBlockers: [
      {
        id: "orch-skeleton-blocker",
        domainId: "campaign_management",
        severity: "P2",
        message: "Orchestration signal loader not fully wired — using skeleton state",
        missingSignal: "loadCampaignOrchestrationSignals",
      },
    ],
    activeOpportunities: [],
    weakDomains: ["volunteer", "county"],
    strongDomains: ["campaign_management"],
    urgentActions: [],
    roleActions: {},
    countyActions: [],
    volunteerActions: [],
    communicationActions: [],
    eventActions: [],
    financeActions: [],
    trainingActions: [],
    toolBuildActions: [],
    humanGates: [],
    preparedActions: [],
    memoryCandidates: [],
    observationSummary: "Skeleton state — run Phase 2 signal loader for live diagnosis.",
    signalLoadErrors: [],
    knowledge: emptyCampaignKnowledgeSummary(),
    knowledgeMemory: emptyKnowledgeMemorySlice(),
  };
}
