/**
 * Phase 11 P7 — Briefing papers chunk attach checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildBriefingPapersChunkAttachReport } from "../src/lib/intelligence/v4/briefingPapersChunkAttachInventory";
import {
  saveBriefingPapersChunkAttachState,
  stateFromAttachReport,
} from "../src/lib/intelligence/v4/briefingPapersChunkAttachState";
import {
  assertPhase11P7Bar,
  BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF,
  computePhase11P7Progress,
  listBriefingPaperAttachLaneSurfaces,
} from "../src/lib/intelligence/v4/phase11P7Closure";
import {
  BRIEFING_PAPER_ATTACH_LANE_IDS,
  briefingPaperAttachMeetsPhase11P7Bar,
  getBriefingPaperAttachOverlay,
} from "../src/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";
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
  const hasPage = fs.existsSync(path.join(dir, "page.tsx"));
  assert.ok(hasPage, `Missing page: ${routePath}`);
}

async function main() {
  const report = await buildBriefingPapersChunkAttachReport();
  saveBriefingPapersChunkAttachState(stateFromAttachReport(report), REPO_ROOT);

  assert.ok(report.lanes.length === 8, "lane count");
  assert.ok(report.totalAttachableChunks >= 500, `attachable ${report.totalAttachableChunks}`);
  assert.ok(report.lanes.every((l) => l.phase11P7Enriched), "all lanes enriched");

  for (const laneId of BRIEFING_PAPER_ATTACH_LANE_IDS) {
    const overlay = getBriefingPaperAttachOverlay(laneId);
    assert.ok(briefingPaperAttachMeetsPhase11P7Bar(overlay), laneId);
    const row = report.lanes.find((l) => l.laneId === laneId);
    assert.ok(row, laneId);
    assert.ok(row!.attachableChunkCount >= 0, `${laneId} count`);
  }

  const progress = computePhase11P7Progress();
  assert.ok(progress.lanesAtBar >= 8, `lanes at bar ${progress.lanesAtBar}`);
  assert.ok(progress.totalAttachableChunks >= 500, `progress attachable ${progress.totalAttachableChunks}`);

  const bar = assertPhase11P7Bar();
  assert.ok(bar.ok, bar.message);

  const surfaces = listBriefingPaperAttachLaneSurfaces();
  assert.ok(surfaces.length === 8, "surfaces");
  assert.ok(surfaces.every((s) => s.phase11P7Enriched), "all enriched");

  assert.ok(getFieldBookArticle("briefing-papers-chunk-attach-command"), "field book");
  assert.ok(resolveCanonBinding(BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF), "canon");
  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF),
    "migration hub",
  );
  assert.ok(
    listStrategyMigrationRoutes().some((r) => r.intelligenceHref === "/admin/intelligence/briefing-papers"),
    "briefing-papers migration",
  );

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p7-upgrade");
  assertRouteExists("/admin/intelligence/briefing-papers-chunk-attach/debate-prep");

  console.log("test-phase11-p7-briefing-papers-chunk-attach: OK");
  console.log(
    `  lanes: ${progress.lanesAtBar}/${progress.laneTotal} · attachable: ${progress.totalAttachableChunks.toLocaleString()} · overall: ${progress.overallPct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
