/**
 * Adapter — sync legacy knowledgeMemory slice from CampaignKnowledgeSummary.
 */

import type { CampaignKnowledgeSummary } from "@/lib/agents/orchestration/knowledge/campaign-knowledge-types";
import type { CampaignKnowledgeMemorySlice } from "@/lib/agents/campaign-knowledge/campaign-knowledge-memory-types";
import { emptyKnowledgeMemorySlice } from "@/lib/agents/campaign-knowledge/campaign-knowledge-memory-types";

export function knowledgeSummaryToMemorySlice(knowledge: CampaignKnowledgeSummary): CampaignKnowledgeMemorySlice {
  if (!knowledge.graphHealth.entityCount && !knowledge.strongestLessons.length) {
    return emptyKnowledgeMemorySlice();
  }
  return {
    entityCount: knowledge.graphHealth.entityCount,
    lessonCount: knowledge.graphHealth.lessonCount,
    approvedLessonCount: knowledge.strongestLessons.filter((l) => l.approvalStatus === "approved").length,
    strongestLessons: knowledge.strongestLessons.map((l) => ({
      id: l.id,
      title: l.title,
      summary: l.summary,
      domainId: l.domains[0] ?? "campaign_management",
      confidence: l.confidence,
      usefulnessScore: l.actionability === "high" ? 80 : l.actionability === "medium" ? 60 : 40,
    })),
    recentChanges: knowledge.recentObservations.slice(0, 4).map((o) => `Observation: ${o.title}`),
    staleDomains: knowledge.staleDomains,
    confidenceGaps: knowledge.knowledgeGaps.map((g) => g.summary).slice(0, 5),
    recurringBlockers: knowledge.recurringBlockers.map((l) => l.summary),
    emergingPatterns: knowledge.strongestLessons.filter((l) => l.type === "emerging_pattern").map((l) => l.title),
    recommendationFeedbackSummary: {
      total: knowledge.recommendationFeedbackSummary.total,
      pending: knowledge.recommendationFeedbackSummary.proposed,
      accepted: knowledge.recommendationFeedbackSummary.accepted,
      rejected: knowledge.recommendationFeedbackSummary.rejected,
      completed: knowledge.recommendationFeedbackSummary.completed,
      ignored: knowledge.recommendationFeedbackSummary.ignored,
      successful: knowledge.recommendationFeedbackSummary.completed,
      failed: knowledge.recommendationFeedbackSummary.failed,
      successRate: knowledge.recommendationFeedbackSummary.successRate,
    },
    underInformedDomains: knowledge.knowledgeGaps.flatMap((g) => g.domains).slice(0, 6),
    knowsSummary: knowledge.knowsSummary,
    unknownSummary: knowledge.unknownSummary,
  };
}
