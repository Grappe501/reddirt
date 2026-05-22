/**
 * Build CampaignKnowledgeSummary for CampaignState integration.
 */

import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type { CampaignKnowledgeGraphResult, CampaignKnowledgeSummary, CampaignLesson, CampaignObservation } from "./campaign-knowledge-types";
import { emptyCampaignKnowledgeSummary } from "./campaign-knowledge-types";
import { buildCampaignKnowledgeGraph, legacyNodesToEntities } from "./campaign-knowledge-graph";
import { intakeFromUserObservationEntries, mergeObservations } from "./campaign-observation-intake";
import {
  generateCampaignLessons,
  getKnowledgeGapLessons,
  getRecurringBlockerLessons,
  getStrongestLessons,
} from "./campaign-lessons-engine";
import { loadRecommendationFeedback, summarizeRecommendationFeedback } from "./campaign-recommendation-feedback";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import { loadCampaignEntityGraph, saveCampaignEntityGraph, upsertEntityNodes } from "@/lib/agents/campaign-knowledge/campaign-entity-graph-store";
import { loadCampaignLessons as loadLegacyLessons } from "@/lib/agents/campaign-knowledge/campaign-lessons-store";

function legacyLessonsToCanonical(
  lessons: ReturnType<typeof loadLegacyLessons>,
): CampaignLesson[] {
  const typeMap: Record<string, CampaignLesson["type"]> = {
    what_worked: "what_worked",
    what_failed: "what_failed",
    pattern: "emerging_pattern",
    strategy: "strategic_opportunity",
    operational: "workflow_learning",
    comms: "message_learning",
    county: "county_learning",
    finance: "finance_learning",
    volunteer: "volunteer_learning",
    media: "event_learning",
  };
  return lessons.map((l) => ({
    id: l.id,
    type: typeMap[l.lessonType] ?? "emerging_pattern",
    title: l.title,
    summary: l.summary,
    whyItMatters: l.summary,
    domains: [l.domainId],
    counties: l.countySlug ? [l.countySlug] : [],
    relatedEntityIds: l.linkedEntityIds,
    sourceObservationIds: [],
    confidence: l.confidence,
    freshness: l.freshness,
    actionability: l.usefulnessScore >= 70 ? "high" : l.usefulnessScore >= 50 ? "medium" : "low",
    approvalStatus: l.status === "approved" ? "approved" : l.status === "rejected" ? "rejected" : "proposed",
    createdAt: l.createdAt,
    recommendedFollowup: l.requiresHumanApproval ? "Requires human approval before affecting reasoning." : undefined,
  }));
}

export type CampaignKnowledgeBuildResult = {
  graph: CampaignKnowledgeGraphResult;
  summary: CampaignKnowledgeSummary;
};

