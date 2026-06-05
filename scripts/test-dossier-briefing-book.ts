/**
 * Phase 1 — Dossier briefing book depth checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildHammerBioNarrativeChapter,
  buildKellyBioNarrativeChapter,
  buildPakkoBioNarrativeChapter,
  computeDossierBriefingBookProgress,
} from "../src/lib/intelligence/v4/candidateDossierBriefingBook";
import { getKellyDossierSections } from "../src/lib/intelligence/v4/kellyCandidateDossierDepth";
import { getOpponentDossierSectionsForCandidate } from "../src/lib/intelligence/v4/opponentCandidateDossierDepth";

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
  const page = path.join(dir, "page.tsx");
  assert.ok(fs.existsSync(page), `Missing page for route ${routePath}: ${page}`);
}

const progress = computeDossierBriefingBookProgress();
assert.ok(progress.kellyPct >= 75, `Kelly briefing bar ${progress.kellyPct}%`);
assert.ok(progress.hammerPct >= 75, `Hammer briefing bar ${progress.hammerPct}%`);
assert.ok(progress.pakkoPct >= 75, `Pakko briefing bar ${progress.pakkoPct}%`);
assert.ok(progress.overallPct >= 75, `Overall briefing bar ${progress.overallPct}%`);

const kellyBio = buildKellyBioNarrativeChapter();
assert.ok(kellyBio.paragraphs.length >= 3, "Kelly bio chapter");
assert.ok(kellyBio.readAloudDebate.length > 80, "Kelly read-aloud debate");

const hammerBio = buildHammerBioNarrativeChapter();
assert.ok(hammerBio.paragraphs.length >= 3, "Hammer bio chapter");

const pakkoBio = buildPakkoBioNarrativeChapter();
assert.ok(pakkoBio.paragraphs.length >= 3, "Pakko bio chapter");

assert.ok(getKellyDossierSections().length >= 12, "Kelly sections");
assert.ok(getOpponentDossierSectionsForCandidate("kim-hammer").length >= 8, "Hammer sections");
assert.ok(getOpponentDossierSectionsForCandidate("michael-packo").length >= 8, "Pakko sections");

assertRouteExists("/admin/intelligence/candidate-dossiers/kelly-grappe");
assertRouteExists("/admin/intelligence/opponents/dossiers/kim-hammer");
assertRouteExists("/admin/intelligence/opponents/dossiers/michael-packo");
assertRouteExists("/admin/intelligence/opponents/michael-packo");

console.log("test-dossier-briefing-book: OK");
console.log(`  briefing progress: Kelly ${progress.kellyPct}% · Hammer ${progress.hammerPct}% · Pakko ${progress.pakkoPct}%`);
console.log(`  overall: ${progress.overallPct}%`);
