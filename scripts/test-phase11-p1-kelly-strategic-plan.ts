/**
 * Phase 11 P1 — Kelly SOS strategic plan command checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase11KellyStrategicPlanBar,
  computePhase11KellyStrategicPlanProgress,
  listKellyStrategicPlanChapterSurfaces,
  KELLY_STRATEGIC_PLAN_HUB_HREF,
} from "../src/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import {
  getKellyStrategicPlanChapterOverlay,
  kellyChapterMeetsPhase11P1Bar,
} from "../src/lib/intelligence/v4/phase11KellyStrategicPlanDepth";
import { loadStrategyMarkdown } from "../src/lib/campaign-strategy/load-strategy-md";
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
  const progress = computePhase11KellyStrategicPlanProgress();
  assert.ok(progress.chapterTotal >= 22, `chapters ${progress.chapterTotal}`);
  assert.ok(progress.chaptersAtBar >= 22, `at bar ${progress.chaptersAtBar}`);

  const bar = assertPhase11KellyStrategicPlanBar();
  assert.ok(bar.ok, bar.message);

  const chapters = listKellyStrategicPlanChapterSurfaces();
  assert.ok(chapters.length >= 22, "surfaces");
  for (const ch of chapters) {
    const overlay = getKellyStrategicPlanChapterOverlay(ch.pathKey);
    assert.ok(kellyChapterMeetsPhase11P1Bar(overlay), ch.pathKey);
    assert.ok(ch.phase11P1Enriched, ch.pathKey);
    assert.ok(ch.href.startsWith(KELLY_STRATEGIC_PLAN_HUB_HREF), ch.href);
  }

  assert.ok(getFieldBookArticle("kelly-strategic-plan-command"), "field book");
  assert.ok(resolveCanonBinding(KELLY_STRATEGIC_PLAN_HUB_HREF), "canon");
  assert.ok(listStrategyMigrationRoutes().length >= 41, "migration routes");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(KELLY_STRATEGIC_PLAN_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p1-upgrade");
  assertRouteExists("/admin/intelligence/kelly-strategic-plan/framework");

  const framework = await loadStrategyMarkdown("framework");
  assert.equal(framework.kind, "doc", "framework loads");

  console.log("test-phase11-p1-kelly-strategic-plan: OK");
  console.log(
    `  chapters: ${progress.chaptersAtBar}/${progress.chapterTotal} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
