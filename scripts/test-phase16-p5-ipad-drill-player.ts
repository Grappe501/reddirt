/**
 * Phase 16 P5 — iPad drill player checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase16P5Bar,
  computePhase16P5Progress,
  IPAD_DRILL_PLAYER_HREF,
  isIpadDrillPlayerShellWired,
} from "../src/lib/intelligence/v4/phase16P5Closure";
import {
  countIpadDrillPlayerControlsAtBar,
  getIpadDrillPlayerControlOverlay,
  ipadDrillPlayerControlMeetsPhase16P5Bar,
} from "../src/lib/intelligence/v4/phase16P5IpadDrillPlayerDepth";
import {
  buildIpadDrillPlayerHref,
  buildIpadDrillPlayerSummary,
  IPAD_DRILL_PLAYER_CONTROL_IDS,
  isIpadDrillPlayerRoute,
  PHASE16_P5_MAX_COLUMN_PX,
  PHASE16_P5_MIN_TOUCH_TARGET_PX,
  PHASE16_P5_PLAYER_CONTROL_TOTAL,
  resolveIpadDrillPlayerSession,
} from "../src/lib/intelligence/v4/phase16P5IpadDrillPlayer";
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
  assert.ok(PHASE16_P5_MIN_TOUCH_TARGET_PX >= 48, "touch target");
  assert.ok(PHASE16_P5_MAX_COLUMN_PX === 820, "column width");
  assert.ok(isIpadDrillPlayerRoute("/admin/intelligence/ipad-drill-player"), "route detect");
  assert.ok(isIpadDrillPlayerShellWired(), "shell wired");

  const controlBar = countIpadDrillPlayerControlsAtBar();
  assert.ok(controlBar.atBar === PHASE16_P5_PLAYER_CONTROL_TOTAL, `controls ${controlBar.atBar}`);

  for (const controlId of IPAD_DRILL_PLAYER_CONTROL_IDS) {
    const overlay = getIpadDrillPlayerControlOverlay(controlId);
    assert.ok(overlay && ipadDrillPlayerControlMeetsPhase16P5Bar(overlay), controlId);
  }

  const session = resolveIpadDrillPlayerSession("standard-tonight", "1");
  assert.ok(session && session.card, "session resolve");
  assert.ok(session.totalCards >= 6, "session cards");

  const launchHref = buildIpadDrillPlayerHref("standard-tonight", 1);
  assert.ok(launchHref.startsWith(IPAD_DRILL_PLAYER_HREF), "launch href");

  const summary = buildIpadDrillPlayerSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === IPAD_DRILL_PLAYER_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.ipadDrillPlayer?.tonightReminder, "home strip");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(candidateHrefs.includes(IPAD_DRILL_PLAYER_HREF), "rehearse nav hub");
  assert.ok(!candidateHrefs.includes("/admin/intelligence/run-of-show"), "run-of-show via launcher");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase16P5Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.shellDrillNavWired, "shell");

  const exitBar = assertPhase16P5Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("ipad-drill-player-command"), "field book");
  assert.ok(resolveCanonBinding(IPAD_DRILL_PLAYER_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === IPAD_DRILL_PLAYER_HREF),
    "migration hub",
  );

  assertRouteExists(IPAD_DRILL_PLAYER_HREF);
  assertRouteExists("/admin/intelligence/phase-16-p5-upgrade");

  console.log("test-phase16-p5-ipad-drill-player: OK");
  console.log(
    `  controls: ${progress.controlsAtBar}/${progress.controlTotal} · shell: wired · nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
