/**
 * Campaign Knowledge Graph + Lessons Engine — canonical types (Phase 3A).
 * Metadata-only; no raw PII, voter rows, inbox bodies, or secrets.
 */

import type { CampaignDomainId } from "../campaign-state-types";

export type CampaignKnowledgeEntityType =
  | "person"
  | "county"
  | "organization"
  | "event"
  | "message"
  | "workflow"
  | "recommendation"
  | "decision"
  | "task"
  | "donor"
  | "volunteer"
  | "media_item"
  | "issue"
  | "risk"
  | "blocker"
  | "opportunity"
  | "tool"
  | "domain"
  | "document"
  | "observation"
  | "lesson"
  | "outcome";

export type CampaignKnowledgeRelationship =
  | "relates_to"
  | "caused_by"
  | "blocks"
  | "unlocks"
  | "supports"
  | "contradicts"
  | "belongs_to"
  | "occurred_at"
  | "involved_person"
  | "involved_county"
  | "used_tool"
  | "produced_lesson"
  | "triggered_workflow"
  | "generated_recommendation"
  | "accepted_recommendation"
  | "rejected_recommendation"
  | "completed_workflow"
  | "failed_workflow"
  | "improved_domain"
  | "weakened_domain"
  | "needs_followup";

export type CampaignKnowledgeEntity = {
  id: string;
  type: CampaignKnowledgeEntityType;
  label: string;
  summary: string;
  aliases: string[];
  domains: CampaignDomainId[];
  counties: string[];
  sourceIds: string[];
  confidence: number;
  freshness: "fresh" | "aging" | "stale";
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type CampaignKnowledgeEdge = {
  id: string;
  fromId: string;
  toId: string;
  relationship: CampaignKnowledgeRelationship;
  confidence: number;
  evidence: string[];
  sourceIds: string[];
  createdAt: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type CampaignObservationType =
  | "staff_note"
  | "event_hot_wash"
  | "county_signal"
  | "comms_signal"
  | "email_signal"
  | "volunteer_signal"
  | "finance_signal"
  | "compliance_signal"
  | "scheduling_signal"
  | "media_signal"
  | "tool_usage_signal"
  | "workflow_outcome"
  | "recommendation_feedback"
  | "human_decision"
  | "ai_inference";

export type CampaignObservationSensitivity = "public" | "internal" | "sensitive" | "strategic";
export type CampaignObservationApprovalStatus = "proposed" | "approved" | "rejected";

export type CampaignObservation = {
  id: string;
  type: CampaignObservationType;
  title: string;
  summary: string;
  rawText?: string;
  domains: CampaignDomainId[];
  counties: string[];
  people: string[];
  source: string;
  confidence: number;
  sensitivity: CampaignObservationSensitivity;
  approvalStatus: CampaignObservationApprovalStatus;
  createdAt: string;
  evidence: string[];
  suggestedEntities: Partial<CampaignKnowledgeEntity>[];
  suggestedEdges: Partial<CampaignKnowledgeEdge>[];
  suggestedLessons: Partial<CampaignLesson>[];
};

export type CampaignLessonType =
  | "what_worked"
  | "what_failed"
  | "repeated_blocker"
  | "emerging_pattern"
  | "county_learning"
  | "message_learning"
  | "volunteer_learning"
  | "event_learning"
  | "finance_learning"
  | "compliance_learning"
  | "tool_learning"
  | "workflow_learning"
  | "strategic_warning"
  | "strategic_opportunity"
  | "knowledge_gap";

export type CampaignLessonApprovalStatus = "proposed" | "approved" | "rejected" | "archived";

export type CampaignLesson = {
  id: string;
  type: CampaignLessonType;
  title: string;
  summary: string;
  whyItMatters: string;
  domains: CampaignDomainId[];
  counties: string[];
  relatedEntityIds: string[];
  sourceObservationIds: string[];
  confidence: "low" | "medium" | "high";
  freshness: "fresh" | "aging" | "stale";
  actionability: "low" | "medium" | "high";
  approvalStatus: CampaignLessonApprovalStatus;
  createdAt: string;
  expiresAt?: string;
  recommendedFollowup?: string;
};

export type RecommendationFeedbackStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "ignored"
  | "completed"
  | "failed";

export type RecommendationFeedback = {
  recommendationId: string;
  title: string;
  domain: CampaignDomainId;
  county?: string;
  ownerRole?: string;
  proposedAt: string;
  status: RecommendationFeedbackStatus;
  outcomeSummary?: string;
  successScore?: number;
  humanFeedback?: string;
  lessonsProduced: string[];
  updatedAt: string;
};

export type CampaignKnowledgeGraphHealth = {
  entityCount: number;
  edgeCount: number;
  lessonCount: number;
  observationCount: number;
  weakDomains: string[];
  staleDomains: string[];
  missingSources: string[];
  confidence: "high" | "medium" | "low";
};

export type CampaignKnowledgeGraphResult = {
  generatedAt: string;
  entities: CampaignKnowledgeEntity[];
  edges: CampaignKnowledgeEdge[];
  observations: CampaignObservation[];
  lessons: CampaignLesson[];
  recommendationFeedback: RecommendationFeedback[];
  graphHealth: CampaignKnowledgeGraphHealth;
};

export type RecommendationFeedbackSummary = {
  total: number;
  proposed: number;
  accepted: number;
  rejected: number;
  ignored: number;
  completed: number;
  failed: number;
  successRate: number;
};

/** CampaignState.knowledge — living memory summary for orchestration. */
export type CampaignKnowledgeSummary = {
  graphHealth: CampaignKnowledgeGraphHealth;
  strongestLessons: CampaignLesson[];
  recentObservations: CampaignObservation[];
  recurringBlockers: CampaignLesson[];
  knowledgeGaps: CampaignLesson[];
  recommendationFeedbackSummary: RecommendationFeedbackSummary;
  staleDomains: CampaignDomainId[];
  knowsSummary: string;
  unknownSummary: string;
};

export function emptyCampaignKnowledgeSummary(): CampaignKnowledgeSummary {
  return {
    graphHealth: {
      entityCount: 0,
      edgeCount: 0,
      lessonCount: 0,
      observationCount: 0,
      weakDomains: [],
      staleDomains: [],
      missingSources: [],
      confidence: "low",
    },
    strongestLessons: [],
    recentObservations: [],
    recurringBlockers: [],
    knowledgeGaps: [],
    recommendationFeedbackSummary: {
      total: 0,
      proposed: 0,
      accepted: 0,
      rejected: 0,
      ignored: 0,
      completed: 0,
      failed: 0,
      successRate: 0,
    },
    staleDomains: [],
    knowsSummary: "Knowledge graph not initialized.",
    unknownSummary: "Run observation intake to populate campaign memory.",
  };
}
