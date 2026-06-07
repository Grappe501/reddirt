/**
 * Phase 16 P9 — SRE stack closure checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildSreClosureSummary } from "../src/lib/intelligence/v4/phase16P9Closure";
import {
  assertPhase16P9Bar,
  buildPhase16SreClosureState,
  computePhase16P9Progress,
  isSreClosureCommandHomeWired,
  listPhase16SreCheckpointSurfaces,
  SRE_CLOSURE_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P9Closure";
import {
  countPhase16SreCheckpointsAtBar,
  getPhase16SreCheckpointOverlay,
  PHASE16_SRE_CHECKPOINT_IDS,
  phase16SreCheckpointMeetsPhase16P9Bar,
} from "../src/lib/intelligence/v4/phase16P9SreClosureDepth";
import { savePhase16SreClosureState } from "../src/lib/intelligence/v4/phase16P9SreClosureState";
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
  const stackState = buildPhase16SreClosureState();
  savePhase16SreClosureState(stackState, REPO_ROOT);

  assert.ok(stackState.checkpoints.length === 9, "checkpoint count");
  assert.ok(stackState.passesAtBar >= 9, `passes at bar ${stackState.passesAtBar}`);
  assert.ok(stackState.stackCompletionPct >= 90, `stack ${stackState.stackCompletionPct}%`);
  assert.ok(stackState.staffCoachStaffOnly, "staff coach guard");
  assert.ok(stackState.ipadDrillPlayerWired, "ipad shell");
  assert.ok(stackState.drillQueueStageSafe, "drill stage-safe");
  assert.ok(stackState.candidateNavLinkCount <= PHASE15_P0_MAX_CANDIDATE_LINKS, "nav cap");

  const overlayBar = countPhase16SreCheckpointsAtBar();
  assert.ok(overlayBar.atBar === 9, `overlays ${overlayBar.atBar}/9`);

  for (const checkpointId of PHASE16_SRE_CHECKPOINT_IDS) {
    const overlay = getPhase16SreCheckpointOverlay(checkpointId);
    assert.ok(phase16SreCheckpointMeetsPhase16P9Bar(overlay), checkpointId);
  }

  const checkpoints = listPhase16SreCheckpointSurfaces();
  assert.ok(checkpoints.length === 9, "surfaces");
  assert.ok(checkpoints.every((c) => c.atBar), "all sub-passes at bar");
  assert.ok(checkpoints.every((c) => c.phase16P9Enriched), "all enriched");

  const summary = buildSreClosureSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === SRE_CLOSURE_HUB_HREF, "hub href");

  assert.ok(isSreClosureCommandHomeWired(), "command home strip");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(candidateHrefs.includes(SRE_CLOSURE_HUB_HREF), "candidate nav hub");
  assert.ok(!candidateHrefs.includes("/admin/intelligence/evidence-honesty"), "evidence via command home strip");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P9Progress();
  assert.ok(progress.passesAtBar >= 9, `progress passes ${progress.passesAtBar}`);
  assert.ok(progress.stackCompletionPct >= 90, `progress stack ${progress.stackCompletionPct}%`);
  assert.ok(progress.sreExitReady, "SRE exit ready");
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.staffCoachStaffOnly, "coach guard");
  assert.ok(progress.ipadDrillPlayerWired, "ipad wired");
  assert.ok(progress.drillQueueStageSafe, "drill safe");

  const bar = assertPhase16P9Bar();
  assert.ok(bar.ok, bar.message);

  assert.ok(getFieldBookArticle("sre-closure-command"), "field book");
  assert.ok(resolveCanonBinding(SRE_CLOSURE_HUB_HREF), "canon hub");
  assert.ok(resolveCanonBinding("/admin/intelligence/phase-16-p9-upgrade"), "canon upgrade");

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === SRE_CLOSURE_HUB_HREF),
    "migration hub",
  );

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(SRE_CLOSURE_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p9-upgrade");

  console.log("test-phase16-sre-closure: OK");
  console.log(
    `  checkpoints: ${progress.passesAtBar}/${progress.passTotal} · stack: ${progress.stackCompletionPct}% · exit: ${progress.sreExitReady ? "ready" : "open"} · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
