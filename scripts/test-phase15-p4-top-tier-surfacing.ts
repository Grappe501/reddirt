/**
 * Phase 15 P4 — Top-tier surfacing checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "../src/lib/intelligence/v4/candidateCommandHome";
import {
  assertPhase15P4Bar,
  computePhase15P4Progress,
  TOP_TIER_PREP_HUB_HREF,
} from "../src/lib/intelligence/v4/phase15P4Closure";
import {
  countTopTierPrepItemsAtBar,
  getTopTierPrepOverlay,
  topTierPrepItemMeetsPhase15P4Bar,
} from "../src/lib/intelligence/v4/phase15P4TopTierSurfacingDepth";
import {
  listTopTierPrepItems,
  listTopTierPrepTonight,
  PHASE15_P4_BRIEFING_TOTAL,
  PHASE15_P4_DEPTH_TOTAL,
  PHASE15_P4_PSYCH_TOTAL,
  PHASE15_P4_TOP_TIER_TONIGHT,
  topTierPrepItemsByKind,
} from "../src/lib/intelligence/v4/phase15P4TopTierSurfacing";
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
  const items = listTopTierPrepItems();
  assert.ok(items.length === 21, `items ${items.length}`);
  assert.ok(topTierPrepItemsByKind("briefing").length === PHASE15_P4_BRIEFING_TOTAL, "briefings");
  assert.ok(topTierPrepItemsByKind("depth").length === PHASE15_P4_DEPTH_TOTAL, "depth");
  assert.ok(topTierPrepItemsByKind("psychology").length === PHASE15_P4_PSYCH_TOTAL, "psych");

  const bar = countTopTierPrepItemsAtBar();
  assert.ok(bar.atBar === bar.total, `overlays ${bar.atBar}/${bar.total}`);
  assert.ok(items.every((i) => i.href.startsWith("/admin/intelligence")), "hrefs");

  for (const item of items) {
    const overlay = getTopTierPrepOverlay(item.id);
    assert.ok(overlay && topTierPrepItemMeetsPhase15P4Bar(overlay), item.id);
  }

  const tonight = listTopTierPrepTonight();
  assert.ok(tonight.length === PHASE15_P4_TOP_TIER_TONIGHT, `tonight ${tonight.length}`);

  const feed = buildCandidateCommandHomeFeed();
  assert.ok(feed.topTierTonight.length >= PHASE15_P4_TOP_TIER_TONIGHT, "home strip");
  assert.ok(feed.topTierHubHref === TOP_TIER_PREP_HUB_HREF, "home hub href");
  assert.ok(feed.topTierMinutesTotal > 0, "minutes");
  assert.ok(feed.todayFocus[0]?.includes("top-tier"), "today focus");

  const progress = computePhase15P4Progress();
  assert.ok(progress.hubInCandidateNav, "nav");
  assert.ok(progress.commandHomeWired, "command home");
  assert.ok(progress.fieldBookReady, "field book");
  assert.ok(progress.canonReady, "canon");
  assert.ok(progress.migrationRouteBound, "migration");

  const navLinks = flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).length;
  assert.ok(navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS, `nav ${navLinks}`);

  const exitBar = assertPhase15P4Bar();
  assert.ok(exitBar.ok, exitBar.message);

  assert.ok(getFieldBookArticle("top-tier-prep-command"), "field book");
  assert.ok(resolveCanonBinding(TOP_TIER_PREP_HUB_HREF), "canon");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === TOP_TIER_PREP_HUB_HREF),
    "migration hub",
  );

  assertRouteExists(TOP_TIER_PREP_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-15-p4-upgrade");
  assertRouteExists("/admin/intelligence/debate-briefings/agree-but-never-only-agree");
  assertRouteExists("/admin/intelligence/debate-depth/three-way");

  console.log("test-phase15-p4-top-tier-surfacing: OK");
  console.log(
    `  promoted: ${progress.itemsAtBar}/${progress.itemTotal} · home: ${feed.topTierTonight.length} · nav: ${navLinks} links · overall: ${progress.overallPct}%`,
  );
}

main();
