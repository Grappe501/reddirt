/**
 * Phase 7 — Dossier briefing closure + diligence runbook checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertPhase7DossierDiligenceBar,
  computePhase7DossierDiligenceProgress,
} from "../src/lib/intelligence/v4/phase7DossierDiligenceClosure";
import { computeDossierBriefingBookProgress } from "../src/lib/intelligence/v4/candidateDossierBriefingBook";
import { PHASE7_PROMOTED_KH_MODULE_IDS, KIM_HAMMER_V4_MODULES } from "../src/lib/intelligence/kimHammerV4ModuleRegistry";
import { buildDiligenceSubjectRunbooks } from "../src/lib/intelligence/v4/diligenceOperatorRunbook";
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

const dossier = computeDossierBriefingBookProgress();
assert.ok(dossier.overallPct >= 95, `Dossier overall ${dossier.overallPct}%`);
assert.ok(Math.min(dossier.kellyPct, dossier.hammerPct, dossier.pakkoPct) >= 90, "All candidates at briefing bar");

const progress = computePhase7DossierDiligenceProgress();
assert.ok(progress.diligenceRunbookPct >= 100, `Runbook ${progress.diligenceRunbookPct}%`);
assert.ok(progress.khWave2Promoted >= 10, `KH wave 2 ${progress.khWave2Promoted}/10`);
assert.ok(progress.electionFundingAtBar >= 12, `Funding ${progress.electionFundingAtBar}/12`);

const bar = assertPhase7DossierDiligenceBar();
assert.ok(bar.ok, bar.message);

for (const id of PHASE7_PROMOTED_KH_MODULE_IDS) {
  const mod = KIM_HAMMER_V4_MODULES[id];
  assert.ok(mod, `Missing KH module ${id}`);
  assert.notEqual(mod.render.type, "staff-stub", `${id} still staff-stub`);
}

assert.equal(buildDiligenceSubjectRunbooks().length, 3, "Three diligence subject runbooks");

assert.ok(getFieldBookArticle("dossier-diligence-closure"), "dossier-diligence-closure article");

assertRouteExists("/admin/intelligence/phase-7-upgrade");

console.log("test-phase7-dossier-diligence-closure: OK");
console.log(
  `  dossier: ${progress.dossierOverallPct}% (K ${progress.kellyPct}% · H ${progress.hammerPct}% · P ${progress.pakkoPct}%) · runbook: ${progress.diligenceRunbookPct}% · KH wave2: ${progress.khWave2Promoted}/10 · funding: ${progress.electionFundingAtBar}/${progress.electionFundingTotal} · overall: ${progress.overallPct}%`,
);
