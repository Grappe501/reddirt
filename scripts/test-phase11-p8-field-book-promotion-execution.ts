/**
 * Phase 11 P8 — Field Book promotion execution checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildBriefingPapersChunkAttachReport } from "../src/lib/intelligence/v4/briefingPapersChunkAttachInventory";
import {
  saveBriefingPapersChunkAttachState,
  stateFromAttachReport,
} from "../src/lib/intelligence/v4/briefingPapersChunkAttachState";
import { buildFieldBookChunkPromotionInventory } from "../src/lib/intelligence/v4/fieldBookChunkPromotionInventory";
import {
  saveFieldBookChunkPromotionState,
  stateFromInventoryReport,
} from "../src/lib/intelligence/v4/fieldBookChunkPromotionState";
import { buildFieldBookPromotionExecutionReport } from "../src/lib/intelligence/v4/fieldBookPromotionExecutionInventory";
import {
  saveFieldBookPromotionExecutionState,
  stateFromExecutionReport,
} from "../src/lib/intelligence/v4/fieldBookPromotionExecutionState";
import {
  assertPhase11P8Bar,
  computePhase11P8Progress,
  FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF,
  listPromotionExecutionWaveSurfaces,
} from "../src/lib/intelligence/v4/phase11P8Closure";
import {
  fieldBookPromotionExecutionMeetsPhase11P8Bar,
  getFieldBookPromotionExecutionOverlay,
  PROMOTION_EXECUTION_WAVE_IDS,
} from "../src/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";
import { computeCanonLoopStats } from "../src/lib/intelligence/fieldBookCanonRegistry";
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
  const inventory = await buildFieldBookChunkPromotionInventory();
  saveFieldBookChunkPromotionState(stateFromInventoryReport(inventory), REPO_ROOT);

  const attachReport = await buildBriefingPapersChunkAttachReport();
  saveBriefingPapersChunkAttachState(stateFromAttachReport(attachReport), REPO_ROOT);

  const report = buildFieldBookPromotionExecutionReport();
  saveFieldBookPromotionExecutionState(stateFromExecutionReport(report), REPO_ROOT);

  assert.ok(report.waves.length === 8, "wave count");
  assert.ok(report.totalLinkedChunks >= 2700, `linked ${report.totalLinkedChunks}`);
  assert.ok(report.waves.every((w) => w.phase11P8Enriched), "all waves enriched");

  for (const waveId of PROMOTION_EXECUTION_WAVE_IDS) {
    const overlay = getFieldBookPromotionExecutionOverlay(waveId);
    assert.ok(fieldBookPromotionExecutionMeetsPhase11P8Bar(overlay), waveId);
  }

  const canon = computeCanonLoopStats();
  assert.ok(canon.bindingCount >= 18, `canon ${canon.bindingCount}`);

  const progress = computePhase11P8Progress();
  assert.ok(progress.wavesAtBar >= 8, `waves at bar ${progress.wavesAtBar}`);
  assert.ok(progress.totalLinkedChunks >= 2700, `progress linked ${progress.totalLinkedChunks}`);
  assert.ok(progress.promotionPipelineReady, "pipeline ready");

  const bar = assertPhase11P8Bar();
  assert.ok(bar.ok, bar.message);

  const surfaces = listPromotionExecutionWaveSurfaces();
  assert.ok(surfaces.length === 8, "surfaces");

  assert.ok(getFieldBookArticle("field-book-promotion-execution-command"), "field book");
  assert.ok(resolveCanonBinding(FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF), "canon");
  assert.ok(resolveCanonBinding("/admin/intelligence/field-book/canon"), "canon hub");
  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF),
    "migration",
  );

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p8-upgrade");
  assertRouteExists("/admin/intelligence/field-book-promotion-execution/kelly-foundation-wave");

  console.log("test-phase11-p8-field-book-promotion-execution: OK");
  console.log(
    `  waves: ${progress.wavesAtBar}/${progress.waveTotal} · linked: ${progress.totalLinkedChunks.toLocaleString()} · canon: ${progress.canonBindingCount} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
