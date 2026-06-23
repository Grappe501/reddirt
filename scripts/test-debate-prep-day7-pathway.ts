/**
 * Day 7 debate-prep Pass 1 — pathway spine, block study stubs, drill-down registry.
 */
import assert from "node:assert/strict";
import {
  buildDay7PathwaySteps,
  DAY7_DAY6_REVIEW,
  DAY7_DAY8_TEASER,
  DAY7_EVENING_REVIEW,
  DAY7_MINIMUM_BLOCK_IDS,
  getFirstDay7PathwayStep,
  getNextDay7PathwayStep,
} from "../src/lib/election-plan/day7-learning-pathway";
import { DEBATE_PREP_DAY7_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day7-release";
import { DAY7_PEAK_END_FRAME } from "../src/lib/election-plan/debate-prep-day7-polish-copy";
import {
  DAY7_ID,
  listDayBlocksDrillDown,
  listDayCommandDrillsDrillDown,
  listDayConcepts,
  listDayExampleIds,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
  dayHasDrillDownPages,
} from "../src/lib/election-plan/debatePrepDayDrillDown";
import { getDay7BlockStudy, listDay7BlockStudyIds } from "../src/lib/election-plan/debatePrepDay7BlockStudy";
import { listDayBlockPhaseParams } from "../src/lib/election-plan/debatePrepBlockPhase";
import {
  staticParamsForDayBlocks,
  staticParamsForDayConcepts,
  staticParamsForDayDrills,
  staticParamsForDayExamples,
  staticParamsForDayMicroLessons,
  staticParamsForDayRehearsals,
  DRILL_DOWN_DAY_IDS,
} from "../src/lib/election-plan/debatePrepDayStaticParams";

assert.ok(dayHasDrillDownPages(DAY7_ID), "Day 7 should have drill-down pages");
assert.ok(DRILL_DOWN_DAY_IDS.includes(DAY7_ID), "Day 7 in static params day ids");

const blocks = listDayBlocksDrillDown(DAY7_ID);
assert.equal(blocks.length, 4, "Day 7 should have 4 blocks");
assert.equal(listDayConcepts(DAY7_ID).length, 6);
assert.equal(listDayRehearsalScripts(DAY7_ID).length, 2);
assert.equal(listDayCommandDrillsDrillDown(DAY7_ID).length, 1);
assert.equal(listDayMicroLessonsDrillDown(DAY7_ID).length, 1);
assert.equal(listDayExampleIds(DAY7_ID).length, 1);

const steps = buildDay7PathwaySteps();
assert.ok(steps.length >= 10, "Day 7 pathway should have 4 blocks + tail steps");
assert.equal(getFirstDay7PathwayStep().id, "b7-open-close");
assert.ok(getNextDay7PathwayStep(steps[0]!.id), "first step should have a next step");
assert.equal(DAY7_EVENING_REVIEW.length, 3);
assert.ok(DAY7_DAY6_REVIEW.href.includes("day-6-full-simulation"));
assert.ok(DAY7_DAY8_TEASER.href.includes("day-8-command-mode-debate"));
assert.equal(DEBATE_PREP_DAY7_RELEASE_VERSION, "day-7-refine-and-steal-show-pass1");
assert.ok(DAY7_PEAK_END_FRAME.includes("Peak-end"));

for (const blockId of listDay7BlockStudyIds()) {
  const study = getDay7BlockStudy(blockId);
  assert.ok(study && study.phases.length >= 3, `${blockId} stub phases`);
  assert.ok(study.claimsGate?.length, `${blockId} claimsGate`);
  assert.equal(listDayBlockPhaseParams(DAY7_ID, blockId).length, study.phases.length);
}

const microLesson = steps.find((s) => s.kind === "micro-lesson");
assert.ok(microLesson?.href.includes("d7-steal"), "pathway includes steal micro-lesson");

const commandDrill = steps.find((s) => s.kind === "command-drill");
assert.ok(commandDrill?.href.includes("d7-close"), "pathway includes closing drill");

const example = steps.find((s) => s.kind === "example");
assert.ok(example?.href.includes("ex7-show-steal"), "pathway includes show-steal example");

const rehearsals = steps.filter((s) => s.kind === "rehearsal");
assert.equal(rehearsals.length, 2);

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY7_ID), `${step.id} href must reference ${DAY7_ID}`);
  assert.ok(step.minutes > 0, `${step.id} minutes`);
  assert.ok(!step.href.includes("/admin/"), `${step.id} must not link to admin on pathway`);
}

const blockParams = staticParamsForDayBlocks().filter((p) => p.dayId === DAY7_ID);
assert.equal(blockParams.length, 4);

const conceptParams = staticParamsForDayConcepts().filter((p) => p.dayId === DAY7_ID);
assert.equal(conceptParams.length, 6);

const drillParams = staticParamsForDayDrills().filter((p) => p.dayId === DAY7_ID);
assert.equal(drillParams.length, 1);

const microParams = staticParamsForDayMicroLessons().filter((p) => p.dayId === DAY7_ID);
assert.equal(microParams.length, 1);

const rehearsalParams = staticParamsForDayRehearsals().filter((p) => p.dayId === DAY7_ID);
assert.equal(rehearsalParams.length, 2);

const exampleParams = staticParamsForDayExamples().filter((p) => p.dayId === DAY7_ID);
assert.equal(exampleParams.length, 1);

assert.equal(DAY7_MINIMUM_BLOCK_IDS[0], "b7-open-close");

console.log(
  `test-debate-prep-day7-pathway: OK (${steps.length} steps, ${blocks.length} blocks, pass1 stub study)`,
);
