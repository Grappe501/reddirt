/**
 * Load campaign knowledge bundle — graph + lessons + feedback (Phase 3A).
 */

import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import type { CampaignLearningSnapshot } from "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { CampaignEntityGraph } from "./campaign-entity-graph-types";
import { emptyCampaignEntityGraph } from "./campaign-entity-graph-types";
import { loadCampaignEntityGraph, saveCampaignEntityGraph, upsertEntityNodes } from "./campaign-entity-graph-store";
import {
  intakeFromBlockers,
  intakeFromCountyIntelligence,
  intakeFromHotWashLearning,
  intakeFromUserObservations,
  mergeIntakeResults,
} from "./campaign-observation-intake";
import { ingestLessonCandidates, refreshLessonFreshness, rankCampaignLessons, detectEmergingPatterns } from "./campaign-lessons-engine";
import { loadCampaignLessons } from "./campaign-lessons-store";
import { loadRecommendationFeedback, summarizeRecommendationFeedback } from "./recommendation-feedback-store";
import type { CampaignBlocker } from "@/lib/agents/orchestration/campaign-state-types";
import type { CampaignKnowledgeMemorySlice } from "./campaign-knowledge-memory-types";
import { buildCampaignKnowledgeMemorySlice } from "./campaign-knowledge-memory-types";

export type CampaignKnowledgeBundle = {
  graph: CampaignEntityGraph;
  lessons: ReturnType<typeof refreshLessonFreshness>;
  feedbackSummary: ReturnType<typeof summarizeRecommendationFeedback>;
  memorySlice: CampaignKnowledgeMemorySlice;
  intakeLessonCount: number;
};

const EMPTY_LEARNING: CampaignLearningSnapshot = {
  countyCount: 0,
  topIssues: [],
  topFormats: [],
  blueprintCount: 0,
  volunteerSignals: 0,
  donorSignals: 0,
  recurringBlockers: [],
};

async function loadLearningSnapshotSafe(): Promise<CampaignLearningSnapshot> {
  try {
    const { loadCampaignLearningSnapshot } = await import(
      "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot"
    );
    return await loadCampaignLearningSnapshot();
  } catch {
    return EMPTY_LEARNING;
  }
}

async function loadCountyContextSafe(): Promise<StatewideCountyIntelligence | null> {
  try {
    const { composeCountyDashboardContext } = await import("@/lib/agents/county-intelligence/county-intelligence-engine");
    return composeCountyDashboardContext();
  } catch {
    return null;
  }
}

export async function loadCampaignKnowledgeBundle(
  period = "2026-04",
  options?: { blockers?: CampaignBlocker[]; persistGraph?: boolean },
): Promise<CampaignKnowledgeBundle> {
  const observations = loadGlobalUserObservations().slice(-50);
  const learning = await loadLearningSnapshotSafe();
  const county = await loadCountyContextSafe();

  const intake = mergeIntakeResults(
    intakeFromUserObservations(observations),
    intakeFromHotWashLearning(learning),
    county ? intakeFromCountyIntelligence(county) : { nodes: [], edges: [], lessonCandidates: [] },
    options?.blockers?.length ? intakeFromBlockers(options.blockers) : { nodes: [], edges: [], lessonCandidates: [] },
  );

  const addedLessons = ingestLessonCandidates(intake.lessonCandidates);
  const lessons = refreshLessonFreshness();
  const feedback = loadRecommendationFeedback();
  const feedbackSummary = summarizeRecommendationFeedback(feedback);

  let graph = loadCampaignEntityGraph() ?? emptyCampaignEntityGraph(period);
  graph = upsertEntityNodes({ ...graph, period }, intake.nodes, intake.edges);

  if (options?.persistGraph !== false) {
    saveCampaignEntityGraph(graph);
  }

  const memorySlice = buildCampaignKnowledgeMemorySlice({
    graph,
    lessons: rankCampaignLessons(lessons),
    feedbackSummary,
    blockers: options?.blockers ?? [],
    emergingPatterns: detectEmergingPatterns(lessons),
  });

  return {
    graph,
    lessons,
    feedbackSummary,
    memorySlice,
    intakeLessonCount: addedLessons.length,
  };
}
