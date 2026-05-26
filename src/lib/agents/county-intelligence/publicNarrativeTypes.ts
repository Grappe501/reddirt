export type NarrativeStatus = "PRESENT" | "MISSING" | "LOW_CONFIDENCE";

export type NarrativeSignalKind = "SIGNAL" | "TREND";

export type PublicIssueSignalRegistryFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    sourceCategory: string;
    issueCategory: string;
    signalKind: NarrativeSignalKind;
    frequencyScore: number;
    confidence: NarrativeStatus;
    sourceLayers: string[];
  }>;
};

export type CountyIssueClustersFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    clusterId: string;
    topIssues: string[];
    volatility: number;
    confidence: NarrativeStatus;
    signalKind: NarrativeSignalKind;
  }>;
};

export type RegionalNarrativeMapFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    regionId: string;
    regionLabel: string;
    counties: string[];
    dominantNarratives: string[];
    trendDirection: "UP" | "FLAT" | "DOWN";
    signalKind: NarrativeSignalKind;
    confidence: NarrativeStatus;
  }>;
};

export type EarnedMediaOpportunitiesFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    opportunity: string;
    readinessScore: number;
    confidence: NarrativeStatus;
    signalKind: NarrativeSignalKind;
  }>;
};

export type CivicSentimentSummaryFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    civicSentiment: "POSITIVE" | "MIXED" | "NEGATIVE" | "MISSING";
    engagementScore: number;
    volatility: number;
    confidence: NarrativeStatus;
    signalKind: NarrativeSignalKind;
  }>;
};

export type PublicMeetingWatchlistFile = {
  version: number;
  generatedAt: string;
  rows: Array<{
    countySlug: string;
    countyName: string;
    watchItems: string[];
    pressureScore: number;
    confidence: NarrativeStatus;
    signalKind: NarrativeSignalKind;
  }>;
};

export type PublicNarrativeReadinessFile = {
  version: number;
  generatedAt: string;
  countyCount: number;
  rows: Array<{
    countySlug: string;
    countyName: string;
    issueSignals: NarrativeStatus;
    issueClusters: NarrativeStatus;
    regionalNarrative: NarrativeStatus;
    earnedMedia: NarrativeStatus;
    civicSentiment: NarrativeStatus;
    publicMeetingSignals: NarrativeStatus;
    messagingReadiness: NarrativeStatus;
    narrativeConfidenceScore: number;
    nextSafeDataActions: string[];
  }>;
};

export type PublicNarrativeBrief = {
  countySlug: string;
  countyName: string;
  topPublicIssues: string[];
  recurringIssueTimeline: string[];
  narrativeClusters: string[];
  regionalAlignment: string;
  earnedMediaOpportunities: string[];
  issueVolatility: number;
  civicSentimentSummary: string;
  publicMeetingWatchItems: string[];
  narrativeConfidenceScore: number;
  messagingReadinessStatus: NarrativeStatus;
  recommendedSafeOperatorActions: string[];
  signalKind: NarrativeSignalKind;
  sourceLayers: string[];
};

