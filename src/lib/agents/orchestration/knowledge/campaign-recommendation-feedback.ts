/**
 * Recommendation feedback loop — track whether AI advice worked.
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type { RecommendationFeedback, RecommendationFeedbackStatus, RecommendationFeedbackSummary } from "./campaign-knowledge-types";
import {
  loadRecommendationFeedback as loadLegacyFeedback,
  recordRecommendationFeedback as recordLegacyFeedback,
  summarizeRecommendationFeedback as summarizeLegacyFeedback,
} from "@/lib/agents/campaign-knowledge/recommendation-feedback-store";
import type { RecommendationFeedbackRecord } from "@/lib/agents/campaign-knowledge/recommendation-feedback-types";

function toCanonical(record: RecommendationFeedbackRecord): RecommendationFeedback {
  const statusMap: Record<string, RecommendationFeedbackStatus> = {
    pending: "proposed",
    accepted: "accepted",
    rejected: "rejected",
    ignored: "ignored",
    completed: "completed",
    failed: "failed",
    successful: "completed",
  };
  return {
    recommendationId: record.recommendationId,
    title: record.title,
    domain: record.domainId,
    proposedAt: record.recordedAt,
    status: statusMap[record.status] ?? "proposed",
    outcomeSummary: record.outcomeNote,
    successScore: record.status === "successful" || record.status === "completed" ? 100 : record.status === "failed" ? 0 : undefined,
    lessonsProduced: [],
    updatedAt: record.recordedAt,
  };
}

export function loadRecommendationFeedback(repoRoot?: string): RecommendationFeedback[] {
  return loadLegacyFeedback(repoRoot).map(toCanonical);
}

export function recordRecommendationFeedback(
  partial: Omit<RecommendationFeedback, "updatedAt" | "lessonsProduced"> & { updatedAt?: string; lessonsProduced?: string[] },
  repoRoot?: string,
): RecommendationFeedback {
  const statusToLegacy: Record<RecommendationFeedbackStatus, RecommendationFeedbackRecord["status"]> = {
    proposed: "pending",
    accepted: "accepted",
    rejected: "rejected",
    ignored: "ignored",
    completed: "completed",
    failed: "failed",
  };
  const rec = recordLegacyFeedback(
    {
      recommendationId: partial.recommendationId,
      recommendationKind: "top_move",
      title: partial.title,
      domainId: partial.domain as CampaignDomainId,
      period: "2026-04",
      status: statusToLegacy[partial.status],
      outcomeNote: partial.outcomeSummary,
      recordedAt: partial.updatedAt,
    },
    repoRoot,
  );
  return toCanonical(rec);
}

export function summarizeRecommendationFeedback(feedback: RecommendationFeedback[]): RecommendationFeedbackSummary {
  const legacy = feedback.map((f) => ({
    id: f.recommendationId,
    recommendationId: f.recommendationId,
    recommendationKind: "top_move" as const,
    title: f.title,
    domainId: f.domain,
    period: "2026-04",
    status:
      f.status === "proposed"
        ? ("pending" as const)
        : f.status === "completed"
          ? ("completed" as const)
          : f.status,
    recordedAt: f.updatedAt,
    outcomeNote: f.outcomeSummary,
  }));
  const s = summarizeLegacyFeedback(legacy);
  return {
    total: s.total,
    proposed: s.pending,
    accepted: s.accepted,
    rejected: s.rejected,
    ignored: s.ignored,
    completed: s.completed + s.successful,
    failed: s.failed,
    successRate: s.successRate,
  };
}

export function recommendationsNeedingFollowup(feedback: RecommendationFeedback[]): RecommendationFeedback[] {
  return feedback.filter((f) => f.status === "proposed" || f.status === "accepted");
}