export async function buildCampaignKnowledgeLayer(
  state: CampaignState,
  sourceHealth: OrchestrationSourceHealth[],
  period = "2026-04",
  options?: { persistGraph?: boolean },
): Promise<CampaignKnowledgeBuildResult> {
  const observations = mergeObservations(intakeFromUserObservationEntries(loadGlobalUserObservations().slice(-50)));

  let hotWashObservations = observations;
  try {
    const { loadCampaignLearningSnapshot } = await import(
      "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot"
    );
    const learning = await loadCampaignLearningSnapshot();
    for (const issue of learning.topIssues.slice(0, 4)) {
      hotWashObservations = mergeObservations(hotWashObservations, [
        {
          id: `obs:hotwash:${issue.slice(0, 30)}`,
          type: "event_hot_wash",
          title: issue.slice(0, 80),
          summary: issue,
          domains: ["hot_wash"],
          counties: [],
          people: [],
          source: "campaign-learning-snapshot",
          confidence: 65,
          sensitivity: "strategic",
          approvalStatus: "proposed",
          createdAt: new Date().toISOString(),
          evidence: [issue],
          suggestedEntities: [],
          suggestedEdges: [],
          suggestedLessons: [
            {
              type: "event_learning",
              title: `Hot wash issue: ${issue.slice(0, 50)}`,
              summary: issue,
              whyItMatters: "Recurring event issues should become operational lessons.",
              domains: ["hot_wash"],
              approvalStatus: "proposed",
            },
          ],
        },
      ]);
    }
  } catch {
    /* graceful degrade */
  }

  const persistedGraph = loadCampaignEntityGraph();
  const persistedEntities = persistedGraph ? legacyNodesToEntities(persistedGraph.nodes) : [];
  const persistedLessons = legacyLessonsToCanonical(loadLegacyLessons());
  const feedback = loadRecommendationFeedback();

  let graph = buildCampaignKnowledgeGraph({
    state,
    sourceHealth,
    observations: hotWashObservations,
    lessons: persistedLessons,
    recommendationFeedback: feedback,
    persistedEntities,
    persistedEdges: [],
  });

  const allLessons = generateCampaignLessons({ state, sourceHealth, graph, persistedLessons });
  graph = { ...graph, lessons: allLessons };

  if (options?.persistGraph !== false && graph.entities.length > 0) {
    const legacyNodes = graph.entities.slice(-200).map((e) => ({
      id: e.id,
      kind: e.type === "tool" ? "tool_usage" : e.type === "outcome" ? "outcome" : e.type,
      label: e.label,
      domainId: e.domains[0],
      sourceSystem: e.sourceIds[0] ?? "knowledge-graph",
      freshnessAt: e.updatedAt,
      confidence: e.confidence,
      metadata: Object.fromEntries(Object.entries(e.metadata).map(([k, v]) => [k, v ?? ""])) as Record<string, string | number | boolean | null>,
    }));
    const saved = upsertEntityNodes(
      persistedGraph ?? { generatedAt: new Date().toISOString(), period, nodes: [], edges: [], summary: { nodeCount: 0, edgeCount: 0, byKind: {}, underInformedKinds: [] } },
      legacyNodes as Parameters<typeof upsertEntityNodes>[1],
    );
    saveCampaignEntityGraph(saved);
  }

  const summary = buildCampaignKnowledgeSummary(graph, allLessons, hotWashObservations, feedback);
  return { graph, summary };
}

export function buildCampaignKnowledgeSummary(
  graph: CampaignKnowledgeGraphResult,
  lessons: CampaignLesson[],
  observations: CampaignObservation[],
  feedback: ReturnType<typeof loadRecommendationFeedback>,
): CampaignKnowledgeSummary {
  const fbSummary = summarizeRecommendationFeedback(feedback);
  const strongest = getStrongestLessons(lessons, 5);
  const recurring = getRecurringBlockerLessons(lessons);
  const gaps = getKnowledgeGapLessons(lessons);
  const staleDomains = [...new Set(lessons.filter((l) => l.freshness === "stale").flatMap((l) => l.domains))];

  const knowsSummary = `${graph.graphHealth.entityCount} entities · ${graph.graphHealth.edgeCount} edges · ${lessons.length} lessons · ${observations.length} observations · advice success ${fbSummary.successRate}%.`;
  const unknownParts: string[] = [];
  if (graph.graphHealth.missingSources.length) {
    unknownParts.push(`Missing/degraded: ${graph.graphHealth.missingSources.join(", ")}`);
  }
  if (gaps.length) {
    unknownParts.push(`${gaps.length} knowledge gap(s) flagged`);
  }
  const unknownSummary =
    unknownParts.length > 0 ? unknownParts.join(" · ") : "Graph coverage acceptable — continue observation intake.";

  return {
    graphHealth: graph.graphHealth,
    strongestLessons: strongest,
    recentObservations: observations.slice(-8),
    recurringBlockers: recurring,
    knowledgeGaps: gaps,
    recommendationFeedbackSummary: fbSummary,
    staleDomains,
    knowsSummary,
    unknownSummary,
  };
}

export { emptyCampaignKnowledgeSummary };
