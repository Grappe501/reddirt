/** NSI-1 narrative state types — read-only composition over governed layers. */

export type KimHammerNarrativeClass =
  | "LEGISLATIVE_PACKAGE"
  | "COUNTY_BURDEN"
  | "CHRONOLOGY"
  | "DEBATE_FRAME"
  | "BILL_NARRATIVE";

export type KimHammerNarrativeReadinessBand = "STRONG" | "MODERATE" | "WEAK" | "BLOCKED";

export type KimHammerNarrativeRegistryEntry = {
  narrativeId: string;
  title: string;
  narrativeClass: KimHammerNarrativeClass;
  description: string;
  linkedClaimIds: string[];
  linkedTaskIds: string[];
  adminHref?: string;
};

export type KimHammerNarrativeRegistryFile = {
  generatedAt: string;
  registryVersion: string;
  purpose: string;
  narratives: KimHammerNarrativeRegistryEntry[];
};

export type KimHammerNarrativeStateRecord = {
  narrativeId: string;
  title: string;
  narrativeClass: KimHammerNarrativeClass;
  description: string;
  readinessScore: number;
  readinessBand: KimHammerNarrativeReadinessBand;
  signal: string;
  blockers: string[];
  linkedClaimIds: string[];
  linkedCitationIds: string[];
  linkedTaskIds: string[];
  linkedSuggestionIds: string[];
  exportUsageCount: number;
  lastExportAt: string | null;
  lastExportScope: string | null;
  citationHealthSummary: {
    total: number;
    healthy: number;
    needsAttention: number;
    stale: number;
  };
  claimReviewSummary: {
    total: number;
    exportReady: number;
    needsReview: number;
    blocked: number;
    partialCitation: number;
  };
  taskSummary: {
    total: number;
    complete: number;
    inProgress: number;
    blocked: number;
    notStarted: number;
  };
  pendingSuggestionCount: number;
  adminHref?: string;
  computedAt: string;
};

export type KimHammerNarrativeStateIndex = {
  generatedAt: string;
  narrativeCount: number;
  bandCounts: Record<KimHammerNarrativeReadinessBand, number>;
  narratives: KimHammerNarrativeStateRecord[];
};
