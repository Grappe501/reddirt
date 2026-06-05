/**
 * Phase 4 — Field Book canon loop + strategy migration checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase4CanonLoopBar,
  computePhase4CanonLoopProgress,
} from "../src/lib/intelligence/v4/phase4CanonLoop";
import { FIELD_BOOK_CANON_BINDINGS } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import {
  listStrategyMigrationRoutes,
  validateStrategyMigrationBridge,
} from "../src/lib/intelligence/v4/strategyMigrationBridge";

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

const progress = computePhase4CanonLoopProgress();
assert.ok(progress.bindingCount >= 18, `Bindings ${progress.bindingCount} (need 18+)`);
assert.ok(progress.bindingsAtBar >= progress.bindingCount, "All bindings at bar");
assert.ok(progress.phaseDArticlesAtBar >= progress.phaseDArticleTotal, "Phase D articles at bar");
assert.ok(progress.strategyCoveragePct >= 100, `Strategy bridge ${progress.strategyCoveragePct}%`);

const bar = assertPhase4CanonLoopBar();
assert.ok(bar.ok, bar.message);

const validation = validateStrategyMigrationBridge();
assert.ok(validation.ok, validation.errors.join("; "));

for (const binding of FIELD_BOOK_CANON_BINDINGS) {
  for (const slug of binding.fieldBookSlugs) {
    assert.ok(getFieldBookArticle(slug), `Binding ${binding.routePrefix} missing article ${slug}`);
  }
}

assert.ok(listStrategyMigrationRoutes().length >= 16, "16+ strategy migration routes");

assertRouteExists("/admin/intelligence/phase-4-upgrade");
assertRouteExists("/admin/intelligence/field-book/canon");
assertRouteExists("/admin/intelligence/strategy-alignment");

const canonPanel = fs.readFileSync(
  path.join(process.cwd(), "src/components/admin/intelligence/FieldBookCanonPanel.tsx"),
  "utf8",
);
assert.ok(canonPanel.includes("getStrategyMigrationForHref"), "Canon panel strategy bridge");

console.log("test-phase4-canon-loop: OK");
console.log(
  `  bindings: ${progress.bindingsAtBar}/${progress.bindingCount} · Phase D: ${progress.phaseDArticlesAtBar}/${progress.phaseDArticleTotal} · strategy: ${progress.strategyCoveragePct}% · overall: ${progress.overallPct}%`,
);
