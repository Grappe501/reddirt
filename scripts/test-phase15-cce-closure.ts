/**
 * Phase 15 P9 — CCE closure checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCceClosureSummary } from "../src/lib/intelligence/v4/phase15P9Closure";
import {
  assertPhase15P9Bar,
  buildPhase15CceClosureState,
  computePhase15P9Progress,
  CCE_CLOSURE_HUB_HREF,
  isCceClosureCommandHomeWired,
  listPhase15CceCheckpointSurfaces,
} from "../src/lib/intelligence/v4/phase15P9Closure";
import {
  countPhase15CceCheckpointsAtBar,
  getPhase15CceCheckpointOverlay,
  PHASE15_CCE_CHECKPOINT_IDS,
  phase15CceCheckpointMeetsPhase15P9Bar,
} from "../src/lib/intelligence/v4/phase15P9CceClosureDepth";
import { savePhase15CceClosureState } from "../src/lib/intelligence/v4/phase15CceClosureState";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "../src/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";
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
  assert.ok(fs.existsSync(path.join(dir, "page.tsx")), `Missing page: ${routePath}`);
}

function main() {
  const stackState = buildPhase15CceClosureState();
  savePhase15CceClosureState(stackState, REPO_ROOT);

  assert.ok(stackState.checkpoints.length === 8, "checkpoint count");
  assert.ok(stackState.passesAtBar >= 8, `passes at bar ${stackState.passesAtBar}`);
  assert.ok(stackState.stackCompletionPct >= 90, `stack ${stackState.stackCompletionPct}%`);
  assert.ok(stackState.staffBackstageEnforced, "staff backstage");
  assert.ok(stackState.candidateNavLinkCount <= PHASE15_P0_MAX_CANDIDATE_LINKS, "nav cap");

  const overlayBar = countPhase15CceCheckpointsAtBar();
  assert.ok(overlayBar.atBar === 8, `overlays ${overlayBar.atBar}/8`);

  for (const checkpointId of PHASE15_CCE_CHECKPOINT_IDS) {
    const overlay = getPhase15CceCheckpointOverlay(checkpointId);
    assert.ok(phase15CceCheckpointMeetsPhase15P9Bar(overlay), checkpointId);
  }

  const checkpoints = listPhase15CceCheckpointSurfaces();
  assert.ok(checkpoints.length === 8, "surfaces");
  assert.ok(checkpoints.every((c) => c.atBar), "all sub-passes at bar");
  assert.ok(checkpoints.every((c) => c.phase15P9Enriched), "all enriched");

  const summary = buildCceClosureSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === CCE_CLOSURE_HUB_HREF, "hub href");

  assert.ok(isCceClosureCommandHomeWired(), "command home strip");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(isCceClosureCommandHomeWired(), "command home strip");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase15P9Progress();
  assert.ok(progress.passesAtBar >= 8, `progress passes ${progress.passesAtBar}`);
  assert.ok(progress.stackCompletionPct >= 90, `progress stack ${progress.stackCompletionPct}%`);
  assert.ok(progress.cceExitReady, "CCE exit ready");
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");

  const bar = assertPhase15P9Bar();
  assert.ok(bar.ok, bar.message);

  assert.ok(getFieldBookArticle("cce-closure-command"), "field book");
  assert.ok(resolveCanonBinding(CCE_CLOSURE_HUB_HREF), "canon hub");
  assert.ok(resolveCanonBinding("/admin/intelligence/phase-15-p9-upgrade"), "canon upgrade");

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === CCE_CLOSURE_HUB_HREF),
    "migration hub",
  );

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(CCE_CLOSURE_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p9-upgrade");

  console.log("test-phase15-cce-closure: OK");
  console.log(
    `  checkpoints: ${progress.passesAtBar}/${progress.passTotal} · stack: ${progress.stackCompletionPct}% · exit: ${progress.cceExitReady ? "ready" : "open"} · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
