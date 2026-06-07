/**
 * Phase 16 P4 — session debrief checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P4Bar,
  computePhase16P4Progress,
  isSessionDebriefCaptureApiWired,
  SESSION_DEBRIEF_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P4Closure";
import {
  countPreStageChecklistAtBar,
  getPreStageChecklistOverlay,
  preStageChecklistMeetsPhase16P4Bar,
} from "../src/lib/intelligence/v4/phase16P4SessionDebriefDepth";
import {
  buildPreStageChecklist,
  buildSessionDebriefSummary,
  HUMAN_ACTION_QUEUE_HREF,
  PHASE16_P4_PRE_CHECKLIST_TOTAL,
  PRE_STAGE_CHECKLIST_IDS,
} from "../src/lib/intelligence/v4/phase16P4SessionDebrief";
import {
  appendSessionDebriefCapture,
  confirmPreStageChecklist,
  loadSessionDebriefState,
  sessionDebriefStatePath,
} from "../src/lib/intelligence/v4/phase16P4SessionDebriefState";
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
  const checklist = buildPreStageChecklist();
  assert.ok(checklist.length === PHASE16_P4_PRE_CHECKLIST_TOTAL, `checklist ${checklist.length}`);

  const checklistBar = countPreStageChecklistAtBar();
  assert.ok(checklistBar.atBar === checklistBar.total, `checklist overlays ${checklistBar.atBar}/${checklistBar.total}`);

  for (const itemId of PRE_STAGE_CHECKLIST_IDS) {
    const overlay = getPreStageChecklistOverlay(itemId);
    assert.ok(overlay && preStageChecklistMeetsPhase16P4Bar(overlay), itemId);
    const item = checklist.find((i) => i.itemId === itemId)!;
    assert.ok(item.href.startsWith("/admin/intelligence"), itemId);
    assert.ok(item.kellyBeat.length > 0, `${itemId} beat`);
  }

  assert.ok(isSessionDebriefCaptureApiWired(), "capture api route");

  const testRoot = path.join(process.cwd(), ".tmp-test-phase16-p4");
  fs.mkdirSync(testRoot, { recursive: true });
  const testStatePath = sessionDebriefStatePath(testRoot);
  if (fs.existsSync(testStatePath)) fs.unlinkSync(testStatePath);

  confirmPreStageChecklist(PRE_STAGE_CHECKLIST_IDS, testRoot);
  assert.ok(loadSessionDebriefState(testRoot)?.preChecklistConfirmedIds.length === 5, "checklist save");

  const capture = appendSessionDebriefCapture(
    {
      feltRisky: ["Test risky line"],
      staffFollowUps: ["Verify test claim"],
      encounterHint: "test-encounter",
    },
    testRoot,
  );
  assert.ok(capture.captureId, "capture id");
  assert.ok(loadSessionDebriefState(testRoot)?.captures.length === 1, "capture save");
  fs.rmSync(testRoot, { recursive: true, force: true });

  const summary = buildSessionDebriefSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === SESSION_DEBRIEF_HUB_HREF, "hub href");
  assert.ok(summary.actionQueueHref === HUMAN_ACTION_QUEUE_HREF, "action queue href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.sessionDebrief?.tonightReminder, "home strip");
  assert.ok(feed.sessionDebrief.hubHref === SESSION_DEBRIEF_HUB_HREF, "home hub href");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(candidateHrefs.includes(SESSION_DEBRIEF_HUB_HREF), "rehearse nav hub");
  assert.ok(!candidateHrefs.includes("/admin/intelligence/kim-hammer/debate-prep"), "debate prep via encounters");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P4Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.captureApiWired, "capture api");

  const exitBar = assertPhase16P4Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("session-debrief-command"), "field book");
  assert.ok(resolveCanonBinding(SESSION_DEBRIEF_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === SESSION_DEBRIEF_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(SESSION_DEBRIEF_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p4-upgrade");

  console.log("test-phase16-p4-session-debrief: OK");
  console.log(
    `  checklist: ${progress.checklistAtBar}/${progress.checklistTotal} · capture api · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
