/** NSI-9B border media market intelligence types. */

export type MediaMarketReadinessSignal =
  | "BORDER_MEDIA_STRONG"
  | "BORDER_MEDIA_WEAK"
  | "LOCAL_PAPER_CRITICAL"
  | "CROSS_STATE_TV_DOMINANT"
  | "STATEWIDE_PAPER_IMPORTANT"
  | "PUBLIC_RADIO_RELEVANT"
  | "MEDIA_COVERAGE_GAP"
  | "MANUAL_REVIEW_REQUIRED";

export type MediaMarketProfile = {
  marketId: string;
  marketName: string;
  homeState: string;
  statesCovered: string[];
  arkansasCountiesInfluenced: string[];
  dominantSourceTypes: string[];
  tvStations: string[];
  newspapers: string[];
  radioPublicRadio: string[];
  podcastsBlogs: string[];
  governmentSources: string[];
  campaignRelevance: string;
  monitoringPriority: "HIGH" | "MEDIUM" | "LOW";
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  notes: string;
};

export type MediaSourceInfluence = {
  sourceId: string;
  sourceName: string;
  homeMarket: string;
  state: string;
  influenceType: "primary" | "secondary" | "statewide";
  localInfluenceScore: number;
  borderMarketRelevance: string;
  ingestionMethod: string;
  approvedForFetch: boolean;
};

export type MediaCoverageGap = {
  countyId: string;
  countyName: string;
  gapType: string;
  signal: MediaMarketReadinessSignal;
  text: string;
};

export type CrossStateSourceRegistryEntry = {
  sourceId: string;
  name: string;
  sourceType: string;
  url: string;
  rssUrl: string | null;
  homeMarket: string;
  state: string;
  region: string;
  countiesCovered: string[];
  arkansasBorderCountiesInfluenced: string[];
  mediaMarket: string;
  topics: string[];
  ingestionMethod: string;
  approvedForFetch: boolean;
  reviewStatus: string;
  robotsPolicyStatus: string;
  sourceReliability: string;
  allowedUse: string;
  borderMarketRelevance: string;
  localInfluenceScore: number;
  monitoringPriority: string;
  lastVerifiedAt: string | null;
  verificationMethod: string;
};

export type BorderCountyMediaProfile = {
  countyId: string;
  countyName: string;
  region: string;
  isBorderCounty: boolean;
  primaryMediaMarket: string;
  secondaryMediaMarkets: string[];
  arkansasSources: MediaSourceInfluence[];
  crossStateSources: MediaSourceInfluence[];
  localPapers: string[];
  localRadio: string[];
  tvMarketInfluence: string[];
  statewidePaperImportant: boolean;
  littleRockCoverageSufficient: boolean;
  monitoringStrength: "STRONG" | "MODERATE" | "WEAK";
  coverageGaps: string[];
  monitoringPriority: "HIGH" | "MEDIUM" | "LOW";
  messagingImplications: string[];
  readinessSignals: Array<{ signal: MediaMarketReadinessSignal; text: string }>;
};

export type BorderMediaCoverageSummary = {
  generatedAt: string;
  marketCount: number;
  crossStateSourceCount: number;
  edgeCountyCount: number;
  fetchApprovedCrossState: number;
  manualReviewCrossState: number;
  highPriorityMarkets: string[];
  coverageGapCount: number;
};
