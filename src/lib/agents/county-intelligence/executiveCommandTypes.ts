export type ExecutiveStatus = "PRESENT" | "MISSING" | "LOW_CONFIDENCE";

export type ExecutiveSignalLabel = "SIGNAL" | "TREND" | "FORECAST" | "MODEL";

export type ExecutiveCommandStateFile = {
  version: number;
  generatedAt: string;
  statewideSummary: {
    campaignHealth: number;
    readinessAverage: number;
    executiveUrgencyAverage: number;
    blockedAutomationCount: number;
  };
  counties: Array<{
    countySlug: string;
    countyName: string;
    readiness: number;
    urgency: number;
    confidence: number;
    status: ExecutiveStatus;
  }>;
};

export type StatewideReadinessMatrixFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    countyReadiness: number;
    operationsMomentum: number;
    voterMetricsReadiness: number;
    simulationConfidence: number;
    narrativeVolatility: number;
    organizationalFragility: number;
    status: ExecutiveStatus;
  }>;
};

export type ExecutivePriorityRankingFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    executivePriorityScore: number;
    urgencyBand: "HIGH" | "MEDIUM" | "LOW";
    sourceLayers: string[];
    status: ExecutiveStatus;
  }>;
};

export type OperationalBottleneckMapFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    bottlenecks: string[];
    pressureScore: number;
    label: ExecutiveSignalLabel;
    status: ExecutiveStatus;
  }>;
};

export type StatewideInterventionQueueFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    intervention: string;
    priority: number;
    requiredHumanApprovals: string[];
    status: ExecutiveStatus;
  }>;
};

export type RegionalPressureMapFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    regionId: string;
    regionLabel: string;
    pressureScore: number;
    counties: string[];
    label: ExecutiveSignalLabel;
    status: ExecutiveStatus;
  }>;
};

export type CampaignHealthScorecardFile = {
  version: number;
  generatedAt: string;
  metrics: Array<{
    metric: string;
    score: number;
    label: ExecutiveSignalLabel;
    status: ExecutiveStatus;
  }>;
};

export type ExecutiveAlertStreamFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    alert: string;
    severity: "INFO" | "WARN" | "CRITICAL";
    label: ExecutiveSignalLabel;
    sourceLayers: string[];
  }>;
};

export type ExecutiveBriefRegistryFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    executiveBrief: string;
    requiredHumanApprovals: string[];
    confidence: number;
    status: ExecutiveStatus;
  }>;
};

export type ExecutiveCommandReadinessFile = {
  version: number;
  generatedAt: string;
  countyCount: number;
  rows: Array<{
    countySlug: string;
    countyName: string;
    commandStateReady: ExecutiveStatus;
    readinessMatrixReady: ExecutiveStatus;
    priorityRankingReady: ExecutiveStatus;
    bottleneckMapReady: ExecutiveStatus;
    interventionQueueReady: ExecutiveStatus;
    regionalPressureReady: ExecutiveStatus;
    healthScorecardReady: ExecutiveStatus;
    alertStreamReady: ExecutiveStatus;
    briefRegistryReady: ExecutiveStatus;
    blockedAutomationStatePresent: boolean;
    coordinationConfidence: number;
    missingCoverage: string[];
  }>;
};

export type ExecutiveCommandBrief = {
  countySlug: string;
  countyName: string;
  readinessSummary: string;
  prioritySummary: string;
  bottleneckSummary: string[];
  interventionSummary: string[];
  regionalPressureSummary: string;
  campaignHealthSummary: string;
  alerts: string[];
  confidence: number;
  blockedAutomationMatrix: string[];
  requiredHumanApprovals: string[];
};

