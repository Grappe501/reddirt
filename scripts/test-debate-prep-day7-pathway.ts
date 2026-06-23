/**
 * Day 7 debate-prep Pass 1–4 — pathway, block study, polish surface, pathway UI, product panels.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildDay7PathwaySteps,
  DAY7_DAY6_REVIEW,
  DAY7_DAY8_TEASER,
  DAY7_EVENING_REVIEW,
  DAY7_MINIMUM_BLOCK_IDS,
  getFirstDay7PathwayStep,
  getNextDay7PathwayStep,
  isDay7PathwayStepOptional,
} from "../src/lib/election-plan/day7-learning-pathway";
import { DEBATE_PREP_DAY7_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day7-release";
import { DAY6_SIM_DEBRIEF_STORAGE_KEY } from "../src/lib/election-plan/debate-prep-day6-simulation-copy";
import {
  DAY7_CLAIMS_FINAL_STORAGE_KEY,
  DAY7_QUOTABLE_LOCK_STORAGE_KEY,
} from "../src/lib/election-plan/debate-prep-day7-polish-copy";
import { DAY7_PATHWAY_STORAGE_KEY } from "../src/lib/election-plan/day7-pathway-progress";
import { debatePrepHubPrimaryDayId } from "../src/lib/election-plan/debate-prep-hub-tonight";
import {
  DAY7_CLOSING_BEATS,
  DAY7_DEBRIEF_IMPORT_LABEL,
  DAY7_PEAK_END_FRAME,
  DAY7_POLISH_CLAIMS_GATE,
} from "../src/lib/election-plan/debate-prep-day7-polish-copy";
import { buildDay7PolishSurface } from "../src/lib/election-plan/load-day7-polish-surface";
import { isKellyDay7StreamlinedPath } from "../src/lib/election-plan/kelly-facing-ui";
import {
  DAY7_CONCEPT_ANCHORS,
  DAY7_MICRO_LESSON_ANCHORS,
} from "../src/lib/election-plan/day7-supplement-anchors";
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
import { DAY7_BLOCK_STUDY, getDay7BlockStudy, listDay7BlockStudyIds } from "../src/lib/election-plan/debatePrepDay7BlockStudy";
import {
  getDay7OpponentExampleStudy,
  listDay7OpponentExampleStudyIds,
} from "../src/lib/election-plan/debatePrepDay7OpponentExampleStudy";
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
assert.equal(DEBATE_PREP_DAY7_RELEASE_VERSION, "day-7-refine-and-steal-show-v1.0.0");
assert.ok(isKellyDay7StreamlinedPath(), "Kelly Day 7 streamlined path enabled");
assert.ok(DAY7_PATHWAY_STORAGE_KEY.includes("day7"));
assert.ok(DAY7_PEAK_END_FRAME.includes("Peak-end"));
assert.ok(DAY7_POLISH_CLAIMS_GATE.length >= 4);
assert.equal(DAY7_CLOSING_BEATS.length, 3);
assert.ok(DAY7_DEBRIEF_IMPORT_LABEL.includes("Day 6"));

const polish = buildDay7PolishSurface();
assert.ok(polish.bookends.opening.durationSeconds === 90);
assert.ok(polish.bookends.closing.durationSeconds === 60);
assert.ok(polish.bookends.opening.script.length > 40);
assert.ok(polish.bookends.closing.script.includes("clerks") || polish.bookends.closing.script.includes("Clerks"));
assert.ok(polish.debriefPrompts.length >= 5);
assert.ok(polish.quotableCandidates.length >= 2);
assert.ok(polish.hasDay6BookendPullForward);
assert.ok(polish.openingBeats.length === 3);
assert.ok(polish.closingBeats.length === 3);
assert.ok(polish.day6SimHref.includes("day-6-full-simulation"));
assert.ok(polish.day6DebriefBlockHref.includes("b6-sim"));
assert.ok(!polish.day6SimHref.includes("/admin/"));

for (const blockId of listDay7BlockStudyIds()) {
  const study = getDay7BlockStudy(blockId);
  assert.ok(study && study.phases.length >= 3, `${blockId} full study phases`);
  assert.ok(study.claimsGate?.length, `${blockId} claimsGate`);
  assert.ok(study.deepSections && study.deepSections.length >= 3, `${blockId} deepSections`);
  assert.equal(listDayBlockPhaseParams(DAY7_ID, blockId).length, study.phases.length);
}

assert.equal(Object.keys(DAY7_BLOCK_STUDY).length, 4);

const ex7 = getDay7OpponentExampleStudy("ex7-show-steal");
assert.ok(ex7, "ex7-show-steal study");
assert.ok(ex7!.phases.length >= 4, "ex7-show-steal has 4+ phases");
assert.ok((ex7!.deepSections?.length ?? 0) >= 3);
assert.ok(ex7!.claimsGate?.length);
assert.equal(listDay7OpponentExampleStudyIds().length, 1);

const microLesson = steps.find((s) => s.kind === "micro-lesson");
assert.ok(microLesson?.href.includes("d7-steal"), "pathway includes steal micro-lesson");

const commandDrill = steps.find((s) => s.kind === "command-drill");
assert.ok(commandDrill?.href.includes("d7-close"), "pathway includes closing drill");

const example = steps.find((s) => s.kind === "example");
assert.ok(example?.href.includes("ex7-show-steal"), "pathway includes show-steal example");
assert.ok(isDay7PathwayStepOptional("ex7-show-steal"), "show-steal example is optional");

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

const root = path.join(process.cwd(), "src");
const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
const panelsFile = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanDay7Panels.tsx"), "utf8");
assert.ok(blockPage.includes("ElectionPlanDay7BlockEmbed"), "block page wires Day 7 product embed");
assert.ok(panelsFile.includes("ElectionPlanDay7BookendsPolishPanel"), "Day 7 panels include bookends polish");
assert.ok(panelsFile.includes("ElectionPlanDay7DebriefImportPanel"), "Day 7 panels include debrief import");
assert.ok(panelsFile.includes("ElectionPlanQuotableLockInPanel"), "Day 7 panels include quotable lock-in");
assert.ok(panelsFile.includes("ElectionPlanClaimsFinalCutPanel"), "Day 7 panels include claims final cut");
assert.ok(DAY6_SIM_DEBRIEF_STORAGE_KEY.includes("day6"));
assert.ok(DAY7_QUOTABLE_LOCK_STORAGE_KEY.includes("day7"));
assert.ok(DAY7_CLAIMS_FINAL_STORAGE_KEY.includes("day7"));

assert.equal(debatePrepHubPrimaryDayId("2026-06-25"), DAY7_ID);
const v8Source = fs.readFileSync(path.join(root, "lib/election-plan/debate-prep-system-v8.ts"), "utf8");
assert.ok(
  v8Source.includes('DEBATE_PREP_SYSTEM_V8_VERSION = "debate-prep-system-v8.7-day7-refine-and-steal-show-v1.0.0"'),
  "v8 system version should match Day 7 v1.0.0 sign-off",
);
assert.equal(Object.keys(DAY7_CONCEPT_ANCHORS).length, 6);
assert.equal(Object.keys(DAY7_MICRO_LESSON_ANCHORS).length, 1);

console.log(
  `test-debate-prep-day7-pathway: OK (${steps.length} steps, ${blocks.length} blocks, v1.0.0 production sign-off)`,
);
