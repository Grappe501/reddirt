/**
 * Master CampaignState model — Campaign Orchestration Intelligence Layer.
 * V1: types + skeleton builder only; loaders populate in Phase 2.
 */

export type CampaignHealthBand = "critical" | "weak" | "stable" | "strong";

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
  overallHealth: CampaignHealthBand;
  operationalReadiness: number;
  candidateReadiness: number;
  campaignManagerReadiness: number;
  countyHealth: DomainHealthSlice;
  volunteerHealth: DomainHealthSlice;
  communicationsHealth: DomainHealthSlice;
  financeHealth: DomainHealthSlice;
  eventReadiness: DomainHealthSlice;
  reimbursementReadiness: DomainHealthSlice;
  complianceReadiness: DomainHealthSlice;
  trainingHealth: DomainHealthSlice;
  dashboardHealth: DomainHealthSlice;
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
};

export function emptyDomainSlice(domainId: CampaignDomainId, summary = "Signal not loaded"): DomainHealthSlice {
  return { domainId, band: "weak", score: 0, summary, blockers: [], opportunities: [] };
}

/** Deterministic skeleton for tests and Phase 1 UI mocks. */
export function buildSkeletonCampaignState(period = "2026-04"): CampaignState {
  const now = new Date().toISOString();
  const county = emptyDomainSlice("county", "County signals pending full loader");
  const volunteer = emptyDomainSlice("volunteer", "Volunteer bundle pending");
  const comms = emptyDomainSlice("communications", "Communications bundle pending");
  return {
    generatedAt: now,
    currentPeriod: period,
    overallHealth: "stable",
    operationalReadiness: 72,
    candidateReadiness: 68,
    campaignManagerReadiness: 75,
    countyHealth: county,
    volunteerHealth: volunteer,
    communicationsHealth: comms,
    financeHealth: emptyDomainSlice("finance"),
    eventReadiness: emptyDomainSlice("event_planning"),
    reimbursementReadiness: emptyDomainSlice("reimbursement"),
    complianceReadiness: emptyDomainSlice("compliance"),
    trainingHealth: emptyDomainSlice("training"),
    dashboardHealth: emptyDomainSlice("dashboard_ux"),
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
  };
}
