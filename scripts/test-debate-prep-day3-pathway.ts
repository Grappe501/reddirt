/**
 * Day 3 debate-prep Pass 1 — pathway spine + drill-down registry sanity.
 */
import assert from "node:assert/strict";
import {
  buildDay3PathwaySteps,
  DAY3_DAY4_TEASER,
  DAY3_EVENING_REVIEW,
  DAY3_MINIMUM_BLOCK_IDS,
  getFirstDay3PathwayStep,
  getNextDay3PathwayStep,
} from "../src/lib/election-plan/day3-learning-pathway";
import {
  DAY3_ID,
  listDayBlocksDrillDown,
  listDayCommandDrillsDrillDown,
  listDayConcepts,
  listDayExampleIds,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
} from "../src/lib/election-plan/debatePrepDayDrillDown";
import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";

const blocks = listDayBlocksDrillDown(DAY3_ID);
assert.equal(blocks.length, 4, "Day 3 should have 4 blocks");
assert.equal(listDayConcepts(DAY3_ID).length, 6);
assert.equal(listDayRehearsalScripts(DAY3_ID).length, 2);
assert.equal(listDayCommandDrillsDrillDown(DAY3_ID).length >= 1, true);
assert.equal(listDayMicroLessonsDrillDown(DAY3_ID).length >= 1, true);
assert.equal(listDayExampleIds(DAY3_ID).length, 1);

const steps = buildDay3PathwaySteps();
assert.ok(steps.length >= 8, "Day 3 pathway should have blocks + rehearsals + close");
assert.equal(getFirstDay3PathwayStep().id, DAY3_MINIMUM_BLOCK_IDS[0]);
assert.ok(getNextDay3PathwayStep(steps[0]!.id), "first step should have a next step");
assert.equal(DAY3_EVENING_REVIEW.length, 3);
assert.ok(DAY3_DAY4_TEASER.href.includes("day-4-forum-intelligence"));
assert.ok(DEBATE_PREP_DAY3_RELEASE_VERSION.includes("pass1"));

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY3_ID), `${step.id} href must reference ${DAY3_ID}`);
  assert.ok(step.minutes > 0, `${step.id} minutes`);
}

console.log(`test-debate-prep-day3-pathway: OK (${steps.length} steps, ${blocks.length} blocks)`);
