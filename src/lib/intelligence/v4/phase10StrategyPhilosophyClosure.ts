/**
 * Phase 10 — Strategy & political philosophy command closure.
 */
import { listDebatePhilosophyBriefings, getDebatePhilosophyBriefing as getRawDebatePhilosophyBriefing } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { applyPhase10PhilosophyBriefing } from "@/lib/intelligence/v4/applyPhase10StrategyPhilosophy";
import {
  getAllDebatePsychologyManualSectionIds,
  getDebatePsychologyManualSection,
} from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import { loadCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import {
  philosophyBriefingMeetsPhase10Bar,
  philosophyNodeMeetsPhase10Bar,
  psychologySectionMeetsPhase10Bar,
  enrichPhilosophyGraphNode,
} from "@/lib/intelligence/v4/applyPhase10StrategyPhilosophy";
import {
  listAllStrategyPhilosophySurfaces,
  listStrategyMigrationCoverage,
  STRATEGY_PHILOSOPHY_HUB_HREF,
} from "@/lib/intelligence/v4/strategyPhilosophyInventory";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_PHILOSOPHY_BRIEFINGS = 8;
const MIN_PSYCHOLOGY_SECTIONS = 19;
const MIN_PHILOSOPHY_GRAPH_NODES = 8;

export type Phase10StrategyPhilosophyProgress = {
  philosophyBriefingsAtBar: number;
  philosophyBriefingTotal: number;
  psychologySectionsAtBar: number;
  psychologySectionTotal: number;
  philosophyGraphNodesAtBar: number;
  philosophyGraphNodeTotal: number;
  inventorySurfaceCount: number;
  strategyMigrationRoutes: number;
  strategyMigrationUnbound: number;
  overallPct: number;
};

export function computePhase10StrategyPhilosophyProgress(): Phase10StrategyPhilosophyProgress {
  const briefings = listDebatePhilosophyBriefings();
  const briefingsAtBar = briefings.filter(philosophyBriefingMeetsPhase10Bar).length;

  const psychIds = getAllDebatePsychologyManualSectionIds();
  const psychAtBar = psychIds.filter((id) => {
    const s = getDebatePsychologyManualSection(id);
    return s && psychologySectionMeetsPhase10Bar(s);
  }).length;

  const graph = loadCampaignPhilosophyGraph();
  const graphAtBar = graph.nodes.filter((n) => philosophyNodeMeetsPhase10Bar(enrichPhilosophyGraphNode(n))).length;

  const migration = listStrategyMigrationCoverage();

  const briefingScore =
    briefingsAtBar >= MIN_PHILOSOPHY_BRIEFINGS ? 100 : Math.round((briefingsAtBar / MIN_PHILOSOPHY_BRIEFINGS) * 100);
  const psychScore =
    psychAtBar >= MIN_PSYCHOLOGY_SECTIONS ? 100 : Math.round((psychAtBar / MIN_PSYCHOLOGY_SECTIONS) * 100);
  const graphScore =
    graphAtBar >= MIN_PHILOSOPHY_GRAPH_NODES ? 100 : Math.round((graphAtBar / MIN_PHILOSOPHY_GRAPH_NODES) * 100);
  const migrationScore = migration.unboundHrefs.length === 0 ? 100 : Math.max(70, 100 - migration.unboundHrefs.length * 10);

  const overallPct = Math.min(100, Math.round((briefingScore + psychScore + graphScore + migrationScore) / 4));

  return {
    philosophyBriefingsAtBar: briefingsAtBar,
    philosophyBriefingTotal: briefings.length,
    psychologySectionsAtBar: psychAtBar,
    psychologySectionTotal: psychIds.length,
    philosophyGraphNodesAtBar: graphAtBar,
    philosophyGraphNodeTotal: graph.nodes.length,
    inventorySurfaceCount: listAllStrategyPhilosophySurfaces().length,
    strategyMigrationRoutes: listStrategyMigrationRoutes().length,
    strategyMigrationUnbound: migration.unboundHrefs.length,
    overallPct,
  };
}

export type Phase10UpgradePassReport = {
  passId: "phase-10-strategy-philosophy-command";
  title: "Step 10 — Phase 10: Strategy & political philosophy command";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase10StrategyPhilosophyProgress;
};

export function computePhase10UpgradePass(): Phase10UpgradePassReport {
  const progress = computePhase10StrategyPhilosophyProgress();
  return {
    passId: "phase-10-strategy-philosophy-command",
    title: "Step 10 — Phase 10: Strategy & political philosophy command",
    summary:
      "Unified strategy & political philosophy inventory — 8 debate briefings, 19 psychology sections, 8 civic philosophy graph nodes, Kelly manual crosswalk, and intelligence dashboard integration at Phase 9 depth standard.",
    completionPct: progress.overallPct,
    hubHref: STRATEGY_PHILOSOPHY_HUB_HREF,
    progress,
  };
}

export function assertPhase10StrategyPhilosophyBar(): { ok: boolean; message: string } {
  const p = computePhase10StrategyPhilosophyProgress();

  if (p.philosophyBriefingsAtBar < MIN_PHILOSOPHY_BRIEFINGS) {
    return { ok: false, message: `Philosophy briefings ${p.philosophyBriefingsAtBar}/${MIN_PHILOSOPHY_BRIEFINGS}` };
  }
  if (p.psychologySectionsAtBar < MIN_PSYCHOLOGY_SECTIONS) {
    return { ok: false, message: `Psychology sections ${p.psychologySectionsAtBar}/${MIN_PSYCHOLOGY_SECTIONS}` };
  }
  if (p.philosophyGraphNodesAtBar < MIN_PHILOSOPHY_GRAPH_NODES) {
    return { ok: false, message: `Philosophy graph ${p.philosophyGraphNodesAtBar}/${MIN_PHILOSOPHY_GRAPH_NODES}` };
  }

  return { ok: true, message: `Phase 10 strategy philosophy command ${p.overallPct}% at bar` };
}

export function getEnrichedPhilosophyBriefing(briefingId: string) {
  const raw = getRawDebatePhilosophyBriefing(briefingId);
  if (!raw) return undefined;
  return applyPhase10PhilosophyBriefing(raw);
}
