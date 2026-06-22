/**
 * Day 4 debate-prep Pass 2+3 — block study, claims gates, pathway UI sanity.
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
import { DAY4_FORUM_TRANSCRIPT_CLAIMS_GATE } from "../src/lib/election-plan/debate-prep-day4-forum-intelligence-copy";
import { DEBATE_PREP_DAY4_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day4-release";
import { buildDay4ForumPipelineSurface } from "../src/lib/election-plan/load-day4-forum-pipeline-surface";
import {
  DAY4_BLOCK_STUDY,
  getDay4BlockStudy,
  listDay4BlockStudyIds,
} from "../src/lib/election-plan/debatePrepDay4BlockStudy";
import {
  DAY4_OPPONENT_EXAMPLE_STUDY,
  getDay4OpponentExampleStudy,
} from "../src/lib/election-plan/debatePrepDay4OpponentExampleStudy";
import { listDayBlockPhaseParams } from "../src/lib/election-plan/debatePrepBlockPhase";
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
assert.ok(DEBATE_PREP_DAY4_RELEASE_VERSION.includes("pass4"));

const optionalExample = steps.find((s) => s.kind === "example");
assert.ok(optionalExample, "Day 4 should have optional example");
assert.ok(isDay4PathwayStepOptional(optionalExample!.id));

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY4_ID), `${step.id} href must reference ${DAY4_ID}`);
  assert.ok(step.minutes > 0, `${step.id} minutes`);
  assert.ok(!step.href.includes("/admin/"), `${step.id} must not link to admin on pathway`);
}

// Pass 2 — block study depth
const blockStudyIds = listDay4BlockStudyIds();
assert.equal(blockStudyIds.length, 4, "four block study guides");
for (const blockId of blockStudyIds) {
  const study = getDay4BlockStudy(blockId);
  assert.ok(study, `${blockId} study exists`);
  assert.ok(study!.phases.length >= 3, `${blockId} has phased study`);
  assert.ok(study!.deepSections.length >= 4, `${blockId} has deep sections`);
  assert.ok(study!.claimsGate && study!.claimsGate.length >= 4, `${blockId} has claims gate lines`);
  assert.ok(
    study!.claimsGate!.some((line) => line.includes("internal tactical intelligence") || line.includes("claims-gated")),
    `${blockId} encodes forum intel labeling`,
  );
}

const phaseCounts = blockStudyIds.flatMap((blockId) => listDayBlockPhaseParams(DAY4_ID, blockId));
assert.equal(phaseCounts.length, 17, "Day 4 phase routes: 6+4+3+4");

// ex4-forum example study
const exStudy = getDay4OpponentExampleStudy("ex4-forum");
assert.ok(exStudy, "ex4-forum study exists");
assert.ok(exStudy!.phases.length >= 4, "ex4-forum has 4+ phases");
assert.ok(exStudy!.claimsGate && exStudy!.claimsGate.length >= 4, "ex4-forum claims gate");

assert.ok(DAY4_FORUM_TRANSCRIPT_CLAIMS_GATE.length >= 4, "shared claims gate copy");
assert.ok(Object.keys(DAY4_BLOCK_STUDY).length === 4);
assert.ok(Object.keys(DAY4_OPPONENT_EXAMPLE_STUDY).length === 1);

// Pass 4 — forum pipeline surface (claims-gated Kelly surface)
const surface = buildDay4ForumPipelineSurface();
assert.ok(surface.pipeline.artifactReady, "forum artifact should exist in dev data");
assert.ok(surface.notecardLines.length >= 1, "notecard should have green capitalize lines when v1 ready");
for (const line of surface.notecardLines) {
  assert.equal(line.claimsStatus, "green");
  assert.ok(line.timestamp.length > 0);
  assert.ok(line.sourceLabel.length > 0);
}
for (const q of surface.verifiedHammerLines) {
  assert.equal(q.claimsStatus, "verified");
}
assert.equal(surface.sosMappingRows.length, 5);
assert.equal(surface.bioRows.length, 2);
assert.ok(surface.internalIntelQuoteCount >= 0);

console.log(
  `test-debate-prep-day4-pathway: OK (${steps.length} steps, ${blocks.length} blocks, ${phaseCounts.length} phases)`,
);
