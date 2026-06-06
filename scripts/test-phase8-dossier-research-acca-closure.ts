/**
 * Phase 8 — Dossier research depth + ACCA panel closure checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase8DossierResearchAccaBar,
  computePhase8DossierResearchAccaProgress,
} from "../src/lib/intelligence/v4/phase8DossierResearchAccaClosure";
import { buildAccaPanelOperatorSummary } from "../src/lib/intelligence/v4/phase8AccaPanelOperatorRunbook";
import { getKellyDossierSections } from "../src/lib/intelligence/v4/kellyCandidateDossierDepth";
import { PHASE8_PROMOTED_KH_MODULE_IDS, KIM_HAMMER_V4_MODULES } from "../src/lib/intelligence/kimHammerV4ModuleRegistry";
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

const progress = computePhase8DossierResearchAccaProgress();
assert.ok(progress.dossierResearchPct >= 95, `Dossier research ${progress.dossierResearchPct}%`);
assert.ok(progress.accaSectionsAtBar >= 12, `ACCA ${progress.accaSectionsAtBar}/12`);
assert.ok(progress.khWave3Promoted >= 10, `KH wave 3 ${progress.khWave3Promoted}/10`);

const bar = assertPhase8DossierResearchAccaBar();
assert.ok(bar.ok, bar.message);

for (const id of PHASE8_PROMOTED_KH_MODULE_IDS) {
  const mod = KIM_HAMMER_V4_MODULES[id];
  assert.ok(mod, `Missing KH module ${id}`);
  assert.notEqual(mod.render.type, "staff-stub", `${id} still staff-stub`);
}

const kelly = getKellyDossierSections();
assert.ok(kelly.length >= 15, `Kelly sections ${kelly.length}`);
const withResearch = kelly.filter((s) => (s.researchDepth?.sourcedFacts.length ?? 0) >= 8);
assert.ok(withResearch.length >= 15, `Kelly research bar ${withResearch.length}/15`);

assert.ok(buildAccaPanelOperatorSummary().steps.length >= 8, "ACCA runbook steps");

assert.ok(getFieldBookArticle("dossier-research-acca-closure"), "dossier-research-acca-closure article");

assertRouteExists("/admin/intelligence/phase-8-upgrade");

const researchFiles = [
  "src/lib/intelligence/v4/kellyDossierResearchDepth.ts",
  "src/lib/intelligence/v4/opponentDossierResearchDepth.ts",
  "src/lib/intelligence/v4/applyCandidateDossierResearchDepth.ts",
];
for (const f of researchFiles) {
  assert.ok(fs.existsSync(path.join(process.cwd(), f)), `Missing ${f}`);
}

const expansionFiles = [
  "src/lib/intelligence/v4/kellyDossierDepthExpansion.ts",
  "src/lib/intelligence/v4/opponentDossierDepthExpansion.ts",
  "src/lib/intelligence/v4/accaConferenceDepthExpansion.ts",
  "src/lib/intelligence/v4/applyDossierDepthExpansion.ts",
];
for (const f of expansionFiles) {
  assert.ok(fs.existsSync(path.join(process.cwd(), f)), `Missing ${f}`);
}

console.log("test-phase8-dossier-research-acca-closure: OK");
console.log(
  `  research: ${progress.dossierResearchPct}% · ACCA: ${progress.accaSectionsAtBar}/${progress.accaSectionTotal} · KH wave3: ${progress.khWave3Promoted}/10 · overall: ${progress.overallPct}%`,
);
