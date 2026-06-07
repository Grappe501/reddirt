/**
 * Phase 11 (P0) — Campaign system manual surfacing checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase11CampaignSystemBarSync,
  computePhase11CampaignSystemProgressSync,
} from "../src/lib/intelligence/v4/phase11CampaignSystemClosure";
import { buildCampaignSystemManualInventory, listCampaignSystemCategoryGuides } from "../src/lib/intelligence/v4/campaignSystemManualInventory";
import { loadCampaignSystemMarkdown } from "../src/lib/campaign-strategy/load-campaign-system-md";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes, validateStrategyMigrationBridge } from "../src/lib/intelligence/v4/strategyMigrationBridge";
import { CAMPAIGN_SYSTEM_MANUAL_HUB_HREF } from "../src/lib/campaign-strategy/campaign-system-nav";

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
  const progress = computePhase11CampaignSystemProgressSync();
  assert.ok(progress.totalFiles >= 250, `files ${progress.totalFiles}`);
  assert.ok(progress.categoriesWithFiles >= 8, `categories ${progress.categoriesWithFiles}`);
  assert.ok(progress.categoryGuideCount >= 8, `guides ${progress.categoryGuideCount}`);

  const bar = assertPhase11CampaignSystemBarSync();
  assert.ok(bar.ok, bar.message);

  assert.ok(getFieldBookArticle("campaign-system-manual-command"), "field book");
  assert.ok(resolveCanonBinding(CAMPAIGN_SYSTEM_MANUAL_HUB_HREF), "canon");
  assert.ok(listStrategyMigrationRoutes().length >= 39, "migration routes");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(CAMPAIGN_SYSTEM_MANUAL_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-upgrade");

  const lifecycle = await loadCampaignSystemMarkdown("CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL");
  assert.equal(lifecycle.kind, "doc", "lifecycle manual loads");

  const inventory = await buildCampaignSystemManualInventory();
  assert.ok(inventory.surfaces.length >= 250, "inventory surfaces");
  assert.ok(listCampaignSystemCategoryGuides().length >= 8, "category guides");

  const libs = [
    "src/lib/intelligence/v4/campaignSystemManualInventory.ts",
    "src/lib/intelligence/v4/phase11CampaignSystemClosure.ts",
    "src/lib/campaign-strategy/load-campaign-system-md.ts",
    "src/lib/campaign-strategy/campaign-system-nav.ts",
  ];
  for (const f of libs) {
    assert.ok(fs.existsSync(path.join(process.cwd(), f)), f);
  }

  console.log("test-phase11-campaign-system-surfacing: OK");
  console.log(
    `  files: ${progress.totalFiles} · categories: ${progress.categoriesWithFiles} · guides: ${progress.categoryGuideCount} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
