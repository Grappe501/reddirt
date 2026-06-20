/**
 * Phase 16 P0 — session launcher checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P0Bar,
  computePhase16P0Progress,
  REHEARSAL_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P0Closure";
import {
  countDefaultRunOfShowStepsAtBar,
  countRehearsalEncountersAtBar,
  getRehearsalEncounterOverlay,
  getRunOfShowStepOverlay,
  rehearsalEncounterMeetsPhase16P0Bar,
  runOfShowStepMeetsPhase16P0Bar,
} from "../src/lib/intelligence/v4/phase16P0SessionLauncherDepth";
import {
  buildRehearsalLauncherSummary,
  buildRehearsalSession,
  buildTonightRehearsalOptions,
  countRunOfShowMinutes,
  getDefaultRunOfShowSteps,
  listRehearsalEncounterOptions,
  PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES,
  PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL,
  PHASE16_P0_ENCOUNTER_TOTAL,
} from "../src/lib/intelligence/v4/phase16P0SessionLauncher";
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
  const encounters = listRehearsalEncounterOptions();
  assert.ok(encounters.length === PHASE16_P0_ENCOUNTER_TOTAL, `encounters ${encounters.length}`);

  const encounterBar = countRehearsalEncountersAtBar();
  assert.ok(encounterBar.atBar === encounterBar.total, `encounter overlays ${encounterBar.atBar}/${encounterBar.total}`);

  for (const encounter of encounters) {
    const overlay = getRehearsalEncounterOverlay(encounter.encounterId);
    assert.ok(overlay && rehearsalEncounterMeetsPhase16P0Bar(overlay), encounter.encounterId);
    assert.ok(encounter.launchHref.startsWith("/admin/intelligence"), encounter.encounterId);
  }

  const debateSteps = getDefaultRunOfShowSteps("debate-prep");
  const defaultSession = buildRehearsalSession("debate-prep");
  const expectedMinutes = countRunOfShowMinutes(debateSteps);
  assert.ok(defaultSession.steps.length === debateSteps.length, `steps ${defaultSession.steps.length}`);
  assert.ok(
    debateSteps.length >= PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL,
    `steps ${debateSteps.length}`,
  );
  assert.ok(
    defaultSession.durationMinutes >= expectedMinutes - 1 &&
      defaultSession.durationMinutes <= expectedMinutes + 1,
    `minutes ${defaultSession.durationMinutes} vs ${expectedMinutes}`,
  );
  assert.ok(
    expectedMinutes >= PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES - 2,
    `minutes ${expectedMinutes}`,
  );

  const stepBar = countDefaultRunOfShowStepsAtBar();
  assert.ok(stepBar.atBar === stepBar.total, `step overlays ${stepBar.atBar}/${stepBar.total}`);

  for (const step of defaultSession.steps) {
    const overlay = getRunOfShowStepOverlay(step.stepId);
    assert.ok(overlay && runOfShowStepMeetsPhase16P0Bar(overlay), step.stepId);
    assert.ok(rehearsalRouteWired(step.href), step.stepId);
  }

  const options = buildTonightRehearsalOptions();
  assert.ok(options.length === PHASE16_P0_ENCOUNTER_TOTAL, "tonight options");

  const summary = buildRehearsalLauncherSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === REHEARSAL_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.rehearsalLauncher?.tonightReminder, "home strip");
  assert.ok(feed.rehearsalLauncher.hubHref === REHEARSAL_HUB_HREF, "home hub href");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(candidateHrefs.includes(REHEARSAL_HUB_HREF), "rehearse nav hub");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P0Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");

  const exitBar = assertPhase16P0Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("session-launcher-command"), "field book");
  assert.ok(resolveCanonBinding(REHEARSAL_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === REHEARSAL_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(REHEARSAL_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p0-upgrade");

  console.log("test-phase16-p0-session-launcher: OK");
  console.log(
    `  encounters: ${progress.encountersAtBar}/${progress.encounterTotal} · run-of-show: ${progress.runOfShowStepsAtBar}/${progress.runOfShowStepTotal} · ${progress.defaultSessionMinutes} min · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
