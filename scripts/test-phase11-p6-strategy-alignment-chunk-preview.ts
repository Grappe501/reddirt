/**
 * Phase 11 P6 — Strategy alignment chunk preview checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase11P6Bar,
  computePhase11P6Progress,
  listAlignmentChunkPreviewLaneSurfaces,
  STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
} from "../src/lib/intelligence/v4/phase11P6Closure";
import {
  ALIGNMENT_CHUNK_PREVIEW_LANE_IDS,
  getStrategyAlignmentChunkPreviewOverlay,
  strategyAlignmentChunkPreviewMeetsPhase11P6Bar,
} from "../src/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";
import { buildStrategyAlignmentChunkPreviewReport } from "../src/lib/intelligence/v4/strategyAlignmentChunkPreviewInventory";
import {
  saveStrategyAlignmentChunkPreviewState,
  stateFromPreviewReport,
} from "../src/lib/intelligence/v4/strategyAlignmentChunkPreviewState";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes, validateStrategyMigrationBridge } from "../src/lib/intelligence/v4/strategyMigrationBridge";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");
const REPO_ROOT = process.cwd();

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
  assert.ok(hasPage, `Missing page: ${routePath}`);
}

async function main() {
  const report = await buildStrategyAlignmentChunkPreviewReport();
  saveStrategyAlignmentChunkPreviewState(stateFromPreviewReport(report), REPO_ROOT);

  assert.ok(report.lanes.length === 8, "lane count");
  assert.ok(report.totalMatchingChunks >= 200, `matching ${report.totalMatchingChunks}`);
  assert.ok(report.lanes.every((l) => l.phase11P6Enriched), "all lanes enriched");

  for (const laneId of ALIGNMENT_CHUNK_PREVIEW_LANE_IDS) {
    const overlay = getStrategyAlignmentChunkPreviewOverlay(laneId);
    assert.ok(strategyAlignmentChunkPreviewMeetsPhase11P6Bar(overlay), laneId);
    const row = report.lanes.find((l) => l.laneId === laneId);
    assert.ok(row, laneId);
    assert.ok(row!.matchingChunkCount >= 0, `${laneId} count`);
  }

  const progress = computePhase11P6Progress();
  assert.ok(progress.lanesAtBar >= 8, `lanes at bar ${progress.lanesAtBar}`);
  assert.ok(progress.totalMatchingChunks >= 200, `progress matching ${progress.totalMatchingChunks}`);

  const bar = assertPhase11P6Bar();
  assert.ok(bar.ok, bar.message);

  const surfaces = listAlignmentChunkPreviewLaneSurfaces();
  assert.ok(surfaces.length === 8, "surfaces");
  assert.ok(surfaces.every((s) => s.phase11P6Enriched), "all enriched");

  assert.ok(getFieldBookArticle("strategy-alignment-chunk-preview-command"), "field book");
  assert.ok(resolveCanonBinding(STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF), "canon");
  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF),
    "migration hub",
  );
  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === "/admin/intelligence/strategy-alignment"),
    "alignment migration",
  );

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p6-upgrade");
  assertRouteExists("/admin/intelligence/strategy-alignment-chunk-preview/foundation-civic-trust");

  console.log("test-phase11-p6-strategy-alignment-chunk-preview: OK");
  console.log(
    `  lanes: ${progress.lanesAtBar}/${progress.laneTotal} · matching: ${progress.totalMatchingChunks.toLocaleString()} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
