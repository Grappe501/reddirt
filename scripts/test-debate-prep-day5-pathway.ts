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
import { DEBATE_PREP_DAY5_RELEASE_VERSION, DEBATE_PREP_DAY5_PATHWAY_STORAGE_VERSION } from "../src/lib/election-plan/debate-prep-day5-release";
import { DAY5_PATHWAY_STORAGE_KEY } from "../src/lib/election-plan/day5-pathway-progress";
import {
  buildDay5CapitalizeSurface,
  DAY5_TARGET_PAIR_COUNT,
  DAY5_TRAP_LANE_IDS,
} from "../src/lib/election-plan/load-day5-capitalize-surface";
import { epDebatePrepTutorPresetHref, DEBATE_PREP_TUTOR_PRESET_FORUM_HAMMER } from "../src/lib/election-plan/debate-prep-links";
import { isKellyDay5StreamlinedPath } from "../src/lib/election-plan/kelly-facing-ui";
import {
  DAY5_APA_STATEWIDE_BROADCAST_FRAME,
  DAY5_HUB_TONIGHT_SUMMARY,
} from "../src/lib/election-plan/debate-prep-day5-anticipate-copy";
import {
  DAY5_ID,
  listDayBlocksDrillDown,
  listDayCommandDrillsDrillDown,
  listDayConcepts,
  listDayExampleIds,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
} from "../src/lib/election-plan/debatePrepDayDrillDown";
import { getDay5BlockStudy, listDay5BlockStudyIds } from "../src/lib/election-plan/debatePrepDay5BlockStudy";
import { getDay5OpponentExampleStudy } from "../src/lib/election-plan/debatePrepDay5OpponentExampleStudy";
import { listDayBlockPhaseParams } from "../src/lib/election-plan/debatePrepBlockPhase";
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
assert.equal(DEBATE_PREP_DAY5_RELEASE_VERSION, "day-5-anticipate-and-capitalize-v1.0.0");
assert.ok(isKellyDay5StreamlinedPath(), "Kelly Day 5 streamlined path enabled");
assert.ok(DAY5_HUB_TONIGHT_SUMMARY.includes("APA"));
assert.ok(DAY5_APA_STATEWIDE_BROADCAST_FRAME.includes("Press Association"));
assert.ok(DAY5_PATHWAY_STORAGE_KEY.includes(DEBATE_PREP_DAY5_PATHWAY_STORAGE_VERSION));
assert.ok(DAY5_PATHWAY_STORAGE_KEY.includes("day5"));

const capitalize = buildDay5CapitalizeSurface();
assert.equal(capitalize.pairs.length, DAY5_TARGET_PAIR_COUNT, "sheet has eight pair slots");
for (const row of capitalize.pairs.filter((p) => !p.isPlaceholder && p.kellyLine.trim())) {
  assert.equal(row.claimsStatus, "green");
  assert.ok(row.sourceLabel.length > 0);
}
assert.equal(capitalize.trapLanes.length, 4);
for (const lane of capitalize.trapLanes) {
  assert.ok(DAY5_TRAP_LANE_IDS.includes(lane.laneId));
  assert.ok(lane.href.startsWith("/election-plan/debate-prep/trap-lanes/"));
  assert.ok(!lane.href.includes("/admin/"));
}
assert.ok(capitalize.sosQuestions.length <= 5);
for (const q of capitalize.sosQuestions) {
  assert.ok(q.questionHref.startsWith("/election-plan/debate-prep/questions/"));
}
assert.ok(
  epDebatePrepTutorPresetHref(DEBATE_PREP_TUTOR_PRESET_FORUM_HAMMER).includes("preset=forum-hammer-moot"),
  "moot handoff stays on election-plan tutor",
);

for (const blockId of listDay5BlockStudyIds()) {
  const study = getDay5BlockStudy(blockId);
  assert.ok(study?.claimsGate?.length, `${blockId} claimsGate`);
  assert.ok(study?.phases.length, `${blockId} phases`);
  assert.equal(listDayBlockPhaseParams(DAY5_ID, blockId).length, study!.phases.length);
}

const ex5 = getDay5OpponentExampleStudy("ex5-pileon");
assert.ok(ex5 && ex5.phases.length >= 4, "ex5-pileon deep study");

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
