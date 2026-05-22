/**
 * CampaignState knowledge memory slice — living memory overlay on snapshot.
 */

import type { CampaignDomainId } from "@/lib/agents/orchestration/campaign-state-types";
import type { CampaignEntityGraph } from "./campaign-entity-graph-types";
import type { CampaignLesson, CampaignLessonRef } from "./campaign-lessons-types";
import type { RecommendationFeedbackSummary } from "./recommendation-feedback-types";
import { detectRecurringBlockerPatterns } from "./campaign-lessons-engine";

export type CampaignKnowledgeMemorySlice = {
  entityCount: number;
  lessonCount: number;
  approvedLessonCount: number;
  strongestLessons: CampaignLessonRef[];
  recentChanges: string[];
  staleDomains: CampaignDomainId[];
  confidenceGaps: string[];
  recurringBlockers: string[];
  emergingPatterns: string[];
  recommendationFeedbackSummary: RecommendationFeedbackSummary;
  underInformedDomains: CampaignDomainId[];
  knowsSummary: string;
  unknownSummary: string;
};

export function buildCampaignKnowledgeMemorySlice(input: {
  graph: CampaignEntityGraph;
  lessons: CampaignLesson[];
  feedbackSummary: RecommendationFeedbackSummary;
  blockers: { message: string; domainId: CampaignDomainId }[];
  emergingPatterns: string[];
}): CampaignKnowledgeMemorySlice {
  const { graph, lessons, feedbackSummary, blockers, emergingPatterns } = input;
  const approved = lessons.filter((l) => l.status === "approved");
  const strongestLessons = lessons
    .filter((l) => l.status === "approved" || l.status === "proposed")
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      title: l.title,
      summary: l.summary,
      domainId: l.domainId,
      confidence: l.confidence,
      usefulnessScore: l.usefulnessScore,
    }));

  const staleDomains = [...new Set(lessons.filter((l) => l.freshness === "stale").map((l) => l.domainId))];
  const underInformedDomains: CampaignDomainId[] = [];
  if ((graph.summary.byKind.person ?? 0) < 3) underInformedDomains.push("volunteer");
  if ((graph.summary.byKind.message ?? 0) < 2) underInformedDomains.push("communications");
  if ((graph.summary.byKind.decision ?? 0) < 1) underInformedDomains.push("campaign_management");
  if ((graph.summary.byKind.event ?? 0) < 2) underInformedDomains.push("event_planning");

  const confidenceGaps: string[] = [];
  if (graph.summary.underInformedKinds.length) {
    confidenceGaps.push(`Sparse entity kinds: ${graph.summary.underInformedKinds.join(", ")}`);
  }
  if (feedbackSummary.total < 5) {
    confidenceGaps.push("Recommendation feedback loop underused — AI cannot learn which advice worked.");
  }

  const recentChanges = lessons
    .filter((l) => l.freshness === "fresh")
    .slice(0, 4)
    .map((l) => `New lesson: ${l.title}`);

  const recurringBlockers = detectRecurringBlockerPatterns(blockers.map((b) => b.message));

  const knowsSummary = `${graph.summary.nodeCount} entities · ${lessons.length} lessons (${approved.length} approved) · feedback success rate ${feedbackSummary.successRate}%.`;
  const unknownSummary =
    underInformedDomains.length > 0
      ? `Under-informed: ${underInformedDomains.map((d) => d.replaceAll("_", " ")).join(", ")}.`
      : "Entity coverage acceptable for V1 — continue observation intake.";

  return {
    entityCount: graph.summary.nodeCount,
    lessonCount: lessons.length,
    approvedLessonCount: approved.length,
    strongestLessons,
    recentChanges,
    staleDomains,
    confidenceGaps,
    recurringBlockers,
    emergingPatterns,
    recommendationFeedbackSummary: feedbackSummary,
    underInformedDomains,
    knowsSummary,
    unknownSummary,
  };
}

export function emptyKnowledgeMemorySlice(): CampaignKnowledgeMemorySlice {
  return {
    entityCount: 0,
    lessonCount: 0,
    approvedLessonCount: 0,
    strongestLessons: [],
    recentChanges: [],
    staleDomains: [],
    confidenceGaps: ["Knowledge graph not loaded"],
    recurringBlockers: [],
    emergingPatterns: [],
    recommendationFeedbackSummary: {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      ignored: 0,
      successful: 0,
      failed: 0,
      successRate: 0,
    },
    underInformedDomains: ["county", "volunteer", "communications"],
    knowsSummary: "Knowledge graph not initialized.",
    unknownSummary: "Run observation intake to populate campaign memory.",
  };
}
