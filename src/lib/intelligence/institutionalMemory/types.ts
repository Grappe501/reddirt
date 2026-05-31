/** NSI-17 · Institutional Memory Engine — governed campaign memory (not CRM). */

export const DECISION_LEDGER_REL = "data/intelligence/decision-ledger.json";
export const RECOMMENDATION_LEDGER_REL = "data/intelligence/recommendation-ledger.json";
export const LESSONS_LEARNED_REGISTRY_REL = "data/intelligence/lessons-learned-registry.json";
export const WEEKLY_REFLECTIONS_REL = "data/intelligence/weekly-intelligence-reflections.json";
export const INSTITUTIONAL_MEMORY_AUDIT_LOG_REL = "data/intelligence/institutional-memory-audit-log.json";

export const DECISION_CATEGORIES = [
  "Attend event",
  "Skip event",
  "Issue statement",
  "Launch initiative",
  "County visit",
  "Debate strategy",
  "Fundraising effort",
  "Volunteer initiative",
  "Media response",
  "Messaging shift",
  "Coalition engagement",
  "Community outreach",
  "Other",
] as const;

export type DecisionCategory = (typeof DECISION_CATEGORIES)[number];

export type DecisionResultStatus = "Success" | "Mixed" | "Failed" | "Unknown";

export type DecisionLedgerEntry = {
  decisionId: string;
  title: string;
  decisionDate: string;
  category: DecisionCategory;
  summary: string;
  reasoning: string;
  expectedOutcome: string;
  actualOutcome: string;
  resultStatus: DecisionResultStatus;
  lessonLearned: string;
  confidenceImpact: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  governanceLabels: string[];
};

export type DecisionLedgerFile = {
  version: number;
  updatedAt: string;
  purpose: string;
  governanceDefaults: string[];
  entries: DecisionLedgerEntry[];
};

export type RecommendationDisposition = "Accepted" | "Rejected" | "Deferred" | "Unknown";

export type RecommendationLedgerEntry = {
  recommendationId: string;
  recommendation: string;
  sourceSystem: string;
  recommendedAt: string;
  priority: string;
  disposition: RecommendationDisposition;
  result: string;
  confidenceAdjustment: string;
  operatorNotes: string;
  linkedActionId?: string;
  createdAt: string;
  updatedAt: string;
  governanceLabels: string[];
};

export type RecommendationLedgerFile = {
  version: number;
  updatedAt: string;
  purpose: string;
  governanceDefaults: string[];
  entries: RecommendationLedgerEntry[];
};

export type LessonKind =
  | "lesson"
  | "best_practice"
  | "mistake"
  | "warning"
  | "pattern"
  | "future_recommendation"
  | "campaign_wisdom";

export const LESSON_KIND_LABELS: Record<LessonKind, string> = {
  lesson: "Lesson learned",
  best_practice: "Best practice",
  mistake: "Mistake",
  warning: "Warning",
  pattern: "Pattern",
  future_recommendation: "Future recommendation",
  campaign_wisdom: "Campaign wisdom",
};

export type LessonLearnedEntry = {
  lessonId: string;
  kind: LessonKind;
  title: string;
  body: string;
  relatedDecisionIds: string[];
  relatedRecommendationIds: string[];
  tags: string[];
  recordedAt: string;
  recordedBy: string;
  governanceLabels: string[];
};

export type LessonsLearnedRegistryFile = {
  version: number;
  updatedAt: string;
  purpose: string;
  governanceDefaults: string[];
  entries: LessonLearnedEntry[];
};

export type WeeklyReflectionEntry = {
  reflectionId: string;
  weekLabel: string;
  recordedAt: string;
  recordedBy: string;
  whatWorked: string;
  whatFailed: string;
  whatSurprised: string;
  whatToStop: string;
  whatToDoMore: string;
  whatWeAreLearning: string;
  governanceLabels: string[];
};

export type WeeklyReflectionsFile = {
  version: number;
  updatedAt: string;
  purpose: string;
  governanceDefaults: string[];
  entries: WeeklyReflectionEntry[];
};

export type InstitutionalMemoryAuditEntry = {
  auditId: string;
  entityType: "decision" | "recommendation" | "lesson" | "reflection";
  entityId: string;
  eventType: "CREATED" | "UPDATED";
  operator: string;
  changedAt: string;
  changedByRoute: string;
};

export type InstitutionalMemoryAuditLog = {
  logVersion: string;
  updatedAt: string;
  entries: InstitutionalMemoryAuditEntry[];
};

export type InstitutionalMemorySummary = {
  decisionCount: number;
  recommendationCount: number;
  lessonCount: number;
  reflectionCount: number;
  recentDecisions: DecisionLedgerEntry[];
  recentLessons: LessonLearnedEntry[];
  recentRecommendations: RecommendationLedgerEntry[];
  topPatterns: string[];
  emergingLessons: string[];
  institutionalKnowledge: string[];
  memoryHealthScore: number;
  memoryHealthDetail: string;
  weeklyReflectionStatus: {
    lastReflectionAt: string | null;
    lastWeekLabel: string | null;
    daysSinceLastReflection: number | null;
    reflectionCount: number;
  };
};
