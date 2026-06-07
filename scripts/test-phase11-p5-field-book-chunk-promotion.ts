/**
 * Phase 11 P5 — Field Book chunk promotion checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildFieldBookChunkPromotionInventory,
  summarizePromotionInventory,
} from "../src/lib/intelligence/v4/fieldBookChunkPromotionInventory";
import {
  saveFieldBookChunkPromotionState,
  stateFromInventoryReport,
} from "../src/lib/intelligence/v4/fieldBookChunkPromotionState";
import {
  assertPhase11P5Bar,
  computePhase11P5Progress,
  FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF,
  listPromotionBatchSurfaces,
  PHASE11_P5_MIN_CHUNK_TOTAL,
} from "../src/lib/intelligence/v4/phase11P5Closure";
import {
  fieldBookChunkPromotionMeetsPhase11P5Bar,
  getFieldBookChunkPromotionOverlay,
  PROMOTION_BATCH_IDS,
} from "../src/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";
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

  const summary = summarizePromotionInventory(inventory);
  assert.ok(inventory.totalChunks >= PHASE11_P5_MIN_CHUNK_TOTAL, `chunks ${inventory.totalChunks}`);
  assert.ok(summary.batchesAtBar >= 11, `batches at bar ${summary.batchesAtBar}`);
  assert.ok(inventory.batches.length === 11, "batch count");

  for (const batchId of PROMOTION_BATCH_IDS) {
    const overlay = getFieldBookChunkPromotionOverlay(batchId);
    assert.ok(fieldBookChunkPromotionMeetsPhase11P5Bar(overlay), batchId);
    const row = inventory.batches.find((b) => b.batchId === batchId);
    assert.ok(row, batchId);
    assert.ok(row!.chunkCount >= 0, `${batchId} count`);
  }

  const progress = computePhase11P5Progress();
  assert.ok(progress.batchesAtBar >= 11, `progress batches ${progress.batchesAtBar}`);
  assert.ok(progress.totalChunks >= PHASE11_P5_MIN_CHUNK_TOTAL, `progress chunks ${progress.totalChunks}`);

  const bar = assertPhase11P5Bar();
  assert.ok(bar.ok, bar.message);

  const surfaces = listPromotionBatchSurfaces();
  assert.ok(surfaces.length === 11, "surfaces");
  assert.ok(surfaces.every((s) => s.phase11P5Enriched), "all enriched");

  assert.ok(getFieldBookArticle("field-book-chunk-promotion-command"), "field book");
  assert.ok(resolveCanonBinding(FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF), "canon");
  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF),
    "migration",
  );

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p5-upgrade");
  assertRouteExists("/admin/intelligence/field-book-chunk-promotion/kelly-foundation");

  console.log("test-phase11-p5-field-book-chunk-promotion: OK");
  console.log(
    `  chunks: ${progress.totalChunks.toLocaleString()} (${inventory.strategicPlanChunks} Kelly · ${inventory.campaignSystemChunks} CSM) · batches: ${progress.batchesAtBar}/${progress.batchTotal} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
