/**
 * Feedback learning engine — turns human outcomes into observations, lessons, and CampaignState summary.
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type {
  CampaignKnowledgeEdge,
  CampaignKnowledgeEntity,
  CampaignLesson,
  CampaignObservation,
} from "../knowledge/campaign-knowledge-types";
import type {
  FeedbackLoopState,
  LessonApproval,
  RecommendationOutcome,
} from "./orchestration-feedback-types";
import {
  identifyFailedRecommendationPatterns,
  identifyIgnoredRecommendations,
  listRecentRecommendationOutcomes,
  summarizeFeedbackByDomain,
} from "./recommendation-feedback-service";
import { listApprovedLessons, listPendingLessonApprovals, loadLessonApprovals } from "./lesson-approval-service";

function id(prefix: string, ref: string): string {
  return `${prefix}:${ref}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 140);
}

export function observationsFromRecommendationOutcomes(outcomes: RecommendationOutcome[]): CampaignObservation[] {
  return outcomes.slice(-40).map((o) => ({
    id: id("obs:feedback", o.id),
    type: "recommendation_feedback",
    title: `${o.status}: ${o.recommendationTitle}`.slice(0, 120),
    summary: o.outcomeSummary ?? o.humanFeedback ?? `Recommendation ${o.status}`,
    domains: [o.domain],
    counties: o.county ? [o.county] : [],
    people: [],
    source: `orchestration-feedback:${o.source}`,
    confidence: o.status === "completed" ? 85 : o.status === "failed" ? 80 : 65,
    sensitivity: "internal",
    approvalStatus: "approved",
    createdAt: o.decidedAt ?? o.proposedAt,
    evidence: [o.recommendationId, o.status],
    suggestedEntities: [],
    suggestedEdges: [],
    suggestedLessons: [],
  }));
}

export function lessonsFromRecommendationOutcomes(outcomes: RecommendationOutcome[]): CampaignLesson[] {
  const now = new Date().toISOString();
  return outcomes
    .filter((o) => o.status === "completed" || o.status === "failed" || o.status === "needs_revision")
    .slice(-30)
    .map((o) => ({
      id: id("lesson:feedback", o.id),
      type: o.status === "completed" ? "what_worked" : "what_failed",
      title: `${o.status === "completed" ? "Worked" : "Needs correction"}: ${o.recommendationTitle}`.slice(0, 120),
      summary: o.outcomeSummary ?? o.humanFeedback ?? `Human marked recommendation ${o.status}.`,
      whyItMatters:
        o.status === "completed"
          ? "Completed recommendations teach the AI which advice translates into campaign progress."
          : "Failed or revised recommendations prevent the AI from repeating weak advice blindly.",
      domains: [o.domain],
      counties: o.county ? [o.county] : [],
      relatedEntityIds: [id("recommendation", o.recommendationId)],
      sourceObservationIds: o.producedObservationIds,
      confidence: o.status === "completed" ? "high" : "medium",
      freshness: "fresh",
      actionability: o.followupNeeded ? "high" : "medium",
      approvalStatus: "proposed",
      createdAt: now,
      recommendedFollowup: o.followupPrompt,
    }));
}

export function knowledgeEntitiesFromFeedback(outcomes: RecommendationOutcome[], approvals: LessonApproval[]): CampaignKnowledgeEntity[] {
  const now = new Date().toISOString();
  const outcomeEntities: CampaignKnowledgeEntity[] = outcomes.slice(-80).map((o) => ({
    id: id("recommendation", o.recommendationId),
    type: "recommendation",
    label: o.recommendationTitle,
    summary: o.outcomeSummary ?? o.humanFeedback ?? `Recommendation status: ${o.status}`,
    aliases: [],
    domains: [o.domain],
    counties: o.county ? [o.county] : [],
    sourceIds: [o.id],
    confidence: o.status === "completed" ? 90 : o.status === "failed" ? 80 : 65,
    freshness: "fresh",
    createdAt: o.proposedAt,
    updatedAt: o.decidedAt ?? now,
    metadata: { status: o.status, source: o.source, successScore: o.successScore ?? null },
  }));
  const approvalEntities: CampaignKnowledgeEntity[] = approvals.slice(-80).map((a) => ({
    id: id("lesson", a.lessonId),
    type: "lesson",
    label: a.lessonTitle,
    summary: a.reviewerNotes ?? `Lesson approval status: ${a.approvalStatus}`,
    aliases: [],
    domains: a.domains,
    counties: a.counties,
    sourceIds: [a.id],
    confidence: a.confidence === "high" ? 90 : a.confidence === "medium" ? 70 : 50,
    freshness: a.approvalStatus === "expired" ? "stale" : "fresh",
    createdAt: a.reviewedAt ?? now,
    updatedAt: a.reviewedAt ?? now,
    metadata: { approvalStatus: a.approvalStatus, promotedToCampaignMemory: a.promotedToCampaignMemory },
  }));
  return [...outcomeEntities, ...approvalEntities];
}

export function knowledgeEdgesFromFeedback(outcomes: RecommendationOutcome[], approvals: LessonApproval[]): CampaignKnowledgeEdge[] {
  const now = new Date().toISOString();
  const edges: CampaignKnowledgeEdge[] = [];
  for (const o of outcomes.slice(-80)) {
    const recId = id("recommendation", o.recommendationId);
    const domainId = id("domain", o.domain);
    const relationship =
      o.status === "accepted"
        ? "accepted_recommendation"
        : o.status === "rejected"
          ? "rejected_recommendation"
          : o.status === "completed"
            ? o.source === "workflow"
              ? "completed_workflow"
              : "improved_domain"
            : o.status === "failed"
              ? o.source === "workflow"
                ? "failed_workflow"
                : "needs_followup"
              : "needs_followup";
    edges.push({
      id: id("edge", `${recId}:${domainId}:${relationship}`),
      fromId: recId,
      toId: domainId,
      relationship,
      confidence: o.status === "completed" || o.status === "failed" ? 85 : 65,
      evidence: [o.outcomeSummary ?? o.humanFeedback ?? o.status],
      sourceIds: [o.id],
      createdAt: o.decidedAt ?? now,
      metadata: { status: o.status },
    });
  }
  for (const a of approvals.slice(-80)) {
    const lessonId = id("lesson", a.lessonId);
    for (const d of a.domains.length ? a.domains : (["campaign_management"] as CampaignDomainId[])) {
      edges.push({
        id: id("edge", `${lessonId}:domain:${d}:${a.approvalStatus}`),
        fromId: lessonId,
        toId: id("domain", d),
        relationship:
          a.approvalStatus === "approved"
            ? "lesson_approved"
            : a.approvalStatus === "rejected"
              ? "lesson_rejected"
              : "needs_followup",
        confidence: a.approvalStatus === "approved" ? 85 : 60,
        evidence: [a.reviewerNotes ?? a.approvalStatus],
        sourceIds: [a.id],
        createdAt: a.reviewedAt ?? now,
        metadata: { approvalStatus: a.approvalStatus },
      });
    }
  }
  return edges;
}

export function buildFeedbackLoopState(repoRoot?: string): FeedbackLoopState {
  const recentOutcomes = listRecentRecommendationOutcomes(30, repoRoot);
  const approvals = loadLessonApprovals(repoRoot);
  const pendingLessonApprovals = listPendingLessonApprovals(repoRoot);
  const approvedLessons = listApprovedLessons(repoRoot);
  const ignoredRecommendations = identifyIgnoredRecommendations(recentOutcomes);
  const failedPatterns = identifyFailedRecommendationPatterns(recentOutcomes);
  const failedCount = recentOutcomes.filter((o) => o.status === "failed").length;
  const pendingCount = recentOutcomes.filter((o) => o.status === "proposed" || o.status === "accepted").length + pendingLessonApprovals.length;
  const ignoredCount = ignoredRecommendations.length;
  const confidence =
    recentOutcomes.length >= 10 && failedPatterns.length === 0
      ? "high"
      : recentOutcomes.length >= 3 || approvedLessons.length >= 2
        ? "medium"
        : "low";

  const learningSummary =
    recentOutcomes.length === 0
      ? "No human recommendation outcomes recorded yet."
      : `${recentOutcomes.length} recent outcomes · ${approvedLessons.length} approved lessons · ${ignoredCount} ignored · ${failedCount} failed.`;

  return {
    recentOutcomes,
    pendingLessonApprovals,
    approvedLessons,
    ignoredRecommendations,
    failedPatterns,
    learningSummary,
    feedbackHealth: {
      pendingCount,
      approvedLessonCount: approvedLessons.length,
      ignoredCount,
      failedCount,
      confidence,
    },
    domainSummary: summarizeFeedbackByDomain(recentOutcomes),
  };
}
