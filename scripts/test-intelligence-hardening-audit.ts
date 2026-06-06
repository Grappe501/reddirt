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
import { loadCountyElectionFundingResearch } from "../src/lib/intelligence/v4/countyElectionFundingIntelligence";
import { getAllElectionFundingDepthSectionIds } from "../src/lib/intelligence/v4/electionFundingDrillDownDepth";
import { getAllAccaConferenceDepthSectionIds, loadAccaClerksConference2026 } from "../src/lib/intelligence/v4/accaClerksConference2026Depth";
import {
  getAllOpponentDossierSectionIds,
  getOpponentDossierSection,
} from "../src/lib/intelligence/v4/opponentCandidateDossierDepth";
import {
  loadKimHammerCandidateDossier,
  loadMichaelPackoCandidateDossier,
} from "../src/lib/intelligence/v4/loadOpponentCandidateDossier";
import { loadKellyGrappeCandidateDossier } from "../src/lib/intelligence/v4/loadKellyCandidateDossier";
import {
  getAllKellyDossierSectionIds,
  getKellyDossierSection,
} from "../src/lib/intelligence/v4/kellyCandidateDossierDepth";
import {
  buildKellyBioNarrativeChapter,
  computeDossierBriefingBookProgress,
} from "../src/lib/intelligence/v4/candidateDossierBriefingBook";
import { loadVvsg20CandidateEducation } from "../src/lib/intelligence/v4/vvsg20CandidateEducation";
import { INTEGRITY_2021_PACKAGE_DEPTH, PETITION_2025_CLUSTER_DEPTH } from "../src/lib/intelligence/v4/integrityPackageDepth";
import { listCuratedBillPlaybookNumbers } from "../src/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { KELLY_PUBLIC_RECORD_BRIEF } from "../src/lib/intelligence/v4/kellyCandidatePublicRecordBrief";
import { KELLY_OFFENSIVE_MOVES } from "../src/lib/intelligence/v4/kellyOffensiveApproachDepth";
import { listDebatePhilosophyBriefings } from "../src/lib/intelligence/v4/debatePhilosophyBriefings";
import { buildSosQuestionBriefing } from "../src/lib/intelligence/v4/debateBriefingEnrichment";

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
assert.ok(qIds.length >= 35, "expected 35+ SOS questions");
for (const id of qIds) {
  const d = getSosDebateQuestionDrillDown(id)!;
  const rounds = buildSosQuestionResponseRounds(d);
  assert.ok(rounds.rounds.length >= 5, `${id} response rounds`);
  assert.ok((d.comprehensive?.speakFirstFullScript.length ?? 0) > 80, `${id} comprehensive first script`);
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
assert.ok(report.version === "v9.0-phase-6-debate-ready-governance", "build progress version");
assertRouteExists("/admin/intelligence/build-progress");
assertRouteExists("/admin/intelligence/supreme-workbench");
assertRouteExists("/admin/intelligence/opposition-strategy");

// --- v6.2 opposition strategy (static modules — no server-only loaders in audit) ---
assert.equal(INTEGRITY_2021_PACKAGE_DEPTH.billAnchors.length, 6, "2021 package bills");
assert.equal(PETITION_2025_CLUSTER_DEPTH.billAnchors.length, 5, "2025 petition cluster");
assert.equal(KELLY_OFFENSIVE_MOVES.length, 6, "offensive moves");
assert.equal(getAllTrapLaneIds().length, 6, "trap lane ids");
assert.ok(listCuratedBillPlaybookNumbers().length >= 29, "29 curated bill playbooks");
assert.ok(getAllElectionFundingDepthSectionIds().length >= 14, "election funding depth sections");
for (const sid of getAllElectionFundingDepthSectionIds().slice(0, 5)) {
  assertRouteExists(`/admin/intelligence/election-funding/${sid}`);
}
assert.ok(KELLY_PUBLIC_RECORD_BRIEF.length >= 3, "Kelly public record brief");

// --- ACCA Summer Conference 2026 ---
assert.ok(getAllAccaConferenceDepthSectionIds().length >= 12, "ACCA conference depth sections");
assertRouteExists("/admin/intelligence/county-clerk-week/acca-summer-conference");
for (const sid of getAllAccaConferenceDepthSectionIds().slice(0, 4)) {
  assertRouteExists(`/admin/intelligence/county-clerk-week/acca-summer-conference/${sid}`);
}
const acca = loadAccaClerksConference2026();
assert.equal(acca.sosCandidatesPanel.durationMinutes, 120, "ACCA panel 2 hours");
assert.equal(acca.sosCandidatesPanel.candidates.length, 3, "three SOS candidates");

// --- Opponent candidate dossiers ---
assert.ok(getAllOpponentDossierSectionIds().length >= 16, "opponent dossier sections");
assertRouteExists("/admin/intelligence/opponents/dossiers");
assertRouteExists("/admin/intelligence/opponents/dossiers/kim-hammer");
assertRouteExists("/admin/intelligence/opponents/dossiers/michael-packo");
assertRouteExists("/admin/intelligence/opponents/michael-packo");
assertRouteExists("/admin/intelligence/opponents/michael-packo/quotes");
assertRouteExists("/admin/intelligence/opponents/michael-packo/contrast-vs-kelly");
assertRouteExists("/admin/intelligence/opponents/michael-packo/finance");

// --- Phase 1 briefing book ---
const briefing = computeDossierBriefingBookProgress();
assert.ok(briefing.overallPct >= 75, "Phase 1 briefing book overall");
assert.ok(buildKellyBioNarrativeChapter().paragraphs.length >= 3, "Kelly bio chapter");

for (const sid of ["hammer-acca-panel-tactics", "packo-three-way-geometry"]) {
  const sec = getOpponentDossierSection(sid)!;
  assertRouteExists(`/admin/intelligence/opponents/dossiers/${sec.candidateId}/${sid}`);
}
const hammerDossier = loadKimHammerCandidateDossier();
const packoDossier = loadMichaelPackoCandidateDossier();
assert.ok(hammerDossier.whatTheyClaim.length >= 5, "Hammer claims ledger");
assert.ok(packoDossier.whatTheyClaim.length >= 3, "Pakko claims ledger");
assert.ok(hammerDossier.leadStoriesToWatch.length >= 5, "Hammer lead stories");
assert.ok(packoDossier.leadStoriesToWatch.length >= 4, "Pakko lead stories");

// --- Kelly alignment dossier (v6.5) ---
assert.ok(getAllKellyDossierSectionIds().length >= 12, "Kelly alignment sections");
assertRouteExists("/admin/intelligence/candidate-dossiers");
assertRouteExists("/admin/intelligence/candidate-dossiers/kelly-grappe");
for (const sid of ["kelly-sos-office-overview", "kelly-debate-credential-intro", "kelly-30-second-bio"]) {
  const sec = getKellyDossierSection(sid)!;
  assert.ok(sec.narrativeOverview.length >= 3, `${sid} narrative depth`);
  assert.ok(sec.debateFramingExample.length > 40, `${sid} debate framing`);
  assertRouteExists(`/admin/intelligence/candidate-dossiers/kelly-grappe/${sid}`);
}
const kellyDossier = loadKellyGrappeCandidateDossier();
assert.ok(kellyDossier.coreStrengths.length >= 5, "Kelly core strengths");
assert.ok(kellyDossier.experienceToOfficeThemes.length >= 5, "Kelly crosswalk themes");
assert.equal(kellyDossier.candidateId, "kelly-grappe");

// --- v6.3 briefing depth ---
assertRouteExists("/admin/intelligence/debate-briefings");
assert.ok(listDebatePhilosophyBriefings().length >= 8, "8+ philosophy briefings");
assert.ok(getAllSosDebateQuestionIds().length >= 35, "35+ SOS debate questions");
for (const id of ["county-clerks-unfunded-mandates", "cvsgf-county-funding-ledger", "acca-clerk-panel-partnership"]) {
  const q = getSosDebateQuestionDrillDown(id)!;
  assert.ok((q.comprehensive?.speakFirstFullScript.length ?? 0) > 100, `${id} full script`);
  assert.ok((q.comprehensive?.hammerExchanges.length ?? 0) >= 1, `${id} hammer exchanges`);
}
for (const pid of listDebatePhilosophyBriefings().map((p) => p.briefingId)) {
  assertRouteExists(`/admin/intelligence/debate-briefings/${pid}`);
}

// --- Core routes ---
for (const route of [
  "/admin/intelligence",
  "/admin/intelligence/trap-lanes",
  "/admin/intelligence/sos-debate-questions",
  "/admin/intelligence/debate-briefings",
  "/admin/intelligence/candidate-dossiers/kelly-grappe",
  "/admin/intelligence/kelly-debate-coaching",
  "/admin/intelligence/debate-depth",
  "/admin/intelligence/debate-command",
  "/admin/intelligence/election-funding",
]) {
  assertRouteExists(route);
}

// --- VVSG 2.0 EAC education ---
const vvsg = loadVvsg20CandidateEducation();
assert.ok(vvsg.whatKellyShouldKnow.length >= 5, "VVSG Kelly should-know items");
assert.ok(vvsg.certificationPipeline.federallyCertifiedAsOfReport.length >= 2, "VVSG certified systems");
assertRouteExists("/admin/intelligence/election-equipment-vvsg");

// --- Election funding CVSGF ---
const funding = loadCountyElectionFundingResearch();
assert.ok(funding.statutoryAuthority.length >= 2, "CVSGF statutory authority");
assert.ok(funding.appropriations.filter((a) => a.evidenceTier === "VERIFIED_FACT").length >= 3, "verified appropriations");
assert.ok(funding.countyAwardLedger.knownCountyReferences.length >= 8, "county breadcrumbs");
assert.ok(funding.debateStrategy.hammerTrapQuestion.length > 40, "funding trap question");

console.log("test-intelligence-hardening-audit: OK");
console.log(`  prep sections: ${prepIds.length}`);
console.log(`  trap lanes: ${trapIds.length}`);
console.log(`  SOS questions: ${qIds.length}`);
console.log(`  bills with Arkleg: ${actProofOk}/${billNumbers.length}`);
console.log(`  overall completion: ${report.overallCompletionPct}%`);
console.log(`  curated bill playbooks: ${listCuratedBillPlaybookNumbers().length}`);
