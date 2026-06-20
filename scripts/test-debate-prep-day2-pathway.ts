/**
 * Day 2 debate-prep Pass 3 — pathway spine + portal href sanity.
 */
import assert from "node:assert/strict";
import {
  buildDay2PathwaySteps,
  DAY2_DAY3_TEASER,
  DAY2_EVENING_REVIEW,
  DAY2_MINIMUM_BLOCK_IDS,
  getFirstDay2PathwayStep,
  getNextDay2PathwayStep,
} from "../src/lib/election-plan/day2-learning-pathway";
import { DAY2_ID } from "../src/lib/election-plan/debatePrepDayDrillDown";
import { isKellyDay2StreamlinedPath } from "../src/lib/election-plan/kelly-facing-ui";

const steps = buildDay2PathwaySteps();
assert.ok(steps.length >= 8, "Day 2 pathway should have blocks + rehearsals + close");
assert.equal(getFirstDay2PathwayStep().id, DAY2_MINIMUM_BLOCK_IDS[0]);
assert.ok(getNextDay2PathwayStep(steps[0]!.id), "first step should have a next step");
assert.equal(DAY2_EVENING_REVIEW.length, 3);
assert.ok(DAY2_DAY3_TEASER.href.includes("day-3-superiority-map"));
assert.ok(isKellyDay2StreamlinedPath(), "Kelly streamlined Day 2 flag should be on by default");

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY2_ID), `${step.id} href must reference ${DAY2_ID}`);
  assert.ok(step.minutes > 0, `${step.id} minutes`);
}

console.log(`test-debate-prep-day2-pathway: OK (${steps.length} steps)`);
