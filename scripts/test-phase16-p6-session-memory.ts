/**
 * Phase 16 P6 — session memory checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P6Bar,
  computePhase16P6Progress,
  isRehearsalSessionClearApiWired,
  REHEARSAL_HISTORY_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P6Closure";
import {
  ACTIVE_SESSION_FIELD_IDS,
  countActiveSessionFieldsAtBar,
  activeSessionFieldMeetsPhase16P6Bar,
  getActiveSessionFieldOverlay,
} from "../src/lib/intelligence/v4/phase16P6SessionMemoryDepth";
import {
  buildSessionMemorySummary,
  PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL,
  recordDrillQueueProgress,
  recordEncounterProgress,
} from "../src/lib/intelligence/v4/phase16P6SessionMemory";
import {
  clearRehearsalSessionMemory,
  getRehearsalActiveSession,
  loadRehearsalSessionState,
  PHASE16_P6_HISTORY_MAX,
  rehearsalSessionStatePath,
} from "../src/lib/intelligence/v4/phase16P6SessionMemoryState";
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
  assert.ok(PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL === 5, "field total");

  const fieldBar = countActiveSessionFieldsAtBar();
  assert.ok(fieldBar.atBar === fieldBar.total, `field overlays ${fieldBar.atBar}/${fieldBar.total}`);

  for (const fieldId of ACTIVE_SESSION_FIELD_IDS) {
    const overlay = getActiveSessionFieldOverlay(fieldId);
    assert.ok(overlay && activeSessionFieldMeetsPhase16P6Bar(overlay), fieldId);
  }

  assert.ok(isRehearsalSessionClearApiWired(), "clear api route");

  const testRoot = path.join(process.cwd(), ".tmp-test-phase16-p6");
  fs.mkdirSync(testRoot, { recursive: true });
  const testStatePath = rehearsalSessionStatePath(testRoot);
  if (fs.existsSync(testStatePath)) fs.unlinkSync(testStatePath);

  const drillActive = recordDrillQueueProgress("standard-tonight", 3, "drill-queue", testRoot);
  assert.ok(drillActive.cardNumber === 3, "drill card");
  assert.ok(drillActive.continueHref.includes("drill-queue"), "drill href");
  assert.ok(getRehearsalActiveSession(testRoot)?.label, "drill active");

  const ipadActive = recordDrillQueueProgress("standard-tonight", 2, "ipad-drill", testRoot);
  assert.ok(ipadActive.sessionKind === "ipad-drill", "ipad kind");
  assert.ok(ipadActive.continueHref.includes("ipad-drill-player"), "ipad href");

  const encounterActive = recordEncounterProgress("acca-panel", 1, testRoot);
  assert.ok(encounterActive.sessionKind === "encounter", "encounter kind");
  assert.ok(encounterActive.continueHref.includes("encounters"), "encounter href");

  const state = loadRehearsalSessionState(testRoot);
  assert.ok(state && state.history.length >= 1, "history append");
  assert.ok(state!.history.length <= PHASE16_P6_HISTORY_MAX, "history cap");

  clearRehearsalSessionMemory(testRoot);
  assert.ok(loadRehearsalSessionState(testRoot)?.active === null, "clear active");
  assert.ok(loadRehearsalSessionState(testRoot)?.history.length === 0, "clear history");
  fs.rmSync(testRoot, { recursive: true, force: true });

  const summary = buildSessionMemorySummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === REHEARSAL_HISTORY_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.sessionMemory?.tonightReminder, "home strip");
  assert.ok(feed.sessionMemory.hubHref === REHEARSAL_HISTORY_HUB_HREF, "home hub href");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(candidateHrefs.includes(REHEARSAL_HISTORY_HUB_HREF), "home nav hub");
  assert.ok(candidateHrefs.includes("/admin/intelligence/ipad-drill-player"), "rehearse ipad still present");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P6Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.clearApiWired, "clear api");

  const exitBar = assertPhase16P6Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("session-memory-command"), "field book");
  assert.ok(resolveCanonBinding(REHEARSAL_HISTORY_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === REHEARSAL_HISTORY_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(REHEARSAL_HISTORY_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p6-upgrade");

  console.log("test-phase16-p6-session-memory: OK");
  console.log(
    `  fields: ${progress.fieldsAtBar}/${progress.fieldTotal} · clear api: wired · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
