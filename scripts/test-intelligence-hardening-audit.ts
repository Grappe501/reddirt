/**
 * Intelligence v5 hardening audit — route inventory, drill-down depth, bill act-proof links.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { computeIntelligenceBuildProgress } from "../src/lib/intelligence/v4/intelligenceBuildProgress";
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "../src/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "../src/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "../src/lib/intelligence/v4/sosDebateQuestionBank";
import { loadDebateIntelligenceV4Packet, findV4BillNarrative } from "../src/lib/intelligence/v4/debateIntelligenceV4";
import { buildBillActProofDeep, listAllBillNumbersFromIndex, resolveArklegBillUrl } from "../src/lib/intelligence/v4/billActProofDepth";
import { buildSosQuestionResponseRounds } from "../src/lib/intelligence/v4/debateResponseRoundEnrichment";
import { buildTrapLaneStepCoverage } from "../src/lib/intelligence/v4/trapLaneStepCoverage";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");

function assertRouteExists(routePath: string) {
  const rel = routePath.replace(/^\/admin\/intelligence\/?/, "");
  if (!rel) {
    assert.ok(fs.existsSync(path.join(APP_ROOT, "page.tsx")), `Missing hub page`);
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
  const page = path.join(dir, "page.tsx");
  assert.ok(fs.existsSync(page), `Missing page for route ${routePath}: ${page}`);
}

// --- Prep sections ---
const prepIds = getAllPrepSectionDrillDownIds();
assert.equal(prepIds.length, 28, "expected 28 prep sections");
for (const id of prepIds) {
  const d = getPrepSectionDrillDown(id)!;
  assert.ok(d.whyItMatters.length > 20, `${id} whyItMatters`);
  assert.ok(d.rehearsalSteps.length >= 1, `${id} rehearsalSteps`);
  assertRouteExists(`/admin/intelligence/kim-hammer/debate-prep/${id}`);
}

// --- Trap lanes ---
const trapIds = getAllTrapLaneIds();
assert.equal(trapIds.length, 6, "expected 6 trap lanes");
for (const id of trapIds) {
  const d = getTrapLaneDrillDown(id)!;
  const coverage = buildTrapLaneStepCoverage(d);
  assert.ok(coverage.steps.length >= 6, `${id} trap step coverage`);
  assertRouteExists(`/admin/intelligence/trap-lanes/${id}`);
}

// --- SOS questions ---
const qIds = getAllSosDebateQuestionIds();
assert.ok(qIds.length >= 20, "expected 20+ SOS questions");
for (const id of qIds) {
  const d = getSosDebateQuestionDrillDown(id)!;
  const rounds = buildSosQuestionResponseRounds(d);
  assert.ok(rounds.rounds.length >= 5, `${id} response rounds`);
  assertRouteExists(`/admin/intelligence/sos-debate-questions/${id}`);
}

// --- Bill act-proof pages ---
const v4 = loadDebateIntelligenceV4Packet();
const billNumbers = listAllBillNumbersFromIndex();
let actProofOk = 0;
for (const bill of billNumbers) {
  const narrative = findV4BillNarrative(v4, bill);
  if (!narrative) continue;
  const deep = buildBillActProofDeep(narrative);
  assert.ok(deep.educationTiers.length === 3, `${bill} education tiers`);
  assert.ok(deep.stepByStepCoverage.length >= 6, `${bill} step coverage`);
  assert.ok(deep.opponentExpectedResponses.length >= 4, `${bill} opponent rounds`);
  const actProofPage = path.join(
    APP_ROOT,
    "kim-hammer/bills/[billNumber]/act-proof/page.tsx",
  );
  assert.ok(fs.existsSync(actProofPage), "act-proof route template must exist");
  if (resolveArklegBillUrl(bill)) actProofOk++;
}
assert.ok(actProofOk >= billNumbers.length * 0.9, "90%+ bills need Arkleg URLs");

// --- Build progress ---
const report = computeIntelligenceBuildProgress();
assert.ok(report.overallCompletionPct >= 60, "overall completion should be >= 60%");
assert.ok(report.phases.length >= 5, "phase plan");
assertRouteExists("/admin/intelligence/build-progress");

// --- Core routes ---
for (const route of [
  "/admin/intelligence",
  "/admin/intelligence/trap-lanes",
  "/admin/intelligence/sos-debate-questions",
  "/admin/intelligence/kelly-debate-coaching",
  "/admin/intelligence/debate-depth",
  "/admin/intelligence/debate-command",
]) {
  assertRouteExists(route);
}

console.log("test-intelligence-hardening-audit: OK");
console.log(`  prep sections: ${prepIds.length}`);
console.log(`  trap lanes: ${trapIds.length}`);
console.log(`  SOS questions: ${qIds.length}`);
console.log(`  bills with Arkleg: ${actProofOk}/${billNumbers.length}`);
console.log(`  overall completion: ${report.overallCompletionPct}%`);
console.log(`  flagged items: ${report.flaggedForMasterBuild.length}`);
