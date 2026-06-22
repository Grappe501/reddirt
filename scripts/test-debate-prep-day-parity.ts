/**
 * Day 1 vs Day 2 debate-prep parity — depth, breadth, and wiring must match.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  DAY1_CONCEPT_ANCHORS,
  DAY1_MICRO_LESSON_ANCHORS,
} from "../src/lib/election-plan/day1-supplement-anchors";
import {
  buildDay1PathwaySteps,
  DAY1_EVENING_REVIEW,
  DAY1_MINIMUM_BLOCK_IDS,
  isDay1PathwayStepOptional,
} from "../src/lib/election-plan/day1-learning-pathway";
import {
  DAY2_CONCEPT_ANCHORS,
  DAY2_MICRO_LESSON_ANCHORS,
} from "../src/lib/election-plan/day2-supplement-anchors";
import {
  DAY3_CONCEPT_ANCHORS,
  DAY3_MICRO_LESSON_ANCHORS,
} from "../src/lib/election-plan/day3-supplement-anchors";
import {
  buildDay2PathwaySteps,
  DAY2_EVENING_REVIEW,
  DAY2_MINIMUM_BLOCK_IDS,
  isDay2PathwayStepOptional,
} from "../src/lib/election-plan/day2-learning-pathway";
import { DEBATE_PREP_DAY1_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day1-release";
import { DEBATE_PREP_DAY2_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day2-release";
import { DAY1_BLOCK_STUDY, getDay1BlockStudy } from "../src/lib/election-plan/debatePrepDay1BlockStudy";
import { DAY2_BLOCK_STUDY, getDay2BlockStudy } from "../src/lib/election-plan/debatePrepDay2BlockStudy";
import { getDay1OpponentExampleStudy } from "../src/lib/election-plan/debatePrepDay1OpponentExampleStudy";
import { getDay2OpponentExampleStudy } from "../src/lib/election-plan/debatePrepDay2OpponentExampleStudy";
import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";
import { DAY3_BLOCK_STUDY, getDay3BlockStudy } from "../src/lib/election-plan/debatePrepDay3BlockStudy";
import { getDay3OpponentExampleStudy } from "../src/lib/election-plan/debatePrepDay3OpponentExampleStudy";
import {
  buildDay3PathwaySteps,
  DAY3_EVENING_REVIEW,
  DAY3_MINIMUM_BLOCK_IDS,
  isDay3PathwayStepOptional,
} from "../src/lib/election-plan/day3-learning-pathway";
import {
  DAY1_ID,
  DAY2_ID,
  DAY3_ID,
  listDayBlocksDrillDown,
  listDayConcepts,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
} from "../src/lib/election-plan/debatePrepDayDrillDown";

function countByKind(steps: { kind: string }[]) {
  return steps.reduce(
    (acc, s) => {
      acc[s.kind] = (acc[s.kind] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function studyDepthScore(blockIds: string[], getStudy: (id: string) => ReturnType<typeof getDay1BlockStudy>) {
  let phases = 0;
  let claimsGates = 0;
  let deepSections = 0;
  for (const id of blockIds) {
    const study = getStudy(id);
    if (!study) throw new Error(`${id} block study missing`);
    assert.ok((study.professorLead ?? "").length > 20, `${id} professorLead`);
    assert.ok(study.phases.length >= 3, `${id} should have >= 3 phased sections`);
    assert.ok(study.keyTakeaways.length >= 3, `${id} key takeaways`);
    phases += study.phases.length;
    deepSections += study.deepSections.length;
    if (study.claimsGate?.length) claimsGates += 1;
  }
  return { phases, claimsGates, deepSections };
}

const day1Steps = buildDay1PathwaySteps();
const day2Steps = buildDay2PathwaySteps();
const day1Kinds = countByKind(day1Steps);
const day2Kinds = countByKind(day2Steps);

assert.equal(listDayBlocksDrillDown(DAY1_ID).length, 5);
assert.equal(listDayBlocksDrillDown(DAY2_ID).length, 5);
assert.equal(listDayConcepts(DAY1_ID).length, 5);
assert.equal(listDayConcepts(DAY2_ID).length, 5);

const day1Micro = listDayMicroLessonsDrillDown(DAY1_ID);
const day2Micro = listDayMicroLessonsDrillDown(DAY2_ID);
assert.equal(day1Micro.length, day2Micro.length, "micro-lesson count should match");

assert.ok(listDayRehearsalScripts(DAY1_ID).length === listDayRehearsalScripts(DAY2_ID).length);

assert.equal(day1Kinds.block, 5);
assert.equal(day2Kinds.block, 5);
assert.equal(day1Kinds.rehearsal, 2);
assert.equal(day2Kinds.rehearsal, 2);
assert.equal(day1Kinds.drill, 2, "Day 1 pathway should include two command drills");
assert.equal(day2Kinds.drill, 2);
assert.ok((day2Kinds.example ?? 0) >= (day1Kinds.example ?? 0));
assert.equal(day1Kinds.close, 1);
assert.equal(day2Kinds.close, 1);

assert.ok(Math.abs(day1Steps.length - day2Steps.length) <= 2, "pathway step counts should be within 2");

const day1Minutes = day1Steps.reduce((sum, s) => sum + s.minutes, 0);
const day2Minutes = day2Steps.reduce((sum, s) => sum + s.minutes, 0);
assert.ok(day2Minutes >= day1Minutes * 0.85, "Day 2 pathway minutes comparable to Day 1");

assert.equal(DAY1_EVENING_REVIEW.length, DAY2_EVENING_REVIEW.length);
assert.equal(DAY1_MINIMUM_BLOCK_IDS.length, DAY2_MINIMUM_BLOCK_IDS.length);

const d1Depth = studyDepthScore(Object.keys(DAY1_BLOCK_STUDY), getDay1BlockStudy);
const d2Depth = studyDepthScore(Object.keys(DAY2_BLOCK_STUDY), getDay2BlockStudy);
assert.ok(d2Depth.phases >= d1Depth.phases * 0.9, "Day 2 block study phases should match Day 1 depth");
assert.ok(d2Depth.deepSections >= d1Depth.deepSections * 0.85, "Day 2 deep sections should match Day 1");
assert.equal(d2Depth.claimsGates, 5, "all five Day 2 blocks should have claims gates");

for (const concept of listDayConcepts(DAY1_ID)) {
  assert.ok(DAY1_CONCEPT_ANCHORS[concept.id], `Day 1 concept ${concept.id} needs supplement anchor`);
}
for (const concept of listDayConcepts(DAY2_ID)) {
  assert.ok(DAY2_CONCEPT_ANCHORS[concept.id], `Day 2 concept ${concept.id} needs supplement anchor`);
}
for (const lesson of day1Micro) {
  assert.ok(DAY1_MICRO_LESSON_ANCHORS[lesson.id], `Day 1 micro-lesson ${lesson.id} needs anchor`);
}
for (const lesson of day2Micro) {
  assert.ok(DAY2_MICRO_LESSON_ANCHORS[lesson.id], `Day 2 micro-lesson ${lesson.id} needs anchor`);
}

const d1Example = getDay1OpponentExampleStudy("ex1-hammer-open");
const d2Hammer = getDay2OpponentExampleStudy("ex2-hammer-rank");
const d2Pakko = getDay2OpponentExampleStudy("ex2-pakko-split");
assert.ok(d1Example && d1Example.phases.length >= 4);
assert.ok(d2Hammer && d2Hammer.phases.length >= 4);
assert.ok(d2Pakko && d2Pakko.phases.length >= 4);
assert.ok((d2Hammer.deepSections?.length ?? 0) >= 4);
assert.ok((d2Pakko.deepSections?.length ?? 0) >= 3);
assert.ok(d2Hammer.claimsGate?.length);
assert.ok(d2Pakko.claimsGate?.length);

for (const step of [...day1Steps, ...day2Steps]) {
  assert.ok(!step.href.includes("/admin/"), `${step.id} must not link to admin on pathway`);
  if (step.kind === "example") {
    const optional =
      step.id.startsWith("ex1") || step.id.startsWith("ex2")
        ? step.id.startsWith("ex1")
          ? isDay1PathwayStepOptional(step.id)
          : isDay2PathwayStepOptional(step.id)
        : false;
    assert.ok(optional, `${step.id} example should be optional`);
  }
}

assert.ok(DEBATE_PREP_DAY1_RELEASE_VERSION.includes("day-1"));
assert.equal(DEBATE_PREP_DAY2_RELEASE_VERSION, "day-2-read-the-table-v3.0.0");
assert.equal(DEBATE_PREP_DAY3_RELEASE_VERSION, "day-3-superiority-map-v3.0.0");

const root = path.join(process.cwd(), "src");
const conceptPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/concepts/[conceptId]/page.tsx"),
  "utf8",
);
assert.ok(conceptPage.includes("ElectionPlanDay1SupplementFooter"));
assert.ok(conceptPage.includes("ElectionPlanDay2SupplementFooter"));
assert.ok(conceptPage.includes("ElectionPlanDay3SupplementFooter"));

const drillPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/drills/[drillId]/page.tsx"),
  "utf8",
);
assert.ok(drillPage.includes("Then scan — presence"));
assert.ok(drillPage.includes("DAY1_ID"));

// --- Day 3 parity (vs Day 2 bar) ---
const day3Steps = buildDay3PathwaySteps();
const day3Kinds = countByKind(day3Steps);
const day3Micro = listDayMicroLessonsDrillDown(DAY3_ID);

assert.equal(listDayBlocksDrillDown(DAY3_ID).length, 4, "Day 3 has four intensive blocks");
assert.equal(listDayConcepts(DAY3_ID).length, 6);
assert.ok(Math.abs(day3Steps.length - day2Steps.length) <= 3, "Day 3 pathway steps within ±3 of Day 2 (4 vs 5 blocks)");

const day3Minutes = day3Steps.reduce((sum, s) => sum + s.minutes, 0);
assert.ok(day3Minutes >= day2Minutes * 0.75, "Day 3 pathway minutes comparable to Day 2 (4 blocks vs 5)");

assert.equal(DAY3_EVENING_REVIEW.length, DAY2_EVENING_REVIEW.length);
assert.equal(DAY3_MINIMUM_BLOCK_IDS.length, 2);

assert.equal(day3Kinds.block, 4);
assert.equal(day3Kinds.rehearsal, 2);
assert.equal(day3Kinds.drill, 1);
assert.equal(day3Kinds.close, 1);

const d3Depth = studyDepthScore(Object.keys(DAY3_BLOCK_STUDY), getDay3BlockStudy);
const day3DepthRatio = listDayBlocksDrillDown(DAY3_ID).length / listDayBlocksDrillDown(DAY2_ID).length;
assert.ok(
  d3Depth.phases >= d2Depth.phases * day3DepthRatio * 0.9,
  "Day 3 block study phases should match Day 2 depth (4 vs 5 blocks)",
);
assert.ok(
  d3Depth.deepSections >= d2Depth.deepSections * day3DepthRatio * 0.85,
  "Day 3 deep sections should match Day 2",
);
assert.equal(d3Depth.claimsGates, 4, "all four Day 3 blocks should have claims gates");

for (const concept of listDayConcepts(DAY3_ID)) {
  assert.ok(DAY3_CONCEPT_ANCHORS[concept.id], `Day 3 concept ${concept.id} needs supplement anchor`);
}
for (const lesson of day3Micro) {
  assert.ok(DAY3_MICRO_LESSON_ANCHORS[lesson.id], `Day 3 micro-lesson ${lesson.id} needs anchor`);
}

const d3Example = getDay3OpponentExampleStudy("ex3-hammer-admin");
assert.ok(d3Example && d3Example.phases.length >= 4);
assert.ok((d3Example.deepSections?.length ?? 0) >= 3);
assert.ok(d3Example.claimsGate?.length);

for (const step of day3Steps) {
  assert.ok(!step.href.includes("/admin/"), `${step.id} must not link to admin on Day 3 pathway`);
  if (step.kind === "example") {
    assert.ok(isDay3PathwayStepOptional(step.id), `${step.id} example should be optional`);
  }
}

assert.equal(DEBATE_PREP_DAY3_RELEASE_VERSION, "day-3-superiority-map-v3.0.0");

const microLessonPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/micro-lessons/[lessonId]/page.tsx"),
  "utf8",
);
assert.ok(microLessonPage.includes("ElectionPlanDay3SupplementFooter"));

console.log(
  `test-debate-prep-day-parity: OK (D1 ${day1Steps.length}/${day1Minutes}m · D2 ${day2Steps.length}/${day2Minutes}m · D3 ${day3Steps.length}/${day3Minutes}m · phases ${d1Depth.phases}/${d2Depth.phases}/${d3Depth.phases})`,
);
