/**
 * Day 6 debate-prep Pass 1–2 — pathway spine, block study, simulation surface.
 */
import assert from "node:assert/strict";
import {
  buildDay6PathwaySteps,
  DAY6_DAY5_REVIEW,
  DAY6_DAY7_TEASER,
  DAY6_EVENING_REVIEW,
  DAY6_MINIMUM_BLOCK_IDS,
  getFirstDay6PathwayStep,
  getNextDay6PathwayStep,
} from "../src/lib/election-plan/day6-learning-pathway";
import { DEBATE_PREP_DAY6_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day6-release";
import { DAY6_PATHWAY_STORAGE_KEY } from "../src/lib/election-plan/day6-pathway-progress";
import { isKellyDay6StreamlinedPath } from "../src/lib/election-plan/kelly-facing-ui";
import {
  DAY6_APA_SIM_FRAME,
  DAY6_DEBRIEF_PROMPTS,
  DAY6_SIM_TRAP_LANE_IDS,
} from "../src/lib/election-plan/debate-prep-day6-simulation-copy";
import { buildDay6SimulationSurface } from "../src/lib/election-plan/load-day6-simulation-surface";
import {
  DAY6_ID,
  listDayBlocksDrillDown,
  listDayCommandDrillsDrillDown,
  listDayConcepts,
  listDayMicroLessonsDrillDown,
  listDayRehearsalScripts,
  dayHasDrillDownPages,
} from "../src/lib/election-plan/debatePrepDayDrillDown";
import { getDay6BlockStudy, listDay6BlockStudyIds } from "../src/lib/election-plan/debatePrepDay6BlockStudy";
import { listDayBlockPhaseParams } from "../src/lib/election-plan/debatePrepBlockPhase";
import {
  staticParamsForDayBlocks,
  staticParamsForDayConcepts,
  staticParamsForDayDrills,
  staticParamsForDayMicroLessons,
  staticParamsForDayRehearsals,
  DRILL_DOWN_DAY_IDS,
} from "../src/lib/election-plan/debatePrepDayStaticParams";

assert.ok(dayHasDrillDownPages(DAY6_ID), "Day 6 should have drill-down pages");
assert.ok(DRILL_DOWN_DAY_IDS.includes(DAY6_ID), "Day 6 in static params day ids");

const blocks = listDayBlocksDrillDown(DAY6_ID);
assert.equal(blocks.length, 5, "Day 6 should have 5 blocks");
assert.equal(listDayConcepts(DAY6_ID).length, 6);
assert.equal(listDayRehearsalScripts(DAY6_ID).length, 1);
assert.equal(listDayCommandDrillsDrillDown(DAY6_ID).length, 1);
assert.equal(listDayMicroLessonsDrillDown(DAY6_ID).length, 1);

const steps = buildDay6PathwaySteps();
assert.ok(steps.length >= 9, "Day 6 pathway should have 5 blocks + tail steps");
assert.equal(getFirstDay6PathwayStep().id, DAY6_MINIMUM_BLOCK_IDS[0] === "b6-sim" ? "b6-opponent-bios-lock" : DAY6_MINIMUM_BLOCK_IDS[0]);
assert.equal(getFirstDay6PathwayStep().id, "b6-opponent-bios-lock");
assert.ok(getNextDay6PathwayStep(steps[0]!.id), "first step should have a next step");
assert.equal(DAY6_EVENING_REVIEW.length, 3);
assert.ok(DAY6_DAY5_REVIEW.href.includes("day-5-anticipate-and-capitalize"));
assert.ok(DAY6_DAY7_TEASER.href.includes("day-7-refine-and-steal-show"));
assert.equal(DEBATE_PREP_DAY6_RELEASE_VERSION, "day-6-full-simulation-pass3");
assert.ok(isKellyDay6StreamlinedPath(), "Kelly Day 6 streamlined path enabled");
assert.ok(DAY6_PATHWAY_STORAGE_KEY.includes("day6"));
assert.ok(DAY6_APA_SIM_FRAME.includes("APA"));
assert.ok(DAY6_DEBRIEF_PROMPTS.length >= 5);

const sim = buildDay6SimulationSurface();
assert.ok(sim.segments.length >= 8, "sim surface has ≥8 segments");
assert.ok(sim.segments.some((s) => s.kind === "opening"), "sim includes opening");
assert.ok(sim.segments.some((s) => s.kind === "closing"), "sim includes closing");
assert.equal(sim.trapLaneCount, DAY6_SIM_TRAP_LANE_IDS.length);
assert.ok(sim.bookends.opening.durationSeconds === 90);
assert.ok(sim.bookends.closing.durationSeconds === 60);
assert.ok(sim.bookends.opening.script.length > 40);
assert.ok(sim.bookends.closing.script.includes("clerks") || sim.bookends.closing.script.includes("Clerks"));

for (const seg of sim.segments) {
  if (seg.href) {
    assert.ok(seg.href.startsWith("/election-plan/"), `${seg.label} href stays in EP`);
    assert.ok(!seg.href.includes("/admin/"), `${seg.label} no admin href`);
  }
}

for (const blockId of listDay6BlockStudyIds()) {
  const study = getDay6BlockStudy(blockId);
  assert.ok(study?.claimsGate?.length, `${blockId} claimsGate`);
  assert.ok(study?.phases.length >= 3, `${blockId} phases`);
  assert.ok(study?.deepSections && study.deepSections.length >= 3, `${blockId} deepSections`);
  assert.equal(listDayBlockPhaseParams(DAY6_ID, blockId).length, study!.phases.length);
}

const microLesson = steps.find((s) => s.kind === "micro-lesson");
assert.ok(microLesson?.href.includes("d6-stress"), "pathway includes stress micro-lesson");

const commandDrill = steps.find((s) => s.kind === "command-drill");
assert.ok(commandDrill?.href.includes("d6-stuck-bridge"), "pathway includes stuck-bridge drill");

const rehearsal = steps.find((s) => s.kind === "rehearsal");
assert.ok(rehearsal?.href.includes("rehearse-open-close-sim"), "pathway includes open-close rehearsal");

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY6_ID), `${step.id} href must reference ${DAY6_ID}`);
  assert.ok(step.minutes > 0, `${step.id} minutes`);
  assert.ok(!step.href.includes("/admin/"), `${step.id} must not link to admin on pathway`);
}

const blockParams = staticParamsForDayBlocks().filter((p) => p.dayId === DAY6_ID);
assert.equal(blockParams.length, 5);

const conceptParams = staticParamsForDayConcepts().filter((p) => p.dayId === DAY6_ID);
assert.equal(conceptParams.length, 6);

const drillParams = staticParamsForDayDrills().filter((p) => p.dayId === DAY6_ID);
assert.equal(drillParams.length, 1);

const microParams = staticParamsForDayMicroLessons().filter((p) => p.dayId === DAY6_ID);
assert.equal(microParams.length, 1);

const rehearsalParams = staticParamsForDayRehearsals().filter((p) => p.dayId === DAY6_ID);
assert.equal(rehearsalParams.length, 1);

console.log(
  `test-debate-prep-day6-pathway: OK (${steps.length} steps, ${blocks.length} blocks, ${sim.segments.length} sim segments)`,
);
