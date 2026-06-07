/**
 * Phase 16 P2 — encounter scenario checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P2Bar,
  computePhase16P2Progress,
  ENCOUNTERS_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P2Closure";
import {
  countAccaScenarioStepsAtBar,
  countEncounterScenariosAtBar,
  encounterScenarioMeetsPhase16P2Bar,
  encounterScenarioStepMeetsPhase16P2Bar,
  getEncounterScenarioOverlay,
  getEncounterScenarioStepOverlay,
} from "../src/lib/intelligence/v4/phase16P2EncounterScenariosDepth";
import {
  buildEncounterScenariosSummary,
  ENCOUNTER_SCENARIO_IDS,
  getEncounterScenario,
  getEncounterScenarioSteps,
  listEncounterScenarios,
  PHASE16_P2_SCENARIO_TOTAL,
  scenarioPrimaryBindMatches,
} from "../src/lib/intelligence/v4/phase16P2EncounterScenarios";
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
  const scenarios = listEncounterScenarios();
  assert.ok(scenarios.length === PHASE16_P2_SCENARIO_TOTAL, `scenarios ${scenarios.length}`);

  const scenarioBar = countEncounterScenariosAtBar();
  assert.ok(scenarioBar.atBar === scenarioBar.total, `scenario overlays ${scenarioBar.atBar}/${scenarioBar.total}`);

  for (const scenarioId of ENCOUNTER_SCENARIO_IDS) {
    const overlay = getEncounterScenarioOverlay(scenarioId);
    assert.ok(overlay && encounterScenarioMeetsPhase16P2Bar(overlay), scenarioId);
    assert.ok(scenarioPrimaryBindMatches(scenarioId), `${scenarioId} bind`);
    const scenario = getEncounterScenario(scenarioId)!;
    assert.ok(scenario.honestyRule.length > 0, `${scenarioId} honesty`);
    assert.ok(scenario.launchHref.startsWith("/admin/intelligence"), `${scenarioId} launch`);
  }

  const acca = getEncounterScenario("acca-panel")!;
  assert.ok(acca.primaryBindHref.includes("acca-summer-conference"), "acca bind href");

  const accaStepBar = countAccaScenarioStepsAtBar();
  assert.ok(accaStepBar.atBar === accaStepBar.total, `acca steps ${accaStepBar.atBar}/${accaStepBar.total}`);

  for (const step of getEncounterScenarioSteps("acca-panel")) {
    const overlay = getEncounterScenarioStepOverlay("acca-panel", step.stepId);
    assert.ok(overlay && encounterScenarioStepMeetsPhase16P2Bar(overlay), step.stepId);
    assert.ok(step.href.startsWith("/admin/intelligence"), step.stepId);
  }

  const purchase = getEncounterScenario("purchase-walkthrough")!;
  assert.ok(purchase.primaryBindHref.includes("demo-mode"), "purchase demo bind");

  const summary = buildEncounterScenariosSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === ENCOUNTERS_HUB_HREF, "hub href");
  assert.ok(summary.accaBindHref.includes("acca-summer-conference"), "summary acca bind");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.encounterScenarios?.tonightReminder, "home strip");
  assert.ok(feed.encounterScenarios.hubHref === ENCOUNTERS_HUB_HREF, "home hub href");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(candidateHrefs.includes(ENCOUNTERS_HUB_HREF), "rehearse nav hub");
  assert.ok(!candidateHrefs.includes("/admin/intelligence/demo-mode"), "demo-mode tucked under encounter");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P2Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.accaPrimaryBindWired, "acca bind");

  const exitBar = assertPhase16P2Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("encounter-scenarios-command"), "field book");
  assert.ok(resolveCanonBinding(ENCOUNTERS_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === ENCOUNTERS_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(ENCOUNTERS_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p2-upgrade");
  assertRouteExists(acca.primaryBindHref);

  console.log("test-phase16-p2-encounters: OK");
  console.log(
    `  scenarios: ${progress.scenariosAtBar}/${progress.scenarioTotal} · ACCA: ${progress.accaStepsAtBar}/${progress.accaStepTotal} steps · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
