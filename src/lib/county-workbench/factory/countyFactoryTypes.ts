/** County Workbench Factory — global types. All outputs INTERNAL_DRAFT / NON_PUBLISHABLE. */

export const COUNTY_FACTORY_GOVERNANCE = {
  publicationSafety: "NON_PUBLISHABLE" as const,
  humanReviewRequired: true as const,
  internalOnly: true as const,
  labels: [
    "INTERNAL_DRAFT",
    "NON_PUBLISHABLE",
    "HUMAN_REVIEW_REQUIRED",
    "NOT_PUBLIC_CONTENT",
    "SOURCE_PROVENANCE_REQUIRED",
    "NO_GOAL_MUTATION",
  ],
};

export type CountyVerificationStatus =
  | "VERIFIED"
  | "IMPORTED_UNVERIFIED"
  | "ESTIMATED"
  | "NEEDS_REVIEW"
  | "MISSING"
  | "RETIRED";

export type CountyPublicUseRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CountyReviewStatus = "DRAFT" | "NEEDS_REVIEW" | "HUMAN_VERIFIED" | "REJECTED";

export type CountyFactValueType = "string" | "number" | "boolean" | "json" | "date";

export type CountyFact = {
  id: string;
  countySlug: string;
  factType: string;
  factKey: string;
  value: string | number | boolean | Record<string, unknown>;
  valueType: CountyFactValueType;
  sourceId: string;
  sourceName: string;
  sourceUrlOrPath: string;
  sourceDate: string | null;
  retrievedAt: string;
  confidence: number;
  verificationStatus: CountyVerificationStatus;
  publicUseRisk: CountyPublicUseRisk;
  reviewStatus: CountyReviewStatus;
  notes: string;
};

export type CountySource = {
  id: string;
  name: string;
  dataTypes: string[];
  urlOrPath: string;
  refreshCadence: "daily" | "weekly" | "monthly" | "annual" | "manual" | "one_time";
  apiConfigured: boolean;
  notes: string;
};

export type CountyDataTableRow = Record<string, string | number | boolean | null>;

export type CountyDataTable = {
  tableType: string;
  generatedAt: string;
  countyCount: number;
  rowCount: number;
  columns: string[];
  rows: CountyDataTableRow[];
  completenessScore: number;
  governance: typeof COUNTY_FACTORY_GOVERNANCE;
};

export type CountyProfileCompiled = {
  countySlug: string;
  countyName: string;
  fips: string;
  regionId: string;
  regionLabel: string;
  identity: Record<string, string | number | boolean>;
  demographicSnapshot: CountyFact[];
  voterSnapshot: CountyFact[];
  turnoutSnapshot: CountyFact[];
  economicSnapshot: CountyFact[];
  educationSnapshot: CountyFact[];
  healthcareSnapshot: CountyFact[];
  localValidators: CountyFact[];
  civicInfrastructure: CountyFact[];
  mediaLandscape: CountyFact[];
  eventOpportunities: CountyFact[];
  messageOpportunities: CountyFact[];
  knownGaps: string[];
  riskWarnings: string[];
  recommendedNextResearch: string[];
  readinessScore: number;
  profileStatus: "SHELL" | "PARTIAL" | "COMPILED";
  governance: typeof COUNTY_FACTORY_GOVERNANCE;
  generatedAt: string;
};

export type CountyBriefCompiled = {
  countySlug: string;
  countyName: string;
  briefId: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  countySnapshot: string[];
  whatWeKnow: string[];
  whatWeDoNotKnow: string[];
  strongestFacts: string[];
  weakFacts: string[];
  sourceGaps: string[];
  localMessageAngles: string[];
  debateRelevance: string[];
  travelEventRelevance: string[];
  voterRegistrationRelevance: string[];
  coalitionRelevance: string[];
  fieldPlanNextSteps: string[];
  researchTasks: string[];
  claimCitationRequirements: string[];
  readinessScore: number;
  generatedAt: string;
  governance: typeof COUNTY_FACTORY_GOVERNANCE;
};

export type CountyDataGap = {
  countySlug: string;
  factType: string;
  gapDescription: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendedSourceId: string | null;
};

export type CountyIngestionJob = {
  jobId: string;
  adapterName: string;
  countySlug: string | "ALL";
  status: "PENDING" | "RUNNING" | "DEFERRED" | "COMPLETE" | "FAILED";
  reason: string;
  createdAt: string;
};

export type CountyIngestionResult = {
  jobId: string;
  adapterName: string;
  countySlug: string | "ALL";
  status: "COMPLETE" | "DEFERRED" | "FAILED" | "DRY_RUN";
  factsAdded: number;
  factsUpdated: number;
  deferredReason: string | null;
  warnings: string[];
  completedAt: string;
};

export type CountyReadinessScore = {
  countySlug: string;
  countyName: string;
  score: number;
  basis: string;
  factCount: number;
  verifiedCount: number;
  missingCount: number;
  profileStatus: CountyProfileCompiled["profileStatus"];
  briefStatus: "GENERATED" | "MISSING";
};

export type CountyCrossReference = {
  countySlug: string;
  relatedCountySlugs: string[];
  sharedFactTypes: string[];
  outlierFlags: string[];
};

export type CountyFactoryRun = {
  runId: string;
  startedAt: string;
  completedAt: string | null;
  phases: string[];
  countiesProcessed: number;
  factsTotal: number;
  profilesGenerated: number;
  briefsGenerated: number;
  warnings: string[];
};

export type CountyFactoryAuditEvent = {
  eventId: string;
  eventType: string;
  countySlug: string | null;
  detail: string;
  createdAt: string;
};

export type CountyFactsFile = {
  version: 1;
  generatedAt: string;
  facts: CountyFact[];
};

export type CountySourcesFile = {
  version: 1;
  generatedAt: string;
  sources: CountySource[];
};
