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
import {
  DAY1_ID,
  DAY2_ID,
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
assert.ok(DEBATE_PREP_DAY2_RELEASE_VERSION.includes("day-2"));

const root = path.join(process.cwd(), "src");
const conceptPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/concepts/[conceptId]/page.tsx"),
  "utf8",
);
assert.ok(conceptPage.includes("ElectionPlanDay1SupplementFooter"));
assert.ok(conceptPage.includes("ElectionPlanDay2SupplementFooter"));

const drillPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/drills/[drillId]/page.tsx"),
  "utf8",
);
assert.ok(drillPage.includes("Then scan — presence"));
assert.ok(drillPage.includes("DAY1_ID"));

console.log(
  `test-debate-prep-day-parity: OK (D1 ${day1Steps.length}/${day1Minutes}m · D2 ${day2Steps.length}/${day2Minutes}m · phases ${d1Depth.phases}/${d2Depth.phases} · deep ${d1Depth.deepSections}/${d2Depth.deepSections})`,
);
