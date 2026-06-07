/**
 * Phase 15 P5 — Evidence honesty badges checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase15P5Bar,
  computePhase15P5Progress,
  EVIDENCE_HONESTY_HUB_HREF,
} from "../src/lib/intelligence/v4/phase15P5Closure";
import {
  countEvidenceHonestySurfacesAtBar,
  evidenceHonestySurfaceMeetsPhase15P5Bar,
  getEvidenceHonestySurfaceOverlay,
} from "../src/lib/intelligence/v4/phase15P5EvidenceHonestyDepth";
import {
  buildEvidenceHonestySummary,
  listEvidenceHonestySurfaces,
  PHASE15_P5_FILM_DRILL_BAR,
  PHASE15_P5_SURFACE_CATEGORY_TOTAL,
} from "../src/lib/intelligence/v4/phase15P5EvidenceHonesty";
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
  const surfaces = listEvidenceHonestySurfaces();
  assert.ok(surfaces.length === PHASE15_P5_SURFACE_CATEGORY_TOTAL, `surfaces ${surfaces.length}`);
  assert.ok(surfaces.every((s) => s.href.startsWith("/admin/intelligence")), "hrefs");

  const bar = countEvidenceHonestySurfacesAtBar();
  assert.ok(bar.atBar === bar.total, `overlays ${bar.atBar}/${bar.total}`);

  for (const surface of surfaces) {
    const overlay = getEvidenceHonestySurfaceOverlay(surface.surfaceId);
    assert.ok(overlay && evidenceHonestySurfaceMeetsPhase15P5Bar(overlay), surface.surfaceId);
  }

  const progress = computePhase15P5Progress();
  assert.ok(progress.filmDrillBadges >= PHASE15_P5_FILM_DRILL_BAR, `film drill bar ${progress.filmDrillBadges}`);
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");

  const summary = buildEvidenceHonestySummary();
  assert.ok(summary.nonStageSafeCount > 0, "non-stage-safe count");
  assert.ok(summary.tonightReminder.length > 0, "tonight reminder");

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.evidenceHonesty?.tonightReminder, "home strip");
  assert.ok(feed.evidenceHonesty.hubHref === EVIDENCE_HONESTY_HUB_HREF, "home hub href");

  const navLinks = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).length;
  assert.ok(navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${navLinks}`);

  const exitBar = assertPhase15P5Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("evidence-honesty-command"), "field book");
  assert.ok(resolveCanonBinding(EVIDENCE_HONESTY_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === EVIDENCE_HONESTY_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(EVIDENCE_HONESTY_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p5-upgrade");
  assertRouteExists("/admin/intelligence/film-room");
  assertRouteExists("/admin/intelligence/briefing-papers");
  assertRouteExists("/admin/intelligence/opposition-strategy");

  console.log("test-phase15-p5-evidence-honesty: OK");
  console.log(
    `  surfaces: ${progress.surfacesAtBar}/${progress.surfaceCategoryTotal} · drills: ${progress.filmDrillBadges} · nav: ${navLinks} links · overall: ${progress.overallPct}%`,
  );
}

main();
