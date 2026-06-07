/**
 * Phase 16 P7 — staff coach overlay checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P7Bar,
  computePhase16P7Progress,
  isRehearsalCoachApiWired,
  isRehearsalCoachRouteGuardWired,
  REHEARSAL_COACH_HUB_HREF,
} from "../src/lib/intelligence/v4/phase16P7Closure";
import {
  COACH_OVERLAY_FIELD_IDS,
  countCoachOverlayFieldsAtBar,
  coachOverlayFieldMeetsPhase16P7Bar,
  getCoachOverlayField,
} from "../src/lib/intelligence/v4/phase16P7StaffCoachDepth";
import {
  buildStaffCoachSummary,
  listStaffCoachPinOptions,
  PHASE16_P7_COACH_FIELD_TOTAL,
} from "../src/lib/intelligence/v4/phase16P7StaffCoach";
import {
  assignRehearsalCoachEncounter,
  clearRehearsalCoachState,
  loadRehearsalCoachState,
  pinRehearsalCoachDrill,
  PHASE16_P7_MAX_PINNED_DRILLS,
  rehearsalCoachStatePath,
  unpinRehearsalCoachDrill,
} from "../src/lib/intelligence/v4/phase16P7RehearsalCoachState";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "../src/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";
import { isStaffBackstageHref } from "../src/lib/intelligence/v4/staffBackstageRouteGuard";
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
  assert.ok(PHASE16_P7_COACH_FIELD_TOTAL === 5, "field total");
  assert.ok(PHASE16_P7_MAX_PINNED_DRILLS === 3, "max pins");
  assert.ok(isStaffBackstageHref(REHEARSAL_COACH_HUB_HREF), "route guard prefix");
  assert.ok(isRehearsalCoachRouteGuardWired(), "route guard wired");

  const fieldBar = countCoachOverlayFieldsAtBar();
  assert.ok(fieldBar.atBar === fieldBar.total, `field overlays ${fieldBar.atBar}/${fieldBar.total}`);

  for (const fieldId of COACH_OVERLAY_FIELD_IDS) {
    const field = getCoachOverlayField(fieldId);
    assert.ok(field && coachOverlayFieldMeetsPhase16P7Bar(field), fieldId);
  }

  assert.ok(isRehearsalCoachApiWired(), "coach api route");

  const pinOptions = listStaffCoachPinOptions();
  assert.ok(pinOptions.length >= 3, "pin options");

  const testRoot = path.join(process.cwd(), ".tmp-test-phase16-p7");
  fs.mkdirSync(testRoot, { recursive: true });
  const testStatePath = rehearsalCoachStatePath(testRoot);
  if (fs.existsSync(testStatePath)) fs.unlinkSync(testStatePath);

  assignRehearsalCoachEncounter("acca-panel", testRoot);
  assert.ok(loadRehearsalCoachState(testRoot)?.assignedEncounterId === "acca-panel", "assign scenario");

  const opt = pinOptions[0]!;
  pinRehearsalCoachDrill(
    {
      queueId: opt.queueId,
      cardNumber: opt.cardNumber,
      label: opt.label,
      href: opt.href,
    },
    testRoot,
  );
  assert.ok(loadRehearsalCoachState(testRoot)?.pinnedDrills.length === 1, "pin drill");

  const pinId = loadRehearsalCoachState(testRoot)!.pinnedDrills[0]!.pinId;
  unpinRehearsalCoachDrill(pinId, testRoot);
  assert.ok(loadRehearsalCoachState(testRoot)?.pinnedDrills.length === 0, "unpin drill");

  clearRehearsalCoachState(testRoot);
  assert.ok(loadRehearsalCoachState(testRoot)?.assignedEncounterId === null, "clear state");
  fs.rmSync(testRoot, { recursive: true, force: true });

  const summary = buildStaffCoachSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === REHEARSAL_COACH_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.staffCoach?.tonightReminder, "home strip");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(!candidateHrefs.includes(REHEARSAL_COACH_HUB_HREF), "not in candidate nav");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `candidate nav ${candidateHrefs.length}`);

  const staffHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("STAFF")).map((l) => l.href);
  assert.ok(staffHrefs.includes(REHEARSAL_COACH_HUB_HREF), "staff nav hub");

  const progress = computePhase16P7Progress();
  assert.ok(progress.hubInStaffNav, "staff nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.assignApiWired, "assign api");
  assert.ok(progress.routeGuardWired, "route guard");

  const exitBar = assertPhase16P7Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("rehearsal-coach-command"), "field book");
  assert.ok(resolveCanonBinding(REHEARSAL_COACH_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === REHEARSAL_COACH_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(REHEARSAL_COACH_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p7-upgrade");

  console.log("test-phase16-p7-staff-coach: OK");
  console.log(
    `  fields: ${progress.fieldsAtBar}/${progress.fieldTotal} · guard: STAFF · staff nav: wired · overall: ${progress.overallPct}%`,
  );
}

main();
