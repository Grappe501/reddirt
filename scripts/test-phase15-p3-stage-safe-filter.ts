/**
 * Phase 15 P3 — Stage-safe filter checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase15P3Bar,
  computePhase15P3Progress,
  PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF,
} from "../src/lib/intelligence/v4/phase15P3Closure";
import {
  COACHING_SCRIPT_SURFACE_IDS,
  countStageSafeSurfacesAtBar,
  getCoachingScriptStageSafeOverlay,
  getSosQuestionStageSafeOverlay,
  getTrapLaneStageSafeOverlay,
  listStageSafeSurfaceOverlays,
  stageSafeSurfaceMeetsPhase15P3Bar,
} from "../src/lib/intelligence/v4/phase15P3StageSafeFilterDepth";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "../src/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "../src/lib/intelligence/v4/sosDebateQuestionBank";
import {
  evaluateStageSafeContent,
  resolveStageSafeAudience,
} from "../src/lib/intelligence/v4/phase15StageSafeFilter";
import {
  isClaimsGateCandidateBlocked,
  isClaimsGateStageBlocked,
} from "../src/lib/intelligence/v4/claimsGatePolicy";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "../src/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes, validateStrategyMigrationBridge } from "../src/lib/intelligence/v4/strategyMigrationBridge";

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

function main() {
  const surfaces = listStageSafeSurfaceOverlays();
  assert.ok(surfaces.length >= 38, `surfaces ${surfaces.length}`);
  assert.ok(surfaces.every((s) => stageSafeSurfaceMeetsPhase15P3Bar(s)), "all overlays at bar");

  const bar = countStageSafeSurfacesAtBar();
  assert.ok(bar.atBar === bar.total, `at bar ${bar.atBar}/${bar.total}`);
  assert.ok(bar.candidateBlocked >= 10, `gated ${bar.candidateBlocked}`);

  for (const laneId of getAllTrapLaneIds()) {
    const drill = getTrapLaneDrillDown(laneId)!;
    const decision = evaluateStageSafeContent(drill.claimsGate, "candidate");
    if (isClaimsGateCandidateBlocked(drill.claimsGate)) {
      assert.ok(decision.blocked, `trap candidate block ${laneId}`);
    }
    assert.ok(getTrapLaneStageSafeOverlay(laneId), laneId);
  }

  for (const qId of getAllSosDebateQuestionIds()) {
    const drill = getSosDebateQuestionDrillDown(qId)!;
    const decision = evaluateStageSafeContent(drill.claimsGate, "candidate");
    if (isClaimsGateCandidateBlocked(drill.claimsGate)) {
      assert.ok(decision.blocked, `sos candidate block ${qId}`);
    }
    assert.ok(getSosQuestionStageSafeOverlay(qId), qId);
  }

  for (const scriptId of COACHING_SCRIPT_SURFACE_IDS) {
    assert.ok(getCoachingScriptStageSafeOverlay(scriptId), scriptId);
  }

  const okGate = evaluateStageSafeContent("OK", "candidate");
  assert.ok(!okGate.blocked, "OK clear for candidate");

  const reviewGate = evaluateStageSafeContent("NEEDS_REVIEW — verify before stage", "candidate");
  assert.ok(reviewGate.blocked, "NEEDS_REVIEW blocked for candidate");

  const staffReview = evaluateStageSafeContent("NEEDS_REVIEW — verify before stage", "staff");
  assert.ok(!staffReview.blocked, "staff sees NEEDS_REVIEW scripts");

  const progress = computePhase15P3Progress();
  assert.ok(progress.hubInCandidateNav, "candidate nav");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.filterWiredForCandidateProfile, "filter profile");

  const navLinks = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).length;
  assert.ok(navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav links ${navLinks}`);

  const exitBar = assertPhase15P3Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("stage-safe-filter-command"), "field book article");
  assert.ok(resolveCanonBinding(PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF), "canon hub");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p3-upgrade");
  assertRouteExists("/admin/intelligence/trap-lanes/2021-vs-2025-pivot");
  assertRouteExists("/admin/intelligence/sos-debate-questions/election-integrity-fraud");

  assert.ok(resolveStageSafeAudience("CANDIDATE") === "candidate", "candidate audience");
  assert.ok(resolveStageSafeAudience("STAFF") === "staff", "staff audience");

  console.log("test-phase15-p3-stage-safe-filter: OK");
  console.log(
    `  surfaces: ${progress.surfacesAtBar}/${progress.surfaceTotal} · gated: ${progress.candidateBlockedCount} · nav: ${navLinks} links · overall: ${progress.overallPct}%`,
  );
}

main();
