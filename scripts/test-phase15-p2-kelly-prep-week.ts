/**
 * Phase 15 P2 — Kelly prep week checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildKellyPrepWeekState,
  listKellyPrepWeekDaySurfacesFromPath,
} from "../src/lib/intelligence/v4/kellyPrepWeekInventory";
import {
  assertPhase15P2Bar,
  computePhase15P2Progress,
  KELLY_PREP_WEEK_HUB_HREF,
  listKellyPrepWeekDaySurfaces,
} from "../src/lib/intelligence/v4/phase15P2Closure";
import {
  countKellyPrepWeekDaysAtBar,
  getKellyPrepWeekDayOverlay,
  kellyPrepWeekDayMeetsPhase15P2Bar,
  PHASE15_P2_MIN_READS_PER_DAY,
  PHASE15_P2_MIN_TOTAL_READS,
} from "../src/lib/intelligence/v4/phase15P2KellyPrepWeekDepth";
import {
  countKellyPrepWeekReads,
  KELLY_PREP_WEEK_DAY_IDS,
  listKellyPrepWeekReadHrefs,
} from "../src/lib/intelligence/v4/kellyPrepWeekPath";
import { saveKellyPrepWeekState } from "../src/lib/intelligence/v4/kellyPrepWeekState";
import { countCandidateCommandNavLinks, buildCandidateCommandNavSections } from "../src/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";
import { computeCanonLoopStats } from "../src/lib/intelligence/fieldBookCanonRegistry";
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
  const state = buildKellyPrepWeekState();
  saveKellyPrepWeekState(state, REPO_ROOT);

  assert.ok(state.dayTotal === 7, "day total");
  assert.ok(state.daysComplete >= 7, `days complete ${state.daysComplete}`);

  const surfaces = listKellyPrepWeekDaySurfacesFromPath();
  assert.ok(surfaces.length === 7, "surfaces");
  assert.ok(surfaces.every((d) => d.phase15P2Enriched), "all days enriched");

  for (const dayId of KELLY_PREP_WEEK_DAY_IDS) {
    const overlay = getKellyPrepWeekDayOverlay(dayId);
    assert.ok(kellyPrepWeekDayMeetsPhase15P2Bar(overlay), dayId);
  }

  const dayBar = countKellyPrepWeekDaysAtBar();
  assert.ok(dayBar.atBar === 7, `days at bar ${dayBar.atBar}`);

  const totalReads = countKellyPrepWeekReads();
  assert.ok(totalReads >= PHASE15_P2_MIN_TOTAL_READS, `reads ${totalReads}`);
  assert.ok(surfaces.every((d) => d.readCount >= PHASE15_P2_MIN_READS_PER_DAY), "reads per day");

  const readHrefs = listKellyPrepWeekReadHrefs();
  assert.ok(readHrefs.length >= 10, `unique hrefs ${readHrefs.length}`);

  const progress = computePhase15P2Progress();
  assert.ok(progress.hubInCandidateNav, "candidate nav");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");

  const navLinks = countCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE"));
  assert.ok(navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav links ${navLinks}`);

  const bar = assertPhase15P2Bar();
  assert.ok(bar.ok, bar.message);

  const canon = computeCanonLoopStats();
  assert.ok(canon.bindingCount >= 20, `canon ${canon.bindingCount}`);

  assert.ok(getFieldBookArticle("kelly-prep-week-command"), "field book article");
  assert.ok(resolveCanonBinding(KELLY_PREP_WEEK_HUB_HREF), "canon hub");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(KELLY_PREP_WEEK_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p2-upgrade");
  assertRouteExists("/admin/intelligence/kelly-prep-week/day-1-philosophy");
  assertRouteExists("/admin/intelligence/kelly-prep-week/day-6-simulation");

  assert.ok(listKellyPrepWeekDaySurfaces().length === 7, "closure surfaces");

  console.log("test-phase15-p2-kelly-prep-week: OK");
  console.log(
    `  days: ${progress.daysAtBar}/${progress.dayTotal} · reads: ${progress.totalReads} · nav: ${navLinks} links · overall: ${progress.overallPct}%`,
  );
}

main();
