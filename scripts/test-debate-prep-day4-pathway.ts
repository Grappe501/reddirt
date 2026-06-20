/**
 * Day 4 debate-prep Pass 1 — pathway spine + drill-down registry sanity.
 */
import assert from "node:assert/strict";
import {
  buildDay4PathwaySteps,
  DAY4_DAY5_TEASER,
  DAY4_EVENING_REVIEW,
  DAY4_MINIMUM_BLOCK_IDS,
  getFirstDay4PathwayStep,
  getNextDay4PathwayStep,
  isDay4PathwayStepOptional,
} from "../src/lib/election-plan/day4-learning-pathway";
import { DEBATE_PREP_DAY4_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day4-release";
import {
  DAY4_ID,
  listDayBlocksDrillDown,
  listDayCommandDrillsDrillDown,
  listDayConcepts,
  listDayExampleIds,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
} from "../src/lib/election-plan/debatePrepDayDrillDown";

const blocks = listDayBlocksDrillDown(DAY4_ID);
assert.equal(blocks.length, 4, "Day 4 should have 4 blocks");
assert.equal(listDayConcepts(DAY4_ID).length, 6);
assert.equal(listDayRehearsalScripts(DAY4_ID).length, 1);
assert.equal(listDayCommandDrillsDrillDown(DAY4_ID).length, 0);
assert.equal(listDayMicroLessonsDrillDown(DAY4_ID).length, 1);
assert.equal(listDayExampleIds(DAY4_ID).length, 1);

const steps = buildDay4PathwaySteps();
assert.ok(steps.length >= 7, "Day 4 pathway should have blocks + micro-lesson + rehearsal + close");
assert.equal(getFirstDay4PathwayStep().id, DAY4_MINIMUM_BLOCK_IDS[0]);
assert.ok(getNextDay4PathwayStep(steps[0]!.id), "first step should have a next step");
assert.equal(DAY4_EVENING_REVIEW.length, 3);
assert.ok(DAY4_DAY5_TEASER.href.includes("day-5-anticipate-and-capitalize"));
assert.ok(DEBATE_PREP_DAY4_RELEASE_VERSION.includes("pass1"));

const optionalExample = steps.find((s) => s.kind === "example");
assert.ok(optionalExample, "Day 4 should have optional example");
assert.ok(isDay4PathwayStepOptional(optionalExample!.id));

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY4_ID), `${step.id} href must reference ${DAY4_ID}`);
  assert.ok(step.minutes > 0, `${step.id} minutes`);
  assert.ok(!step.href.includes("/admin/"), `${step.id} must not link to admin on pathway`);
}

console.log(`test-debate-prep-day4-pathway: OK (${steps.length} steps, ${blocks.length} blocks)`);
