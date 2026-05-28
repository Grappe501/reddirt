export type NarrativeEvolutionSignal =
  | "WEAKENING"
  | "STABLE"
  | "STRENGTHENING"
  | "FATIGUED"
  | "OVERUSED"
  | "UNDERDEVELOPED"
  | "COUNTY_SHIFTING"
  | "DOCTRINE_CONFLICT";

export type CitationAgingSignal =
  | "CITATION_STALE"
  | "ARCHIVE_AT_RISK"
  | "OVERUSED_CITATION"
  | "WEAK_SUPPORT_CHAIN"
  | "COUNTY_OVEREXPOSED";

export type MemorySignal = {
  signal: string;
  entityId: string;
  entityLabel: string;
  reason: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
};

export type NarrativeEvolutionResult = {
  narrativeId: string;
  title: string;
  primarySignal: NarrativeEvolutionSignal;
  signals: NarrativeEvolutionSignal[];
  reasons: string[];
};

export type LongitudinalIntelligenceSummary = {
  generatedAt: string;
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  strengtheningNarratives: MemorySignal[];
  weakeningNarratives: MemorySignal[];
  overusedArguments: MemorySignal[];
  staleCitations: MemorySignal[];
  countyDriftWarnings: MemorySignal[];
  doctrineDriftWarnings: MemorySignal[];
  recurringDebateTraps: MemorySignal[];
  opponentMessageEscalation: MemorySignal[];
  mediaCycleChanges: MemorySignal[];
  exportFatigueWarnings: MemorySignal[];
  narrativeEvolution: NarrativeEvolutionResult[];
  topTrendSummaries: string[];
};

export const MEMORY_GOVERNANCE_LABEL = "INTERNAL · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED";
