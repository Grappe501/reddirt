/** NSI-2 geographic narrative intelligence types — read-only county overlays. */

export type KimHammerGeographicReadinessSignal =
  | "COUNTY_STRONG"
  | "COUNTY_MODERATE"
  | "COUNTY_WEAK"
  | "COUNTY_BLOCKED"
  | "COUNTY_OVEREXPOSED"
  | "COUNTY_UNDERDEVELOPED";

export type KimHammerGeographicSensitivity = "LOW" | "MEDIUM" | "HIGH";

export type KimHammerGeographicOverlayEntry = {
  countyId: string;
  countyName: string;
  narrativeIds: string[];
  localSensitivity: KimHammerGeographicSensitivity;
  localOperationalImpact: string;
  countyBurdenSignals: string[];
  exportUsageCount: number;
  unresolvedDependencies: string[];
  narrativeStrengthModifier: number;
  localMediaRisk: KimHammerGeographicSensitivity;
  localDebateRelevance: KimHammerGeographicSensitivity;
  recommendedResearchNeeds: string[];
  strategicNotes: string;
  reviewStatus: "APPROVED_FOR_INTERNAL_USE" | "NEEDS_REVIEW" | "DRAFT";
};

export type KimHammerGeographicNarrativeOverlaysFile = {
  generatedAt: string;
  overlayVersion: string;
  purpose: string;
  overlays: KimHammerGeographicOverlayEntry[];
};

export type KimHammerNarrativeCountyState = {
  countyId: string;
  countyName: string;
  narrativeId: string;
  narrativeTitle: string;
  geographicSignal: KimHammerGeographicReadinessSignal;
  geographicScore: number;
  signal: string;
  blockers: string[];
  baseReadinessBand: string;
  baseReadinessScore: number;
  narrativeStrengthModifier: number;
  exportUsageCount: number;
  unresolvedDependencyCount: number;
  localMediaRisk: KimHammerGeographicSensitivity;
  localDebateRelevance: KimHammerGeographicSensitivity;
};

export type KimHammerGeographicCountyState = {
  countyId: string;
  countyName: string;
  localSensitivity: KimHammerGeographicSensitivity;
  localOperationalImpact: string;
  countyBurdenSignals: string[];
  strategicNotes: string;
  dominantSignal: KimHammerGeographicReadinessSignal;
  averageScore: number;
  narrativeStates: KimHammerNarrativeCountyState[];
  exportUsageCount: number;
  blockedNarrativeCount: number;
  overexposedNarrativeCount: number;
  underdevelopedNarrativeCount: number;
  topRiskSignal: string;
  computedAt: string;
};

export type KimHammerGeographicNarrativeIndex = {
  generatedAt: string;
  countyCount: number;
  narrativeCellCount: number;
  signalCounts: Record<KimHammerGeographicReadinessSignal, number>;
  counties: KimHammerGeographicCountyState[];
  topGeographicRisks: Array<{ countyId: string; countyName: string; signal: string }>;
};

export const KIM_HAMMER_GEOGRAPHIC_READINESS_SIGNALS: KimHammerGeographicReadinessSignal[] = [
  "COUNTY_STRONG",
  "COUNTY_MODERATE",
  "COUNTY_WEAK",
  "COUNTY_BLOCKED",
  "COUNTY_OVEREXPOSED",
  "COUNTY_UNDERDEVELOPED",
];
