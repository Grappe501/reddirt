/**
 * Day 2 debate-prep Pass 4 — footers, supplements, film worksheet anchors, optional examples.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildDay2PathwaySteps,
  getNextDay2PathwayStep,
  isDay2PathwayStepOptional,
} from "../src/lib/election-plan/day2-learning-pathway";
import {
  DAY2_CONCEPT_ANCHORS,
  DAY2_MICRO_LESSON_ANCHORS,
} from "../src/lib/election-plan/day2-supplement-anchors";
import { getDay2BlockStudy } from "../src/lib/election-plan/debatePrepDay2BlockStudy";
import { getDay2OpponentExampleStudy } from "../src/lib/election-plan/debatePrepDay2OpponentExampleStudy";
import {
  DAY2_ID,
  listDayBlocksDrillDown,
  listDayConcepts,
  listDayMicroLessonsDrillDown,
} from "../src/lib/election-plan/debatePrepDayDrillDown";

const steps = buildDay2PathwaySteps();
const optionalExamples = steps.filter((s) => s.kind === "example");
assert.equal(optionalExamples.length, 2, "Day 2 should have two optional examples");
for (const ex of optionalExamples) {
  assert.ok(isDay2PathwayStepOptional(ex.id), `${ex.id} should be optional`);
  assert.ok(ex.label.toLowerCase().includes("optional"), `${ex.id} label should mention optional`);
}

for (let i = 0; i < steps.length - 1; i++) {
  const step = steps[i]!;
  const next = getNextDay2PathwayStep(step.id);
  assert.ok(next, `${step.id} should have a next step`);
  assert.equal(next!.id, steps[i + 1]!.id, `next after ${step.id} should be ${steps[i + 1]!.id}`);
  assert.ok(next!.minutes > 0, `${next!.id} minutes`);
  assert.ok(next!.label.length > 0, `${next!.id} label for Continue button`);
}

assert.equal(listDayBlocksDrillDown(DAY2_ID).length, 5);
assert.equal(listDayConcepts(DAY2_ID).length, 5);
for (const concept of listDayConcepts(DAY2_ID)) {
  assert.ok(DAY2_CONCEPT_ANCHORS[concept.id], `concept ${concept.id} needs supplement anchor`);
}

const microLessons = listDayMicroLessonsDrillDown(DAY2_ID);
assert.ok(microLessons.some((l) => l.id === "d2-watch-hammer"));
assert.ok(microLessons.some((l) => l.id === "d2-three-way"));
for (const lesson of microLessons) {
  assert.ok(DAY2_MICRO_LESSON_ANCHORS[lesson.id], `micro-lesson ${lesson.id} needs supplement anchor`);
}

const filmStudy = getDay2BlockStudy("b2-film");
assert.ok(filmStudy?.claimsGate?.length, "b2-film study should have claims gate");

const hammerExample = getDay2OpponentExampleStudy("ex2-hammer-rank");
assert.ok(hammerExample?.claimsGate?.length, "ex2-hammer-rank should have claims gate for study panel");

const root = path.join(process.cwd(), "src");
const filmPanel = path.join(root, "components/election-plan/ElectionPlanDay2FilmClipPanel.tsx");
assert.ok(fs.existsSync(filmPanel), "Day 2 film clip panel should exist");

const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
assert.ok(blockPage.includes("ElectionPlanDay2FilmClipPanel"), "block page should render Day 2 film clip panel");
assert.ok(blockPage.includes("ElectionPlanFilmTellWorksheetPanel"), "block page should render film worksheet");
assert.ok(blockPage.includes('blockId === "b2-film"'), "film worksheet gated to b2-film");

const conceptPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/concepts/[conceptId]/page.tsx"),
  "utf8",
);
assert.ok(conceptPage.includes("ElectionPlanDay2SupplementFooter"), "concept page should have Day 2 supplement footer");

const microPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/micro-lessons/[lessonId]/page.tsx"),
  "utf8",
);
assert.ok(microPage.includes("ElectionPlanDay2SupplementFooter"), "micro-lesson page should have supplement footer");

const drillPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/drills/[drillId]/page.tsx"),
  "utf8",
);
assert.ok(drillPage.includes("Then scan — presence"), "Day 2 drills should highlight then scan");

console.log(`test-debate-prep-day2-pass4: OK (${steps.length} pathway steps, Pass 4 exit criteria)`);
