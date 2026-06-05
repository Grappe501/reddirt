/**
 * Phase 2 — Diligence operator prose + Field Book Phase A depth checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { allDiligenceSearchOperatorGuides } from "../src/lib/intelligence/v4/diligenceSearchOperatorDepth";
import {
  assertPhase2SurfacesDepthBar,
  computePhase2SurfacesDepthProgress,
} from "../src/lib/intelligence/v4/phase2SurfacesDepth";
import { FIELD_BOOK_ARTICLES } from "../src/lib/intelligence/fieldBookRegistry";
import { OPPONENT_DILIGENCE_SUBJECTS } from "../src/lib/intelligence/v4/opponentDiligenceRegistry";

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

const progress = computePhase2SurfacesDepthProgress();
assert.ok(progress.diligenceGuidePct >= 100, `Diligence guides ${progress.diligenceGuidePct}%`);
assert.ok(progress.fieldBookPhaseAPct >= 100, `Field Book Phase A ${progress.fieldBookPhaseAPct}%`);
assert.ok(progress.overallPct >= 100, `Overall Phase 2 ${progress.overallPct}%`);

const bar = assertPhase2SurfacesDepthBar();
assert.ok(bar.ok, bar.message);

const guides = allDiligenceSearchOperatorGuides();
assert.equal(guides.length, 15, "15 operator guides (3 subjects × 5 searches)");

for (const subject of OPPONENT_DILIGENCE_SUBJECTS) {
  const subjectGuides = guides.filter((g) => g.subjectId === subject.subjectId);
  assert.equal(subjectGuides.length, 5, `${subject.displayName} has 5 guides`);
  for (const g of subjectGuides) {
    assert.ok(g.howToRun.length >= 3, `${g.entryId} howToRun steps`);
    assert.ok(g.fieldBookSlug.length > 3, `${g.entryId} fieldBookSlug`);
  }
}

const phaseA = FIELD_BOOK_ARTICLES.filter((a) => a.phaseId === "phase-a");
assert.ok(phaseA.length >= 8, "Phase A article count");
for (const article of phaseA) {
  assert.ok(article.body.length >= 6, `${article.slug} needs 6+ paragraphs`);
  assert.ok(article.trivia?.length, `${article.slug} needs trivia`);
}

assertRouteExists("/admin/intelligence/diligence");
for (const s of OPPONENT_DILIGENCE_SUBJECTS) {
  assertRouteExists(s.href);
}
assert.ok(
  fs.existsSync(path.join(APP_ROOT, "field-book/phase/[phaseId]/page.tsx")),
  "Field Book phase page",
);
assertRouteExists("/admin/intelligence/field-book/court-diligence-protocol");

const hubPage = fs.readFileSync(path.join(APP_ROOT, "diligence/page.tsx"), "utf8");
assert.ok(hubPage.includes("DiligenceHubOrientationPanel"), "Hub orientation panel wired");

const subjectPage = fs.readFileSync(path.join(APP_ROOT, "diligence/[subjectId]/page.tsx"), "utf8");
assert.ok(subjectPage.includes("DiligenceSubjectOrientationPanel"), "Subject orientation panel wired");

const panel = fs.readFileSync(
  path.join(process.cwd(), "src/components/admin/intelligence/OpponentDiligenceChecklistPanel.tsx"),
  "utf8",
);
assert.ok(panel.includes("DiligenceSearchOperatorBlock"), "Operator block in checklist panel");

console.log("test-phase2-diligence-field-book: OK");
console.log(
  `  diligence guides: ${progress.diligenceGuidePct}% · Field Book Phase A: ${progress.fieldBookPhaseAPct}% · overall: ${progress.overallPct}%`,
);
