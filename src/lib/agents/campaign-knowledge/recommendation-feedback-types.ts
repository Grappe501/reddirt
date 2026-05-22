/**
 * Recommendation feedback loop — teaches which AI advice worked.
 */

import type { CampaignDomainId } from "@/lib/agents/orchestration/campaign-state-types";

export type RecommendationFeedbackStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "ignored"
  | "successful"
  | "failed";

export type RecommendationKind = "top_move" | "workflow" | "county_action" | "comms_action" | "tool_build" | "lesson";

export type RecommendationFeedbackRecord = {
  id: string;
  recommendationId: string;
  recommendationKind: RecommendationKind;
  title: string;
  domainId: CampaignDomainId;
  period: string;
  status: RecommendationFeedbackStatus;
  recordedAt: string;
  recordedBy?: string;
  outcomeNote?: string;
};

export type RecommendationFeedbackSummary = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
  ignored: number;
  successful: number;
  failed: number;
  successRate: number;
};
