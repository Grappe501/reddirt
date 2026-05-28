export type DoctrineConfidence = "LOW" | "MEDIUM" | "HIGH";
export type DoctrineReviewStatus = "PRESENT" | "MISSING" | "NEEDS_REVIEW";
export type SourceType = "STEVE_DOCTRINE" | "SOURCED_HISTORY" | "INTERPRETATION" | "PROPOSED_MODEL";

export type DoctrinePillar = {
  id: string;
  title: string;
  principle: string;
  sourceType: SourceType | string;
  confidence: DoctrineConfidence;
  reviewStatus: DoctrineReviewStatus | string;
};

export type SteveStrategyDoctrineFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  doctrineOwner: string;
  status: DoctrineReviewStatus | string;
  pillars: DoctrinePillar[];
  operatingMaxims: string[];
  guardrails: {
    allow: string[];
    block: string[];
  };
  sources: Array<{
    id: string;
    type: string;
    label: string;
    url?: string;
    confidence: DoctrineConfidence;
  }>;
};

export type ArkansasGrassrootsPrinciplesFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  principles: Array<{
    id: string;
    principle: string;
    category: string;
    sourceType: string;
    confidence: DoctrineConfidence;
    reviewStatus: DoctrineReviewStatus | string;
  }>;
  needsReview: string[];
};

export type RockefellerCaseStudyFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  caseStudy: {
    subject: string;
    campaignYears: Array<{
      year: number;
      organizingModel: string;
      volunteerInfrastructure: string;
      coalitionLessons: string;
      ruralCountyLessons: string;
      publicReformMessage: string;
      unityReformThemes: string[];
      historicalContext: string;
      directlySourced: string[];
      interpretation: string[];
      needsMoreResearch: string[];
      sourceCitations: string[];
      sourceConfidence: DoctrineConfidence;
    }>;
  };
  caseStudyGuardrails: {
    allowedUse: string[];
    disallowedUse: string[];
  };
};

export type RelationalOrganizingPlaybookFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  playbook: {
    name: string;
    status: DoctrineReviewStatus | string;
    principles: string[];
    operationalPatterns: Array<{
      id: string;
      pattern: string;
      inputs: string[];
      outputs: string[];
      status: DoctrineReviewStatus | string;
    }>;
    guardrails: string[];
  };
};

export type GotvBackwardCalendarModelFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  status: DoctrineReviewStatus | string;
  anchorDatePolicy: string;
  timeline: Array<{
    window: string;
    focus: string[];
    complianceReviewRequired: boolean;
  }>;
  guardrails: {
    legal: string;
    targeting: string;
  };
};

export type PollWatcherCoverageModelFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  status: DoctrineReviewStatus | string;
  requiredFields: string[];
  countyCoverageTemplate: Record<string, string | number | string[]>;
  guardrails: {
    legal: string;
    automation: string;
    privacy: string;
  };
};

export type EventVisibilityPlaybookFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  status: DoctrineReviewStatus | string;
  eventTypes: string[];
  visibilityFramework: Array<{
    id: string;
    rule: string;
    sourceType: string;
  }>;
  timingDependencies: string[];
  guardrails: {
    messaging: string;
    targeting: string;
    automation: string;
  };
};

export type CountyStrategySourceIndexFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  sources: Array<{
    id: string;
    type: string;
    path?: string;
    url?: string;
    summary: string;
    confidence: DoctrineConfidence;
    status?: string;
  }>;
  gaps: string[];
};

export type StrategyDoctrineReadinessTableFile = {
  version: number;
  phase: string;
  mode: string;
  generatedAt: string;
  rows: Array<{
    artifact: string;
    status: DoctrineReviewStatus | string;
    reviewStatus: DoctrineReviewStatus | string;
    notes: string;
  }>;
  summary: {
    presentCount: number;
    missingCount: number;
    needsReviewCount: number;
  };
};

