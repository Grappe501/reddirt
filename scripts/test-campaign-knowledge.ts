/**
 * Campaign Knowledge Graph + Lessons Engine — Phase 3A smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildCampaignKnowledgeGraph } from "../src/lib/agents/orchestration/knowledge/campaign-knowledge-graph";
import { intakeRawObservation } from "../src/lib/agents/orchestration/knowledge/campaign-observation-intake";
import {
  detectRecurringBlockerLessons,
  generateCampaignLessons,
  generateKnowledgeGapLessons,
} from "../src/lib/agents/orchestration/knowledge/campaign-lessons-engine";
import {
  loadRecommendationFeedback,
  recordRecommendationFeedback,
  summarizeRecommendationFeedback,
} from "../src/lib/agents/orchestration/knowledge/campaign-recommendation-feedback";
import { buildSkeletonCampaignState } from "../src/lib/agents/orchestration/campaign-state-types";
import { buildOrchestrationStatePayload } from "../src/lib/agents/orchestration/build-orchestration-payload";
import { ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS } from "../src/lib/agents/orchestration/orchestration-tool-contracts";
import { CAMPAIGN_KNOWLEDGE_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-campaign-knowledge-tools";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
loadRedDirtEnv(repoRoot);
resetCountyWorkbenchAdapterCache();

async function main() {
  const skeleton = buildSkeletonCampaignState("2026-04");
  const sourceHealth = [
    { sourceId: "county", label: "County intelligence", status: "degraded" as const, detail: "Bridge partial" },
    { sourceId: "observations", label: "Observations", status: "ready" as const },
  ];

  const obs = intakeRawObservation({
    title: "House party follow-up worked in Washington County",
    rawText: "Hosts responded when thanked within 24h.",
    source: "staff-note-test",
    domains: ["county", "event_planning"],
    counties: ["washington"],
    sensitivity: "internal",
  });

  const graph = buildCampaignKnowledgeGraph({
    state: skeleton,
    sourceHealth,
    observations: obs ? [obs] : [],
  });

  const recurring = detectRecurringBlockerLessons([
    "Calendar sync stale",
    "Calendar sync stale",
    "Reimbursement packet incomplete",
  ]);
  const gaps = generateKnowledgeGapLessons(skeleton, sourceHealth, graph);
  const lessons = generateCampaignLessons({ state: skeleton, sourceHealth, graph, persistedLessons: [...recurring, ...gaps] });

  recordRecommendationFeedback({
    recommendationId: "test-knowledge-phase-3a",
    title: "Refresh county intelligence",
    domain: "county",
    proposedAt: new Date().toISOString(),
    status: "accepted",
  });
  const fb = summarizeRecommendationFeedback(loadRecommendationFeedback());

  console.log("Campaign knowledge test (Phase 3A)");
  console.log("  tool contracts:", CAMPAIGN_KNOWLEDGE_TOOL_CONTRACTS.length);
  console.log("  graph entities:", graph.entities.length);
  console.log("  graph edges:", graph.edges.length);
  console.log("  observation intake:", obs ? "ok" : "blocked");
  console.log("  lessons generated:", lessons.length);
  console.log("  recurring blocker lessons:", recurring.length);
  console.log("  knowledge gaps:", gaps.length);
  console.log("  feedback total:", fb.total);

  const payload = await buildOrchestrationStatePayload("2026-04");
  const k = payload.campaignState.knowledge;
  const knowledgeSource = payload.sourceHealth.find((s) => s.sourceId === "campaign_knowledge");

  console.log("  CampaignState.knowledge entities:", k.graphHealth.entityCount);
  console.log("  CampaignState.knowledge gaps:", k.knowledgeGaps.length);
  console.log("  campaign_knowledge source:", knowledgeSource?.status);
  console.log("  forbidden auto actions:", ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS.length);

  const hasGraph = graph.entities.length > 0 && graph.edges.length >= 0;
  const hasObs = obs != null && obs.suggestedLessons.length >= 0;
  const hasRecurring = recurring.some((l) => l.type === "repeated_blocker");
  const hasGaps = gaps.some((l) => l.type === "knowledge_gap");
  const hasFeedback = fb.total >= 1;
  const hasStateKnowledge = k != null && typeof k.graphHealth.entityCount === "number";
  const hasPayloadKnowledge = payload.campaignState.knowledge.strongestLessons != null;
  const hasSource = knowledgeSource != null;
  const hasSafety = ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS.length >= 5;

  const ok =
    hasGraph &&
    hasObs &&
    hasRecurring &&
    hasGaps &&
    hasFeedback &&
    hasStateKnowledge &&
    hasPayloadKnowledge &&
    hasSource &&
    hasSafety;

  if (!ok) {
    console.error("FAIL", {
      hasGraph,
      hasObs,
      hasRecurring,
      hasGaps,
      hasFeedback,
      hasStateKnowledge,
      hasPayloadKnowledge,
      hasSource,
      hasSafety,
    });
    process.exit(1);
  }
  console.log("OK — campaign knowledge graph, lessons engine, and CampaignState integration");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
