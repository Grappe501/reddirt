/**
 * Phase 10 — Strategy & political philosophy command checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase10StrategyPhilosophyBar,
  computePhase10StrategyPhilosophyProgress,
} from "../src/lib/intelligence/v4/phase10StrategyPhilosophyClosure";
import { listDebatePhilosophyBriefings } from "../src/lib/intelligence/v4/debatePhilosophyBriefings";
import { getAllDebatePsychologyManualSectionIds, getDebatePsychologyManualSection } from "../src/lib/intelligence/v4/debatePsychologyTrainingManual";
import { loadEnrichedCampaignPhilosophyGraph } from "../src/lib/intelligence/campaignIntelligenceGraph";
import { listAllStrategyPhilosophySurfaces } from "../src/lib/intelligence/v4/strategyPhilosophyInventory";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "../src/lib/intelligence/v4/strategyMigrationBridge";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");

function assertRouteExists(routePath: string) {
  const rel = routePath.replace(/^\/admin\/intelligence\/?/, "");
  const segments = rel.split("/").filter(Boolean);
  let dir = APP_ROOT;
  for (const seg of segments) {
    const dynamic = fs.readdirSync(dir, { withFileTypes: true }).find((d) => d.isDirectory() && d.name.startsWith("["));
    if (dynamic) {
      dir = path.join(dir, dynamic.name);
      continue;
    }
    dir = path.join(dir, seg);
  }
  assert.ok(fs.existsSync(path.join(dir, "page.tsx")), `Missing page: ${routePath}`);
}

const progress = computePhase10StrategyPhilosophyProgress();
assert.ok(progress.philosophyBriefingsAtBar >= 8, `Briefings ${progress.philosophyBriefingsAtBar}/8`);
assert.ok(progress.psychologySectionsAtBar >= 19, `Psych ${progress.psychologySectionsAtBar}/19`);
assert.ok(progress.philosophyGraphNodesAtBar >= 8, `Graph ${progress.philosophyGraphNodesAtBar}/8`);
assert.ok(progress.inventorySurfaceCount >= 50, `Inventory ${progress.inventorySurfaceCount}`);

const bar = assertPhase10StrategyPhilosophyBar();
assert.ok(bar.ok, bar.message);

const briefings = listDebatePhilosophyBriefings();
assert.ok(briefings.length >= 8, "briefings");
for (const b of briefings) {
  assert.ok(b.handlingSteps.length >= 6, `${b.briefingId} handling steps`);
  assert.ok(b.relatedLinks.length >= 4, `${b.briefingId} links`);
  assert.ok(b.corePhilosophy.length >= 100, `${b.briefingId} core philosophy depth`);
}

for (const id of getAllDebatePsychologyManualSectionIds()) {
  const s = getDebatePsychologyManualSection(id)!;
  assert.ok(s.kellyApplication.some((line) => line.includes("Philosophy") || line.includes("Strategy")), id);
}

const graph = loadEnrichedCampaignPhilosophyGraph();
assert.ok(graph.nodes.length >= 8, "graph nodes");
for (const node of graph.nodes) {
  assert.ok(node.debateApplication.length >= 2, node.philosophyId);
  assert.ok(node.intelligenceLinks.length >= 2, node.philosophyId);
}

assert.ok(getFieldBookArticle("strategy-philosophy-command"), "field book article");
assert.ok(resolveCanonBinding("/admin/intelligence/strategy-philosophy-hub"), "canon binding");
assert.ok(listStrategyMigrationRoutes().length >= 39, "strategy routes");

assertRouteExists("/admin/intelligence/strategy-philosophy-hub");

const libs = [
  "src/lib/intelligence/v4/phase10StrategyPhilosophyDepth.ts",
  "src/lib/intelligence/v4/applyPhase10StrategyPhilosophy.ts",
  "src/lib/intelligence/v4/phase10StrategyPhilosophyClosure.ts",
  "src/lib/intelligence/v4/strategyPhilosophyInventory.ts",
];
for (const f of libs) {
  assert.ok(fs.existsSync(path.join(process.cwd(), f)), f);
}

assert.ok(listAllStrategyPhilosophySurfaces().some((s) => s.href.includes("kelly-strategic-plan/framework")), "framework link");

console.log("test-phase10-strategy-philosophy-command: OK");
console.log(
  `  briefings: ${progress.philosophyBriefingsAtBar}/8 · psych: ${progress.psychologySectionsAtBar}/19 · graph: ${progress.philosophyGraphNodesAtBar}/8 · inventory: ${progress.inventorySurfaceCount} · overall: ${progress.overallPct}%`,
);
