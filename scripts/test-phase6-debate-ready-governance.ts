/**
 * Phase 6 — Debate-ready governance checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase6DebateReadyBar,
  computePhase6DebateReadyProgress,
} from "../src/lib/intelligence/v4/phase6DebateReadyGovernance";
import { PHASE6_PROMOTED_KH_MODULE_IDS, KIM_HAMMER_V4_MODULES } from "../src/lib/intelligence/kimHammerV4ModuleRegistry";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";

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

const progress = computePhase6DebateReadyProgress();
assert.ok(progress.prepSectionsAtBar >= 28, `Prep ${progress.prepSectionsAtBar}/28`);
assert.ok(progress.trapLanesAtBar >= 6, `Traps ${progress.trapLanesAtBar}/6`);
assert.ok(progress.khModulesPromoted >= 10, `KH promoted ${progress.khModulesPromoted}/10`);

const bar = assertPhase6DebateReadyBar();
assert.ok(bar.ok, bar.message);

for (const id of PHASE6_PROMOTED_KH_MODULE_IDS) {
  const mod = KIM_HAMMER_V4_MODULES[id];
  assert.ok(mod, `Missing KH module ${id}`);
  assert.notEqual(mod.render.type, "staff-stub", `${id} still staff-stub`);
}

assert.ok(getFieldBookArticle("debate-ready-governance"), "debate-ready-governance article");

assertRouteExists("/admin/intelligence/phase-6-upgrade");

const claimsPanel = fs.readFileSync(
  path.join(process.cwd(), "src/components/admin/intelligence/ClaimsReviewWavePanel.tsx"),
  "utf8",
);
assert.ok(claimsPanel.includes("/api/admin/intelligence/claim-review"), "Claims review wave API wired");

console.log("test-phase6-debate-ready-governance: OK");
console.log(
  `  prep: ${progress.prepSectionsAtBar}/${progress.prepSectionTotal} · traps: ${progress.trapLanesAtBar}/${progress.trapLaneTotal} · KH: ${progress.khModulesPromoted}/${progress.khModulesPromotedTarget} · claims NEEDS_REVIEW: ${progress.claimsNeedsReview} · overall: ${progress.overallPct}%`,
);
