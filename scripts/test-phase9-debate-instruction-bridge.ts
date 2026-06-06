/**
 * Phase 9 — Debate instruction bridge + dossier depth orchestration checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase9DebateInstructionBar,
  computePhase9DebateInstructionProgress,
  computePhase9UpgradePass,
} from "../src/lib/intelligence/v4/phase9DebateInstructionClosure";
import { buildDebateCoachingOperatorSummary } from "../src/lib/intelligence/v4/phase9DebateCoachingRunbook";
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "../src/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "../src/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "../src/lib/intelligence/v4/sosDebateQuestionBank";
import { prepSectionHasPhase9Bridge, sosQuestionHasPhase9Bridge, trapLaneHasPhase9Bridge } from "../src/lib/intelligence/v4/applyPhase9DebateInstruction";
import { PHASE9_PROMOTED_KH_MODULE_IDS, KIM_HAMMER_V4_MODULES } from "../src/lib/intelligence/kimHammerV4ModuleRegistry";
import { getFieldBookArticle } from "../src/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "../src/lib/intelligence/fieldBookCanonRegistry";
import { DEBATE_GLOSSARY_TERMS } from "../src/lib/intelligence/v4/debateGlossaryRegistry";

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

const progress = computePhase9DebateInstructionProgress();
assert.ok(progress.dossierDepthPct >= 95, `Dossier depth ${progress.dossierDepthPct}%`);
assert.ok(progress.prepSectionsAtBridge >= 28, `Prep bridge ${progress.prepSectionsAtBridge}/28`);
assert.ok(progress.trapLanesAtBridge >= 6, `Trap bridge ${progress.trapLanesAtBridge}/6`);
assert.ok(progress.sosQuestionsAtBridge >= 35, `SOS bridge ${progress.sosQuestionsAtBridge}/35`);
assert.ok(progress.khWave4Promoted >= 2, `KH wave 4 ${progress.khWave4Promoted}/2`);

const bar = assertPhase9DebateInstructionBar();
assert.ok(bar.ok, bar.message);

const pass = computePhase9UpgradePass();
assert.ok(pass.gaps.length >= 7, `Gap tracker ${pass.gaps.length} items`);
assert.ok(pass.gaps.some((g) => g.id === "prep-dossier-bridge"), "prep gap item");

for (const id of PHASE9_PROMOTED_KH_MODULE_IDS) {
  const mod = KIM_HAMMER_V4_MODULES[id];
  assert.ok(mod, `Missing KH module ${id}`);
  assert.notEqual(mod.render.type, "staff-stub", `${id} still staff-stub`);
}

assert.ok(buildDebateCoachingOperatorSummary().steps.length >= 8, "coaching runbook steps");
assert.ok(getFieldBookArticle("debate-instruction-bridge"), "debate-instruction-bridge article");
assert.ok(resolveCanonBinding("/admin/intelligence/phase-9-upgrade"), "phase-9 canon binding");

assertRouteExists("/admin/intelligence/phase-9-upgrade");

const prepIds = getAllPrepSectionDrillDownIds();
for (const id of prepIds) {
  const s = getPrepSectionDrillDown(id)!;
  assert.ok(prepSectionHasPhase9Bridge(s), `Prep ${id} missing Phase 9 bridge`);
  assert.ok(s.relatedLinks.some((l) => l.href.includes("dossier")), `Prep ${id} missing dossier link`);
}

for (const id of getAllTrapLaneIds()) {
  const lane = getTrapLaneDrillDown(id)!;
  assert.ok(trapLaneHasPhase9Bridge(lane), `Trap ${id} missing clerk bridge`);
}

for (const id of getAllSosDebateQuestionIds()) {
  const q = getSosDebateQuestionDrillDown(id)!;
  assert.ok(sosQuestionHasPhase9Bridge(q), `SOS ${id} missing dossier hook`);
}

assert.ok(DEBATE_GLOSSARY_TERMS.some((t) => t.id === "debate-instruction-bridge"), "glossary term");

const bridgeFiles = [
  "src/lib/intelligence/v4/phase9DebateInstructionDepth.ts",
  "src/lib/intelligence/v4/applyPhase9DebateInstruction.ts",
  "src/lib/intelligence/v4/phase9DebateInstructionClosure.ts",
  "src/lib/intelligence/v4/phase9DebateCoachingRunbook.ts",
];
for (const f of bridgeFiles) {
  assert.ok(fs.existsSync(path.join(process.cwd(), f)), `Missing ${f}`);
}

console.log("test-phase9-debate-instruction-bridge: OK");
console.log(
  `  depth: ${progress.dossierDepthPct}% · prep: ${progress.prepSectionsAtBridge}/28 · traps: ${progress.trapLanesAtBridge}/6 · SOS: ${progress.sosQuestionsAtBridge}/35 · overall: ${progress.overallPct}%`,
);
