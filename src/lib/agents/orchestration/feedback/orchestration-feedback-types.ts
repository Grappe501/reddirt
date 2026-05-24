/**
 * Feedback + Lesson Approval Loop — canonical types (Phase 3B).
 * Human feedback teaches the campaign brain what actually happened.
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type { CampaignLessonType } from "../knowledge/campaign-knowledge-types";

export type RecommendationOutcomeStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "ignored"
  | "completed"
  | "failed"
  | "needs_revision";

export type RecommendationOutcomeSource =
  | "top_move"
  | "workflow"
  | "tool_recommendation"
  | "prepared_action"
  | "lesson_followup";

export type RecommendationOutcome = {
  id: string;
  recommendationId: string;
  recommendationTitle: string;
  source: RecommendationOutcomeSource;
  domain: CampaignDomainId;
  county?: string;
  ownerRole?: string;
  proposedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  status: RecommendationOutcomeStatus;
  outcomeSummary?: string;
  humanFeedback?: string;
  correction?: string;
  successScore?: number;
  producedObservationIds: string[];
  producedLessonIds: string[];
  followupNeeded: boolean;
  followupPrompt?: string;
  safetyNotes: string[];
};

export type LessonApprovalStatus =
  | "suggested"
  | "approved"
  | "rejected"
  | "archived"
  | "expired"
  | "needs_more_evidence";

export type LessonApprovalSensitivity = "public" | "internal" | "strategic" | "sensitive";

export type LessonApproval = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  lessonType: CampaignLessonType;
  domains: CampaignDomainId[];
  counties: string[];
  confidence: "low" | "medium" | "high";
  sensitivity: LessonApprovalSensitivity;
  approvalStatus: LessonApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  expirationPolicy?: string;
  promotedToCampaignMemory: boolean;
  sourceObservationIds: string[];
  safetyNotes: string[];
};

export type FailedRecommendationPattern = {
  source: RecommendationOutcomeSource;
  domain: CampaignDomainId;
  count: number;
  summary: string;
  recommendedAdjustment: string;
};

export type FeedbackDomainSummary = {
  domain: CampaignDomainId;
  total: number;
  accepted: number;
  rejected: number;
  completed: number;
  failed: number;
  ignored: number;
  needsRevision: number;
};

export type FeedbackHealth = {
  pendingCount: number;
  approvedLessonCount: number;
  ignoredCount: number;
  failedCount: number;
  confidence: "high" | "medium" | "low";
};

export type FeedbackLoopState = {
  recentOutcomes: RecommendationOutcome[];
  pendingLessonApprovals: LessonApproval[];
  approvedLessons: LessonApproval[];
  ignoredRecommendations: RecommendationOutcome[];
  failedPatterns: FailedRecommendationPattern[];
  learningSummary: string;
  feedbackHealth: FeedbackHealth;
  domainSummary: FeedbackDomainSummary[];
};

export function emptyFeedbackLoopState(): FeedbackLoopState {
  return {
    recentOutcomes: [],
    pendingLessonApprovals: [],
    approvedLessons: [],
    ignoredRecommendations: [],
    failedPatterns: [],
    learningSummary: "Feedback loop not initialized.",
    feedbackHealth: {
      pendingCount: 0,
      approvedLessonCount: 0,
      ignoredCount: 0,
      failedCount: 0,
      confidence: "low",
    },
    domainSummary: [],
  };
}
