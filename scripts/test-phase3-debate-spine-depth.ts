/**
 * Phase 3 — Five-layer debate spine depth checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  computePhase3UpgradePass,
  fiveLayerMeetsBar,
  getCommandSurfaceFiveLayer,
  getSosQuestionFiveLayer,
  getTrapLaneFiveLayer,
  PHASE_3_WAVES,
} from "../src/lib/intelligence/v4/phase3DebateSpineDepth";
import { getAllSosDebateQuestionIds } from "../src/lib/intelligence/v4/sosDebateQuestionBank";
import { getAllTrapLaneIds } from "../src/lib/intelligence/v4/trapLaneDrillDowns";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");

function assertRouteExists(routePath: string) {
  const rel = routePath.replace(/^\/admin\/intelligence\/?/, "");
  if (!rel) {
    assert.ok(fs.existsSync(path.join(APP_ROOT, "page.tsx")), "Missing hub page");
    return;
  }
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

const report = computePhase3UpgradePass();
assert.equal(PHASE_3_WAVES.length, 6, "Six waves defined");
assert.ok(report.w3DebateSpinePct >= 95, `W3 debate spine ${report.w3DebateSpinePct}% (need 95%+)`);
assert.ok(report.waves.find((w) => w.id === "w1-command")!.pct >= 100, "W1 command at bar");

for (const id of getAllTrapLaneIds()) {
  const depth = getTrapLaneFiveLayer(id);
  assert.ok(depth, `Trap lane five-layer ${id}`);
  assert.ok(fiveLayerMeetsBar(depth!), `${id} at five-layer bar`);
}

for (const id of getAllSosDebateQuestionIds()) {
  const depth = getSosQuestionFiveLayer(id);
  assert.ok(depth, `SOS question five-layer ${id}`);
  assert.ok(fiveLayerMeetsBar(depth!), `${id} at five-layer bar`);
}

for (const pageId of ["supreme-workbench", "debate-command", "film-room"]) {
  const depth = getCommandSurfaceFiveLayer(pageId);
  assert.ok(depth, `Command surface ${pageId}`);
  assert.ok(fiveLayerMeetsBar(depth!), `${pageId} at five-layer bar`);
}

assertRouteExists("/admin/intelligence/phase-3-upgrade");
assertRouteExists("/admin/intelligence/supreme-workbench");
assertRouteExists("/admin/intelligence/debate-command");
assertRouteExists("/admin/intelligence/film-room");
assertRouteExists("/admin/intelligence/trap-lanes");
assertRouteExists("/admin/intelligence/sos-debate-questions");

const trapPanel = fs.readFileSync(
  path.join(process.cwd(), "src/components/admin/intelligence/v4/V4TrapLaneDrillDownPanel.tsx"),
  "utf8",
);
assert.ok(trapPanel.includes("DebateSpineFiveLayerChrome"), "Trap panel wired");

const sosPanel = fs.readFileSync(
  path.join(process.cwd(), "src/components/admin/intelligence/sos-questions/V4SosDebateQuestionPanel.tsx"),
  "utf8",
);
assert.ok(sosPanel.includes("DebateSpineFiveLayerChrome"), "SOS panel wired");

console.log("test-phase3-debate-spine-depth: OK");
console.log(`  W3 debate spine: ${report.w3DebateSpinePct}% · overall Phase 3: ${report.completionPct}%`);
console.log(`  waves: ${report.waves.map((w) => `${w.shortLabel} ${w.pct}%`).join(" · ")}`);
