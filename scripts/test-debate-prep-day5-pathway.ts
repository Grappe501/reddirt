/**
 * Day 5 debate-prep Pass 1 — pathway spine, drill-down registry, route unlock.
 */
import assert from "node:assert/strict";
import {
  buildDay5PathwaySteps,
  DAY5_DAY4_REVIEW,
  DAY5_DAY6_TEASER,
  DAY5_EVENING_REVIEW,
  DAY5_MINIMUM_BLOCK_IDS,
  getFirstDay5PathwayStep,
  getNextDay5PathwayStep,
  isDay5PathwayStepOptional,
} from "../src/lib/election-plan/day5-learning-pathway";
import { DEBATE_PREP_DAY5_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day5-release";
import {
  DAY5_ID,
  listDayBlocksDrillDown,
  listDayCommandDrillsDrillDown,
  listDayConcepts,
  listDayExampleIds,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
} from "../src/lib/election-plan/debatePrepDayDrillDown";
import { staticParamsForDayBlocks, staticParamsForDayConcepts, staticParamsForDayDrills, staticParamsForDayExamples, staticParamsForDayMicroLessons, staticParamsForDayRehearsals } from "../src/lib/election-plan/debatePrepDayStaticParams";

const blocks = listDayBlocksDrillDown(DAY5_ID);
assert.equal(blocks.length, 4, "Day 5 should have 4 blocks");
assert.equal(listDayConcepts(DAY5_ID).length, 6);
assert.equal(listDayRehearsalScripts(DAY5_ID).length, 1);
assert.equal(listDayCommandDrillsDrillDown(DAY5_ID).length, 1);
assert.equal(listDayMicroLessonsDrillDown(DAY5_ID).length, 1);
assert.equal(listDayExampleIds(DAY5_ID).length, 1);

const steps = buildDay5PathwaySteps();
assert.ok(steps.length >= 9, "Day 5 pathway should have blocks + tail steps");
assert.equal(getFirstDay5PathwayStep().id, DAY5_MINIMUM_BLOCK_IDS[0]);
assert.ok(getNextDay5PathwayStep(steps[0]!.id), "first step should have a next step");
assert.equal(DAY5_EVENING_REVIEW.length, 3);
assert.ok(DAY5_DAY6_TEASER.href.includes("day-6-full-simulation"));
assert.ok(DAY5_DAY4_REVIEW.href.includes("day-4-forum-intelligence"));
assert.equal(DEBATE_PREP_DAY5_RELEASE_VERSION, "day-5-anticipate-and-capitalize-v1.0.0-pass1");

const optionalExample = steps.find((s) => s.kind === "example");
assert.ok(optionalExample, "Day 5 should have optional example");
assert.ok(isDay5PathwayStepOptional(optionalExample!.id));

const commandDrill = steps.find((s) => s.kind === "command-drill");
assert.ok(commandDrill?.href.includes("d5-pileon-pivot"), "pathway includes pile-on command drill");

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY5_ID), `${step.id} href must reference ${DAY5_ID}`);
  assert.ok(step.minutes > 0, `${step.id} minutes`);
  assert.ok(!step.href.includes("/admin/"), `${step.id} must not link to admin on pathway`);
}

const blockParams = staticParamsForDayBlocks().filter((p) => p.dayId === DAY5_ID);
assert.equal(blockParams.length, 4);

const conceptParams = staticParamsForDayConcepts().filter((p) => p.dayId === DAY5_ID);
assert.equal(conceptParams.length, 6);

const drillParams = staticParamsForDayDrills().filter((p) => p.dayId === DAY5_ID);
assert.equal(drillParams.length, 1);

const exampleParams = staticParamsForDayExamples().filter((p) => p.dayId === DAY5_ID);
assert.equal(exampleParams.length, 1);

const microParams = staticParamsForDayMicroLessons().filter((p) => p.dayId === DAY5_ID);
assert.equal(microParams.length, 1);

const rehearsalParams = staticParamsForDayRehearsals().filter((p) => p.dayId === DAY5_ID);
assert.equal(rehearsalParams.length, 1);

console.log(
  `test-debate-prep-day5-pathway: OK (${steps.length} steps, ${blocks.length} blocks, ${conceptParams.length} concepts)`,
);
