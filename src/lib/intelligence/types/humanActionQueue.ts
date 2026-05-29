/** NSI-15 — Strategic Decision Support + Human Action Queue types. */

export const HUMAN_ACTION_QUEUE_REL = "data/intelligence/human-action-queue.json";

export const HUMAN_ACTION_GOVERNANCE_LABELS = [
  "HUMAN_ACTION_REQUIRED",
  "RECOMMENDATION_ONLY",
  "NON_PUBLISHABLE",
  "INTERNAL_USE_ONLY",
] as const;

export type HumanActionType =
  | "REVIEW_CITATION"
  | "REVIEW_CLAIM"
  | "REVIEW_LLM_DRAFT"
  | "CREATE_RETRIEVAL_TASK"
  | "REVIEW_MEDIA_FINDING"
  | "STRENGTHEN_NARRATIVE"
  | "PREPARE_DEBATE_RESPONSE"
  | "UPDATE_COUNTY_BRIEFING"
  | "MONITOR_MEDIA_SOURCE"
  | "VERIFY_BILL_SOURCE"
  | "REVIEW_STRATEGIC_TENSION"
  | "PREPARE_VOLUNTEER_GUIDANCE"
  | "PREPARE_CANDIDATE_BRIEF"
  | "REVIEW_EXPORT_RISK"
  | "VALIDATE_TARGET_PATHWAY"
  | "INVESTIGATE_OPPONENT_MESSAGE"
  | "REVIEW_PUBLIC_MEETING_SOURCE"
  | "CHECK_REGISTRATION_GOAL"
  | "CHECK_COUNTY_OPERATIONAL_RISK";

export type HumanActionStatus =
  | "RECOMMENDED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "DISMISSED"
  | "ARCHIVED";

export type HumanActionPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type HumanActionUrgency = "ROUTINE" | "SOON" | "URGENT" | "IMMEDIATE";

export type HumanActionRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type HumanActionOpportunityLevel = "LOW" | "MEDIUM" | "HIGH";

export type HumanActionSourceSystem =
  | "NSI-1"
  | "NSI-2"
  | "NSI-3"
  | "NSI-4"
  | "NSI-5"
  | "NSI-6"
  | "NSI-7"
  | "NSI-8"
  | "NSI-10"
  | "NSI-11"
  | "NSI-12"
  | "NSI-13"
  | "NSI-14"
  | "SDI-1"
  | "V2-A"
  | "V3-A"
  | "V3-B"
  | "V3-C"
  | "V3-D"
  | "V3-E"
  | "KH-0"
  | "KH-3B";

export type HumanActionOwnerRole =
  | "Research"
  | "Citation Desk"
  | "Debate Prep"
  | "Comms"
  | "Field"
  | "Strategy"
  | "Legal/Compliance"
  | "Candidate Prep"
  | "Media Monitoring";

export type HumanActionQueueItem = {
  actionId: string;
  actionType: HumanActionType;
  title: string;
  summary: string;
  whyItMatters: string;
  recommendedOwnerRole: HumanActionOwnerRole;
  priority: HumanActionPriority;
  urgency: HumanActionUrgency;
  status: HumanActionStatus;
  sourceSystems: HumanActionSourceSystem[];
  linkedNarratives: string[];
  linkedCounties: string[];
  linkedBills: string[];
  linkedClaims: string[];
  linkedCitations: string[];
  linkedTasks: string[];
  linkedMediaFindings: string[];
  linkedScenarios: string[];
  linkedDoctrines: string[];
  linkedExports: string[];
  linkedDrafts: string[];
  evidenceDependencies: string[];
  riskLevel: HumanActionRiskLevel;
  opportunityLevel: HumanActionOpportunityLevel;
  governanceWarnings: string[];
  publicationSafety: "NON_PUBLISHABLE";
  humanActionRequired: true;
  recommendedNextStep: string;
  blockedBy: string[];
  createdAt: string;
  updatedAt: string;
  operatorNotes: string;
};

export type HumanActionQueueFile = {
  version: number;
  generatedAt: string;
  purpose: string;
  governanceDefaults: {
    publicationSafety: "NON_PUBLISHABLE";
    humanActionRequired: true;
    labels: typeof HUMAN_ACTION_GOVERNANCE_LABELS;
    autonomousExecution: false;
  };
  items: HumanActionQueueItem[];
};

export type HumanActionQueueSummary = {
  generatedAt: string;
  totalActions: number;
  recommendedCount: number;
  urgentCount: number;
  blockedCount: number;
  highOpportunityCount: number;
  byStatus: Record<HumanActionStatus, number>;
  byOwnerRole: Record<HumanActionOwnerRole, number>;
  byActionType: Record<string, number>;
  topUrgent: HumanActionQueueItem[];
  topBlocked: HumanActionQueueItem[];
  topOpportunity: HumanActionQueueItem[];
  debatePrepActions: HumanActionQueueItem[];
  citationReviewActions: HumanActionQueueItem[];
  countyBriefingActions: HumanActionQueueItem[];
  targetPathwayActions: HumanActionQueueItem[];
  candidatePrepActions: HumanActionQueueItem[];
  researchActions: HumanActionQueueItem[];
  fieldActions: HumanActionQueueItem[];
  mediaMonitoringActions: HumanActionQueueItem[];
  publicationSafety: "NON_PUBLISHABLE";
  humanActionRequired: true;
  queueHref: string;
};

export type HumanActionRecommendationBundle = {
  generatedAt: string;
  recommendations: HumanActionQueueItem[];
  summary: HumanActionQueueSummary;
};
