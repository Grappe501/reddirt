/**
 * Phase 15 P6 — Demo mode checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase15P6Bar,
  computePhase15P6Progress,
  DEMO_MODE_HUB_HREF,
} from "../src/lib/intelligence/v4/phase15P6Closure";
import {
  countDemoScriptStepsAtBar,
  demoScriptStepMeetsPhase15P6Bar,
  getDemoScriptStepOverlay,
} from "../src/lib/intelligence/v4/phase15P6DemoModeDepth";
import {
  buildDemoModeSummary,
  countDemoScriptMinutes,
  getDemoTonightScenario,
  listDemoScriptSteps,
  PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL,
  PHASE15_P6_TARGET_MINUTES,
} from "../src/lib/intelligence/v4/phase15P6DemoMode";
import { DEMO_MODE_DEPLOY_HINT } from "../src/lib/intelligence/v4/intelligenceDemoMode";
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
  const steps = listDemoScriptSteps();
  assert.ok(steps.length === PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL, `steps ${steps.length}`);
  assert.ok(steps.every((s) => s.href.startsWith("/admin/intelligence")), "hrefs");

  const minutes = countDemoScriptMinutes();
  assert.ok(minutes >= PHASE15_P6_TARGET_MINUTES - 1 && minutes <= PHASE15_P6_TARGET_MINUTES + 1, `minutes ${minutes}`);

  const bar = countDemoScriptStepsAtBar();
  assert.ok(bar.atBar === bar.total, `overlays ${bar.atBar}/${bar.total}`);

  for (const step of steps) {
    const overlay = getDemoScriptStepOverlay(step.stepId);
    assert.ok(overlay && demoScriptStepMeetsPhase15P6Bar(overlay), step.stepId);
  }

  const scenario = getDemoTonightScenario();
  assert.ok(scenario.pitchLine.length > 0, "scenario pitch");
  assert.ok(scenario.closeLine.length > 0, "scenario close");

  const summary = buildDemoModeSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === DEMO_MODE_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.demoMode?.tonightReminder, "home strip");
  assert.ok(feed.demoMode.hubHref === DEMO_MODE_HUB_HREF, "home hub href");

  const progress = computePhase15P6Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.demoEnvDocumented, "env documented");
  assert.ok(DEMO_MODE_DEPLOY_HINT.includes("NEXT_PUBLIC_INTELLIGENCE_DEMO_MODE"), "deploy hint");

  const navLinks = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).length;
  assert.ok(navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${navLinks}`);

  const exitBar = assertPhase15P6Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("demo-mode-command"), "field book");
  assert.ok(resolveCanonBinding(DEMO_MODE_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === DEMO_MODE_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(DEMO_MODE_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p6-upgrade");
  assertRouteExists("/admin/intelligence/trap-lanes/county-champion");
  assertRouteExists("/admin/intelligence/debate-briefings/agree-but-never-only-agree");
  assertRouteExists("/admin/intelligence/county-clerk-week/acca-summer-conference");

  console.log("test-phase15-p6-demo-mode: OK");
  console.log(
    `  script: ${progress.stepsAtBar}/${progress.stepTotal} · ${progress.scriptMinutes} min · nav: ${navLinks} links · overall: ${progress.overallPct}%`,
  );
}

main();
