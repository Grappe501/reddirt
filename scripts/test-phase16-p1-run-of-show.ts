/**
 * Phase 16 P1 — timed run-of-show checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P1Bar,
  computePhase16P1Progress,
  RUN_OF_SHOW_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P1Closure";
import {
  countRunOfShowPresetsAtBar,
  countStandardPresetStepsAtBar,
  getRunOfShowPresetOverlay,
  getRunOfShowPresetStepOverlay,
  runOfShowPresetMeetsPhase16P1Bar,
  runOfShowPresetStepMeetsPhase16P1Bar,
} from "../src/lib/intelligence/v4/phase16P1RunOfShowDepth";
import {
  buildRunOfShowSummary,
  countPresetMinutes,
  getRunOfShowStepsForPreset,
  listRunOfShowPresets,
  PHASE16_P1_PRESET_MINUTES,
  PHASE16_P1_PRESET_TOTAL,
  presetMinutesMatchTarget,
  RUN_OF_SHOW_PRESET_IDS,
} from "../src/lib/intelligence/v4/phase16P1RunOfShow";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "../src/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { rehearsalRouteWired } from "../src/lib/intelligence/v4/rehearsalRouteWiring";
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
  const presets = listRunOfShowPresets();
  assert.ok(presets.length === PHASE16_P1_PRESET_TOTAL, `presets ${presets.length}`);

  const presetBar = countRunOfShowPresetsAtBar();
  assert.ok(presetBar.atBar === presetBar.total, `preset overlays ${presetBar.atBar}/${presetBar.total}`);

  for (const presetId of RUN_OF_SHOW_PRESET_IDS) {
    const overlay = getRunOfShowPresetOverlay(presetId);
    assert.ok(overlay && runOfShowPresetMeetsPhase16P1Bar(overlay), presetId);
    assert.ok(presetMinutesMatchTarget(presetId), `${presetId} minutes`);
    const steps = getRunOfShowStepsForPreset(presetId);
    assert.ok(steps.every((s) => rehearsalRouteWired(s.href)), `${presetId} hrefs`);
  }

  for (const presetId of RUN_OF_SHOW_PRESET_IDS) {
    const actual = countPresetMinutes(getRunOfShowStepsForPreset(presetId));
    assert.ok(presetMinutesMatchTarget(presetId), `${presetId} minutes (${actual})`);
  }

  const stepBar = countStandardPresetStepsAtBar();
  assert.ok(stepBar.atBar === stepBar.total, `standard steps ${stepBar.atBar}/${stepBar.total}`);

  for (const step of getRunOfShowStepsForPreset("standard-30")) {
    const overlay = getRunOfShowPresetStepOverlay("standard-30", step.stepId);
    assert.ok(overlay && runOfShowPresetStepMeetsPhase16P1Bar(overlay), step.stepId);
  }

  const summary = buildRunOfShowSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === RUN_OF_SHOW_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.runOfShow?.tonightReminder, "home strip");
  assert.ok(feed.runOfShow.hubHref === RUN_OF_SHOW_HUB_HREF, "home hub href");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(!candidateHrefs.includes(RUN_OF_SHOW_HUB_HREF), "run-of-show via session launcher");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P1Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.allPresetsMinutesAligned, "minutes aligned");

  const exitBar = assertPhase16P1Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("run-of-show-command"), "field book");
  assert.ok(resolveCanonBinding(RUN_OF_SHOW_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === RUN_OF_SHOW_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(RUN_OF_SHOW_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p1-upgrade");

  console.log("test-phase16-p1-run-of-show: OK");
  console.log(
    `  presets: ${progress.presetsAtBar}/${progress.presetTotal} · standard: ${progress.standardStepsAtBar}/${progress.standardStepTotal} steps · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
