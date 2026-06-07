/**
 * Phase 15 P8 — staff backstage route guards checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase15P8Bar,
  computePhase15P8Progress,
  STAFF_BACKSTAGE_HUB_HREF,
} from "../src/lib/intelligence/v4/phase15P8Closure";
import {
  countStaffBackstageGuardsAtBar,
  getStaffBackstageGuardOverlay,
  staffBackstageGuardMeetsPhase15P8Bar,
} from "../src/lib/intelligence/v4/phase15P8StaffBackstageDepth";
import {
  buildStaffBackstageSummary,
  listStaffBackstageGuardSurfaces,
  PHASE15_P8_GUARD_CATEGORY_TOTAL,
} from "../src/lib/intelligence/v4/phase15P8StaffBackstage";
import {
  isStaffBackstageHref,
  profileMayAccessStaffBackstage,
  resolveStaffBackstageRedirect,
} from "../src/lib/intelligence/v4/staffBackstageRouteGuard";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "../src/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "../src/lib/intelligence/v4/phase15CandidateCommandDepth";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes, validateStrategyMigrationBridge } from "../src/lib/intelligence/v4/strategyMigrationBridge";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");
const LAYOUT_PATH = path.join(process.cwd(), "src/app/admin/(board)/intelligence/layout.tsx");

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
  const surfaces = listStaffBackstageGuardSurfaces();
  assert.ok(surfaces.length === PHASE15_P8_GUARD_CATEGORY_TOTAL, `surfaces ${surfaces.length}`);

  const bar = countStaffBackstageGuardsAtBar();
  assert.ok(bar.atBar === bar.total, `overlays ${bar.atBar}/${bar.total}`);

  for (const surface of surfaces) {
    const overlay = getStaffBackstageGuardOverlay(surface.surfaceId);
    assert.ok(overlay && staffBackstageGuardMeetsPhase15P8Bar(overlay), surface.surfaceId);
  }

  assert.ok(!profileMayAccessStaffBackstage("CANDIDATE"), "candidate blocked");
  assert.ok(!profileMayAccessStaffBackstage("CLERK_WEEK"), "clerk blocked");
  assert.ok(profileMayAccessStaffBackstage("STAFF"), "staff allowed");

  assert.ok(isStaffBackstageHref("/admin/intelligence/build-progress"), "build progress guarded");
  assert.ok(isStaffBackstageHref("/admin/intelligence/supreme-workbench"), "workbench guarded");
  assert.ok(!isStaffBackstageHref(STAFF_BACKSTAGE_HUB_HREF), "hub public meta");
  assert.ok(!isStaffBackstageHref("/admin/intelligence"), "command home open");

  const redirect = resolveStaffBackstageRedirect("/admin/intelligence/build-progress", "CANDIDATE");
  assert.ok(redirect?.includes("staff-backstage-blocked"), "redirect query");
  assert.equal(resolveStaffBackstageRedirect("/admin/intelligence/build-progress", "STAFF"), null, "staff no redirect");

  const layoutSrc = fs.readFileSync(LAYOUT_PATH, "utf8");
  assert.ok(layoutSrc.includes("StaffBackstageRouteGuard"), "layout guard wired");

  const summary = buildStaffBackstageSummary();
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");
  assert.ok(summary.hubHref === STAFF_BACKSTAGE_HUB_HREF, "hub href");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.staffBackstage?.tonightReminder, "home strip");
  assert.ok(feed.staffBackstage.hubHref === STAFF_BACKSTAGE_HUB_HREF, "home hub href");

  const staffHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("STAFF")).map((l) => l.href),
  );
  assert.ok(staffHrefs.has(STAFF_BACKSTAGE_HUB_HREF), "staff nav hub");

  const candidateHrefs = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map(
    (l) => l.href,
  );
  assert.ok(!candidateHrefs.includes(STAFF_BACKSTAGE_HUB_HREF), "candidate nav excludes hub");
  assert.ok(candidateHrefs.length <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${candidateHrefs.length}`);

  const progress = computePhase15P8Progress();
  assert.ok(progress.hubInStaffNav, "staff nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.layoutGuardWired, "layout guard");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");
  assert.ok(progress.candidateBlockedFromBuilder, "candidate block");

  const exitBar = assertPhase15P8Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("staff-backstage-command"), "field book");
  assert.ok(resolveCanonBinding(STAFF_BACKSTAGE_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === STAFF_BACKSTAGE_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(STAFF_BACKSTAGE_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p8-upgrade");

  console.log("test-phase15-p8-staff-backstage: OK");
  console.log(
    `  guards: ${progress.guardsAtBar}/${progress.guardCategoryTotal} · prefixes: ${progress.prefixGuardCount} · candidate nav: ${candidateHrefs.length} links · overall: ${progress.overallPct}%`,
  );
}

main();
