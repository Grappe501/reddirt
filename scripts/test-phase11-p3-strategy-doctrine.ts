/**
 * Phase 11 P3 — Strategy doctrine JSON command checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase11P3Bar,
  computePhase11P3Progress,
  listStrategyDoctrineArtifactSurfaces,
  STRATEGY_DOCTRINE_HUB_HREF,
} from "../src/lib/intelligence/v4/phase11P3Closure";
import {
  getStrategyDoctrineArtifactOverlay,
  strategyDoctrineArtifactMeetsPhase11P3Bar,
} from "../src/lib/intelligence/v4/phase11P3StrategyDoctrineDepth";
import { loadStrategyDoctrineJson } from "../src/lib/strategy-doctrine/load-strategy-doctrine-json";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes, validateStrategyMigrationBridge } from "../src/lib/intelligence/v4/strategyMigrationBridge";
import { loadCampaignStrategicDoctrineRegistry } from "../src/lib/intelligence/campaignStrategicAlignment";

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
  const hasPage = fs.existsSync(path.join(dir, "page.tsx"));
  const hasCatchAll = fs.readdirSync(dir, { withFileTypes: true }).some((d) => d.isDirectory() && d.name.startsWith("[["));
  assert.ok(hasPage || hasCatchAll, `Missing page: ${routePath}`);
}

async function main() {
  const progress = computePhase11P3Progress();
  assert.ok(progress.artifactTotal >= 9, `artifacts ${progress.artifactTotal}`);
  assert.ok(progress.artifactsAtBar >= 9, `at bar ${progress.artifactsAtBar}`);

  const bar = assertPhase11P3Bar();
  assert.ok(bar.ok, bar.message);

  const artifacts = listStrategyDoctrineArtifactSurfaces();
  assert.ok(artifacts.length >= 9, "surfaces");
  for (const a of artifacts) {
    const overlay = getStrategyDoctrineArtifactOverlay(a.pathKey);
    assert.ok(strategyDoctrineArtifactMeetsPhase11P3Bar(overlay), a.pathKey);
    assert.ok(a.phase11P3Enriched, a.pathKey);
  }

  const registry = loadCampaignStrategicDoctrineRegistry();
  assert.ok(registry.doctrines.length >= 10, `registry ${registry.doctrines.length}`);

  assert.ok(getFieldBookArticle("strategy-doctrine-command"), "field book");
  assert.ok(resolveCanonBinding(STRATEGY_DOCTRINE_HUB_HREF), "canon");
  assert.ok(listStrategyMigrationRoutes().some((r) => r.intelligenceHref === STRATEGY_DOCTRINE_HUB_HREF), "migration");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(STRATEGY_DOCTRINE_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p3-upgrade");
  assertRouteExists("/admin/intelligence/strategy-doctrine/steve-strategy-doctrine");

  const steve = await loadStrategyDoctrineJson("steve-strategy-doctrine");
  assert.equal(steve.kind, "doc", "steve doctrine loads");

  console.log("test-phase11-p3-strategy-doctrine: OK");
  console.log(
    `  artifacts: ${progress.artifactsAtBar}/${progress.artifactTotal} · registry: ${progress.registryDoctrineCount} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
