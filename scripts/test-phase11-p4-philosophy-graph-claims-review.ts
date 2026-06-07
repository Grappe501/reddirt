/**
 * Phase 11 P4 — Philosophy graph claims review checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase11P4Bar,
  computePhase11P4Progress,
  listPhilosophyGraphNodeSurfaces,
  PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF,
} from "../src/lib/intelligence/v4/phase11P4Closure";
import {
  getPhilosophyGraphClaimsOverlay,
  philosophyGraphClaimsMeetsPhase11P4Bar,
} from "../src/lib/intelligence/v4/phase11P4PhilosophyGraphClaimsDepth";
import { seedPhilosophyGraphClaims, listPhilosophyGraphClaims } from "../src/lib/intelligence/claims/philosophyGraphClaimsSeed";
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

function main() {
  seedPhilosophyGraphClaims(REPO_ROOT);

  const progress = computePhase11P4Progress();
  assert.ok(progress.nodeTotal >= 8, `nodes ${progress.nodeTotal}`);
  assert.ok(progress.nodesAtBar >= 8, `at bar ${progress.nodesAtBar}`);
  assert.ok(progress.philosophyClaimsInLedger >= 8, `claims ${progress.philosophyClaimsInLedger}`);

  const bar = assertPhase11P4Bar();
  assert.ok(bar.ok, bar.message);

  const nodes = listPhilosophyGraphNodeSurfaces();
  assert.ok(nodes.length >= 8, "surfaces");
  for (const n of nodes) {
    const overlay = getPhilosophyGraphClaimsOverlay(n.philosophyId);
    assert.ok(philosophyGraphClaimsMeetsPhase11P4Bar(overlay), n.philosophyId);
    assert.ok(n.phase11P4Enriched, n.philosophyId);
  }

  const claims = listPhilosophyGraphClaims(REPO_ROOT);
  assert.ok(claims.every((c) => c.id.startsWith("claim-philosophy-")), "claim ids");
  assert.ok(claims.every((c) => c.topicTags.includes("philosophy-graph")), "tags");

  assert.ok(getFieldBookArticle("philosophy-graph-claims-command"), "field book");
  assert.ok(resolveCanonBinding(PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF), "canon");
  assert.ok(listStrategyMigrationRoutes().some((r) => r.intelligenceHref === PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF), "migration");

  const bridge = validateStrategyMigrationBridge();
  assert.ok(bridge.ok, bridge.errors.join("; "));

  assertRouteExists(PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF);
  assertRouteExists("/admin/intelligence/phase-11-p4-upgrade");
  assertRouteExists("/admin/intelligence/philosophy-graph-claims-review/philosophy-civic-trust");

  console.log("test-phase11-p4-philosophy-graph-claims-review: OK");
  console.log(
    `  nodes: ${progress.nodesAtBar}/${progress.nodeTotal} · claims: ${progress.philosophyClaimsInLedger} · overall: ${progress.overallPct}%`,
  );
}

main();
