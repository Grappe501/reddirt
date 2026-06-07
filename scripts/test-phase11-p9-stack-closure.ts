/**
 * Phase 11 P9 — Stack closure checks.
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
  assertPhase11P9Bar,
  buildPhase11StackClosureState,
  computePhase11P9Progress,
  listPhase11StackCheckpointSurfaces,
  PHASE_11_STACK_CLOSURE_HUB_HREF,
} from "../src/lib/intelligence/v4/phase11P9Closure";
import {
  countPhase11StackCheckpointsAtBar,
  getPhase11StackCheckpointOverlay,
  PHASE_11_STACK_CHECKPOINT_IDS,
  phase11StackCheckpointMeetsPhase11P9Bar,
} from "../src/lib/intelligence/v4/phase11P9StackClosureDepth";
import { savePhase11StackClosureState } from "../src/lib/intelligence/v4/phase11StackClosureState";
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

  const execReport = buildFieldBookPromotionExecutionReport();
  saveFieldBookPromotionExecutionState(stateFromExecutionReport(execReport), REPO_ROOT);

  const stackState = buildPhase11StackClosureState();
  savePhase11StackClosureState(stackState, REPO_ROOT);

  assert.ok(stackState.checkpoints.length === 9, "checkpoint count");
  assert.ok(stackState.passesAtBar >= 9, `passes at bar ${stackState.passesAtBar}`);
  assert.ok(stackState.stackCompletionPct >= 90, `stack ${stackState.stackCompletionPct}%`);
  assert.ok(stackState.promotionPipelineReady, "pipeline ready");

  const overlayBar = countPhase11StackCheckpointsAtBar();
  assert.ok(overlayBar.atBar === 9, `overlays ${overlayBar.atBar}/9`);

  for (const checkpointId of PHASE_11_STACK_CHECKPOINT_IDS) {
    const overlay = getPhase11StackCheckpointOverlay(checkpointId);
    assert.ok(phase11StackCheckpointMeetsPhase11P9Bar(overlay), checkpointId);
  }

  const checkpoints = listPhase11StackCheckpointSurfaces();
  assert.ok(checkpoints.length === 9, "surfaces");
  assert.ok(checkpoints.every((c) => c.atBar), "all sub-passes at bar");
  assert.ok(checkpoints.every((c) => c.phase11P9Enriched), "all enriched");

  const progress = computePhase11P9Progress();
  assert.ok(progress.passesAtBar >= 9, `progress passes ${progress.passesAtBar}`);
  assert.ok(progress.stackCompletionPct >= 90, `progress stack ${progress.stackCompletionPct}%`);
  assert.ok(progress.stackExitReady, "stack exit ready");

  const bar = assertPhase11P9Bar();
  assert.ok(bar.ok, bar.message);

  const canon = computeCanonLoopStats();
  assert.ok(canon.bindingCount >= 20, `canon ${canon.bindingCount}`);

  assert.ok(getFieldBookArticle("phase-11-stack-closure-command"), "field book");
  assert.ok(resolveCanonBinding(PHASE_11_STACK_CLOSURE_HUB_HREF), "canon hub");
  assert.ok(resolveCanonBinding("/admin/intelligence/phase-11-p9-upgrade"), "canon upgrade");
  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === PHASE_11_STACK_CLOSURE_HUB_HREF),
    "migration hub",
  );

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(PHASE_11_STACK_CLOSURE_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p9-upgrade");

  console.log("test-phase11-p9-stack-closure: OK");
  console.log(
    `  checkpoints: ${progress.passesAtBar}/${progress.passTotal} · stack: ${progress.stackCompletionPct}% · exit: ${progress.stackExitReady ? "ready" : "open"} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
