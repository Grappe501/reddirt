/**
 * Phase 11 P2 — Movement philosophy + staff strategy command checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase11P2Bar,
  computePhase11P2Progress,
  listMovementPhilosophyDocSurfaces,
  MOVEMENT_PHILOSOPHY_HUB_HREF,
  STAFF_STRATEGY_COMMAND_HUB_HREF,
} from "../src/lib/intelligence/v4/phase11P2Closure";
import {
  getMovementPhilosophyDocOverlay,
  movementPhilosophyDocMeetsPhase11P2Bar,
} from "../src/lib/intelligence/v4/phase11P2MovementPhilosophyDepth";
import {
  getStaffStrategySurfaceOverlay,
  staffStrategySurfaceMeetsPhase11P2Bar,
} from "../src/lib/intelligence/v4/phase11P2StaffStrategyDepth";
import { listStaffStrategySurfaces } from "../src/lib/intelligence/v4/staffStrategyCommandInventory";
import { loadMovementPhilosophyMarkdown } from "../src/lib/philosophy/load-movement-philosophy-md";
import { computeDebateCommandPhilosophyReadiness } from "../src/lib/intelligence/v4/debateCommandPhilosophyReadiness";
import { listStrategyMigrationCoverage } from "../src/lib/intelligence/v4/strategyPhilosophyInventory";
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
  const hasPage = fs.existsSync(path.join(dir, "page.tsx"));
  const hasCatchAll = fs.readdirSync(dir, { withFileTypes: true }).some((d) => d.isDirectory() && d.name.startsWith("[["));
  assert.ok(hasPage || hasCatchAll, `Missing page: ${routePath}`);
}

async function main() {
  const progress = computePhase11P2Progress();
  assert.ok(progress.movementDocTotal >= 5, `docs ${progress.movementDocTotal}`);
  assert.ok(progress.movementDocsAtBar >= 5, `docs at bar ${progress.movementDocsAtBar}`);
  assert.ok(progress.staffSurfaceTotal >= 6, `staff ${progress.staffSurfaceTotal}`);
  assert.ok(progress.staffSurfacesAtBar >= 6, `staff at bar ${progress.staffSurfacesAtBar}`);

  const bar = assertPhase11P2Bar();
  assert.ok(bar.ok, bar.message);

  const docs = listMovementPhilosophyDocSurfaces();
  assert.ok(docs.length >= 5, "doc surfaces");
  for (const doc of docs) {
    const overlay = getMovementPhilosophyDocOverlay(doc.pathKey);
    assert.ok(movementPhilosophyDocMeetsPhase11P2Bar(overlay), doc.pathKey);
    assert.ok(doc.phase11P2Enriched, doc.pathKey);
  }

  for (const surface of listStaffStrategySurfaces()) {
    const overlay = getStaffStrategySurfaceOverlay(surface.id);
    assert.ok(staffStrategySurfaceMeetsPhase11P2Bar(overlay), surface.id);
  }

  assert.ok(getFieldBookArticle("movement-philosophy-command"), "movement field book");
  assert.ok(getFieldBookArticle("staff-strategy-command"), "staff field book");
  assert.ok(resolveCanonBinding(MOVEMENT_PHILOSOPHY_HUB_HREF), "movement canon");
  assert.ok(resolveCanonBinding(STAFF_STRATEGY_COMMAND_HUB_HREF), "staff canon");
  assert.ok(listStrategyMigrationRoutes().length >= 47, "migration routes");

  const coverage = listStrategyMigrationCoverage();
  assert.equal(coverage.unboundHrefs.length, 0, `unbound: ${coverage.unboundHrefs.join(", ")}`);

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  const philosophyFeed = computeDebateCommandPhilosophyReadiness();
  assert.ok(philosophyFeed.overallScore >= 90, `philosophy feed ${philosophyFeed.overallScore}`);

  assertRouteExists(MOVEMENT_PHILOSOPHY_HUB_HREF);
  assertRouteExists(STAFF_STRATEGY_COMMAND_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p2-upgrade");
  assertRouteExists("/admin/intelligence/movement-philosophy/core-principles");

  const core = await loadMovementPhilosophyMarkdown("core-principles");
  assert.equal(core.kind, "doc", "core-principles loads");

  console.log("test-phase11-p2-movement-philosophy-staff-strategy: OK");
  console.log(
    `  docs: ${progress.movementDocsAtBar}/${progress.movementDocTotal} · staff: ${progress.staffSurfacesAtBar}/${progress.staffSurfaceTotal} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
