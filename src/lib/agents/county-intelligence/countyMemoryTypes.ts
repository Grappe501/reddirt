export type MemoryFieldStatus = "PRESENT" | "MISSING" | "NEEDS_REVIEW";

export type CountyMemoryIndexRow = {
  countySlug: string;
  countyName: string;
  fips: string;
  regionId: string;
  memoryStatus: MemoryFieldStatus;
  eventOutcomeStatus: MemoryFieldStatus;
  relationshipStatus: MemoryFieldStatus;
  recurringIssueStatus: MemoryFieldStatus;
  confidenceScore: number;
  updatedAt: string | null;
  knownEvents: number;
  recurringIssues: string[];
  organizations: string[];
  notes: string[];
};

export type CountyMemoryIndexFile = {
  version: number;
  generatedAt: string;
  countyCount: number;
  rows: CountyMemoryIndexRow[];
};

export type CountyEventOutcomeRow = {
  countySlug: string;
  eventId: string;
  eventTitle: string;
  outcomeSummary: string;
  outcomeType: string;
  eventDate: string | null;
  status: MemoryFieldStatus;
  source: string;
};

export type CountyEventOutcomesFile = {
  version: number;
  generatedAt: string;
  rows: CountyEventOutcomeRow[];
};

export type CountyRelationshipEdge = {
  sourceCountySlug: string;
  targetCountySlug: string;
  relationshipType: string;
  signalStrength: number;
  confidence: MemoryFieldStatus;
  sharedIssues: string[];
  notes: string;
};

export type CountyRelationshipGraphFile = {
  version: number;
  generatedAt: string;
  edges: CountyRelationshipEdge[];
};

export type RegionalInfluenceRow = {
  regionId: string;
  regionLabel: string;
  counties: string[];
  dominantIssueSignals: string[];
  relationshipSignalStrength: number;
  status: MemoryFieldStatus;
};

export type RegionalInfluenceMapFile = {
  version: number;
  generatedAt: string;
  rows: RegionalInfluenceRow[];
};

export type CountyMemoryReadinessRow = {
  countySlug: string;
  countyName: string;
  fips: string;
  memoryTimeline: MemoryFieldStatus;
  eventOutcomes: MemoryFieldStatus;
  relationshipGraph: MemoryFieldStatus;
  recurringIssues: MemoryFieldStatus;
  politicalCultureProfile: MemoryFieldStatus;
  crossCountyConnections: MemoryFieldStatus;
  confidenceScore: number;
  nextSafeDataActions: string[];
};

export type CountyMemoryReadinessTable = {
  version: number;
  generatedAt: string;
  countyCount: number;
  rows: CountyMemoryReadinessRow[];
};

export type CountyInstitutionalMemoryBrief = {
  countySlug: string;
  countyName: string;
  confidenceScore: number;
  memoryTimeline: string[];
  eventOutcomes: string[];
  recurringIssues: string[];
  localInfluenceNotes: string[];
  regionalRelationships: string[];
  crossCountyConnections: string[];
  memoryGaps: string[];
  nextSafeDataActions: string[];
  status: MemoryFieldStatus;
  sourceArtifacts: string[];
};

export type StatewideCountyMemorySummary = {
  generatedAt: string;
  countyCount: number;
  memoryReadyCount: number;
  memoryMissingCount: number;
  countiesWithMissingMemory: string[];
  recurringIssueClusters: Array<{
    issue: string;
    countySlugs: string[];
  }>;
  regionalRelationshipSignals: Array<{
    regionId: string;
    relationshipSignalStrength: number;
    dominantIssueSignals: string[];
  }>;
};

