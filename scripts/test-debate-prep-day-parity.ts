/**
 * Day 1 vs Day 2 debate-prep parity — depth and breadth should match.
 */
import assert from "node:assert/strict";

import {
  buildDay1PathwaySteps,
  DAY1_EVENING_REVIEW,
  DAY1_MINIMUM_BLOCK_IDS,
} from "../src/lib/election-plan/day1-learning-pathway";
import {
  buildDay2PathwaySteps,
  DAY2_EVENING_REVIEW,
  DAY2_MINIMUM_BLOCK_IDS,
} from "../src/lib/election-plan/day2-learning-pathway";
import { DAY1_BLOCK_STUDY, getDay1BlockStudy } from "../src/lib/election-plan/debatePrepDay1BlockStudy";
import { DAY2_BLOCK_STUDY, getDay2BlockStudy } from "../src/lib/election-plan/debatePrepDay2BlockStudy";
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
  for (const id of blockIds) {
    const study = getStudy(id);
    if (!study) {
      throw new Error(`${id} block study missing`);
    }
    assert.ok((study.professorLead ?? "").length > 20, `${id} professorLead`);
    assert.ok(study.phases.length >= 3, `${id} should have >= 3 phased sections`);
    assert.ok(study.keyTakeaways.length >= 3, `${id} key takeaways`);
    phases += study.phases.length;
    if (study.claimsGate?.length) claimsGates += 1;
  }
  return { phases, claimsGates };
}

const day1Steps = buildDay1PathwaySteps();
const day2Steps = buildDay2PathwaySteps();
const day1Kinds = countByKind(day1Steps);
const day2Kinds = countByKind(day2Steps);

assert.equal(listDayBlocksDrillDown(DAY1_ID).length, 5);
assert.equal(listDayBlocksDrillDown(DAY2_ID).length, 5);
assert.equal(listDayConcepts(DAY1_ID).length, 5);
assert.equal(listDayConcepts(DAY2_ID).length, 5);
assert.ok(listDayMicroLessonsDrillDown(DAY2_ID).length >= listDayMicroLessonsDrillDown(DAY1_ID).length);
assert.ok(listDayRehearsalScripts(DAY2_ID).length >= listDayRehearsalScripts(DAY1_ID).length);

assert.equal(day1Kinds.block, 5);
assert.equal(day2Kinds.block, 5);
assert.equal(day1Kinds.rehearsal, 2);
assert.equal(day2Kinds.rehearsal, 2);
assert.ok((day2Kinds.drill ?? 0) >= (day1Kinds.drill ?? 0), "Day 2 drills should be >= Day 1");
assert.ok((day2Kinds.example ?? 0) >= (day1Kinds.example ?? 0), "Day 2 optional examples should be >= Day 1");
assert.equal(day1Kinds.close, 1);
assert.equal(day2Kinds.close, 1);

assert.ok(day2Steps.length >= day1Steps.length, "Day 2 pathway should be at least as long as Day 1");

const day1Minutes = day1Steps.reduce((sum, s) => sum + s.minutes, 0);
const day2Minutes = day2Steps.reduce((sum, s) => sum + s.minutes, 0);
assert.ok(day2Minutes >= day1Minutes * 0.85, "Day 2 total pathway minutes should be comparable to Day 1");

assert.equal(DAY1_EVENING_REVIEW.length, 3);
assert.equal(DAY2_EVENING_REVIEW.length, 3);
assert.equal(DAY1_MINIMUM_BLOCK_IDS.length, 2);
assert.equal(DAY2_MINIMUM_BLOCK_IDS.length, 2);

const day1Blocks = Object.keys(DAY1_BLOCK_STUDY);
const day2Blocks = Object.keys(DAY2_BLOCK_STUDY);
assert.equal(day1Blocks.length, 5);
assert.equal(day2Blocks.length, 5);

const d1Depth = studyDepthScore(day1Blocks, getDay1BlockStudy);
const d2Depth = studyDepthScore(day2Blocks, getDay2BlockStudy);
assert.ok(d2Depth.phases >= d1Depth.phases * 0.9, "Day 2 block study phases should match Day 1 depth");
assert.ok(d2Depth.claimsGates >= 2, "Day 2 should have claims gates on sensitive blocks");

assert.ok(getDay2OpponentExampleStudy("ex2-hammer-rank")?.claimsGate?.length, "Day 2 hammer example claims gate");
assert.ok(getDay2OpponentExampleStudy("ex2-pakko-split")?.claimsGate?.length, "Day 2 pakko example claims gate");
assert.ok(
  (getDay2OpponentExampleStudy("ex2-hammer-rank")?.claimsGate?.length ?? 0) >= 1,
  "Day 2 example depth should include claims gates (Day 1 optional example is lighter)",
);

for (const step of day2Steps) {
  assert.ok(!step.href.includes("/admin/"), `Day 2 pathway step ${step.id} must not link to admin`);
}

console.log(
  `test-debate-prep-day-parity: OK (D1 ${day1Steps.length} steps / ${day1Minutes}m · D2 ${day2Steps.length} steps / ${day2Minutes}m · study phases ${d1Depth.phases}/${d2Depth.phases})`,
);
