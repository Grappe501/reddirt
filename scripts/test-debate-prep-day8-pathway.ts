/**
 * Day 8 debate-prep Pass 1–4 — pathway spine, three SOS domains, course-mode UI, interactive panels.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildDay8PathwaySteps,
  DAY8_DAY7_REVIEW,
  DAY8_EVENING_REVIEW,
  DAY8_MINIMUM_SECTION_IDS,
  DAY8_PM_HANDOFF,
  getFirstDay8PathwayStep,
  getNextDay8PathwayStep,
  totalDay8PathwayMinutes,
} from "../src/lib/election-plan/day8-learning-pathway";
import { DAY8_PATHWAY_STORAGE_KEY } from "../src/lib/election-plan/day8-pathway-progress";
import {
  DAY8_ARKANSAS_PEOPLE_FRAME,
  DAY8_AUDIBLE_CARD,
  DAY8_DOMAIN_COVERAGE_CHECK,
  DAY8_SEVEN_DAY_DEEP_LINKS,
} from "../src/lib/election-plan/debate-prep-day8-crash-copy";
import { DEBATE_PREP_DAY8_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day8-release";
import {
  DAY8_SOS_DOMAIN_CARDS,
  DAY8_SOS_THREE_DOMAINS_FRAME,
} from "../src/lib/election-plan/debate-prep-day8-sos-three-domains";
import { buildDay8RunSegments } from "../src/lib/election-plan/debate-prep-day8-run-segments";
import { buildDay8CrashCourseSurface } from "../src/lib/election-plan/load-day8-crash-course-surface";
import { isKellyDay8CrashCoursePath, isKellyDay8StreamlinedPath } from "../src/lib/election-plan/kelly-facing-ui";
import {
  DAY8_CRASH_SECTION_SPECS,
  DAY8_SECTION_IDS,
} from "../src/lib/election-plan/debatePrepDay8Registry";
import {
  DAY8_ID,
  listDayBlocksDrillDown,
  listDayConcepts,
  listDayRehearsalScripts,
  dayHasDrillDownPages,
} from "../src/lib/election-plan/debatePrepDayDrillDown";
import { getDay8BlockStudy, listDay8BlockStudyIds } from "../src/lib/election-plan/debatePrepDay8BlockStudy";
import { listDayBlockPhaseParams } from "../src/lib/election-plan/debatePrepBlockPhase";
import {
  staticParamsForDayBlocks,
  staticParamsForDayConcepts,
  staticParamsForDayRehearsals,
  DRILL_DOWN_DAY_IDS,
} from "../src/lib/election-plan/debatePrepDayStaticParams";

assert.ok(dayHasDrillDownPages(DAY8_ID), "Day 8 should have drill-down pages");
assert.ok(DRILL_DOWN_DAY_IDS.includes(DAY8_ID), "Day 8 in static params day ids");

const blocks = listDayBlocksDrillDown(DAY8_ID);
assert.equal(blocks.length, 9, "Day 8 should have 9 crash course sections");
assert.equal(DAY8_CRASH_SECTION_SPECS.length, 9);
assert.deepEqual(DAY8_SECTION_IDS, blocks.map((b) => b.blockId));
assert.equal(listDayConcepts(DAY8_ID).length, 7);
assert.equal(listDayRehearsalScripts(DAY8_ID).length, 1);
assert.equal(DAY8_SOS_DOMAIN_CARDS.length, 3);

const steps = buildDay8PathwaySteps();
assert.equal(steps.length, 10, "9 sections + course complete");
assert.equal(getFirstDay8PathwayStep().id, "s8-orient");
assert.ok(getNextDay8PathwayStep("s8-orient")?.id === "s8-pre-debate");
assert.equal(DEBATE_PREP_DAY8_RELEASE_VERSION, "day-8-crash-course-v1.0.0");
assert.ok(isKellyDay8StreamlinedPath());
assert.ok(isKellyDay8CrashCoursePath());
assert.ok(DAY8_PATHWAY_STORAGE_KEY.includes("day8"));
assert.ok(DAY8_SOS_THREE_DOMAINS_FRAME.includes("business services"));
assert.ok(DAY8_SOS_THREE_DOMAINS_FRAME.includes("Days 1–7"));
assert.ok(DAY8_AUDIBLE_CARD.includes("compressed seven-day"));
assert.equal(DAY8_SEVEN_DAY_DEEP_LINKS.length, 7);
assert.ok(DAY8_ARKANSAS_PEOPLE_FRAME.includes("Capitol management"));
assert.equal(DAY8_DOMAIN_COVERAGE_CHECK.length, 3);
assert.equal(DAY8_EVENING_REVIEW.length, 3);
assert.ok(DAY8_EVENING_REVIEW[0]!.includes("business services"));

const surface = buildDay8CrashCourseSurface();
assert.equal(surface.sosDomainCount, 3);
assert.ok(surface.hasThreeDomainOpening);
assert.ok(surface.hasThreeDomainSos);
assert.ok(surface.openingBeats.length >= 4);
assert.ok(surface.runSegments.filter((s) => s.kind === "sos").length === 3);
assert.equal(surface.lockSheetDomainRows.length, 3);

const runSegments = buildDay8RunSegments();
assert.ok(runSegments.length >= 8);
assert.ok(runSegments.some((s) => s.sosDomainId === "business-services"));

const sectionMinutes = DAY8_CRASH_SECTION_SPECS.reduce((sum, s) => sum + s.minutes, 0);
assert.ok(sectionMinutes >= 180 && sectionMinutes <= 200);
assert.ok(totalDay8PathwayMinutes() >= sectionMinutes);

for (const sectionId of DAY8_SECTION_IDS) {
  const study = getDay8BlockStudy(sectionId);
  assert.ok(study, `block study for ${sectionId}`);
  assert.ok(study!.phases.length >= 2, `${sectionId} has ≥2 phases`);
  assert.ok(study!.keyTakeaways.length >= 1);
}

assert.equal(listDay8BlockStudyIds().length, 9);

for (const block of blocks) {
  const phases = listDayBlockPhaseParams(DAY8_ID, block.blockId);
  assert.ok(phases.length >= 2, `${block.blockId} has phase routes`);
}

assert.equal(staticParamsForDayBlocks().filter((p) => p.dayId === DAY8_ID).length, 9);

const PASS4_PANELS = [
  "ElectionPlanDay8PersonaWallPanel.tsx",
  "ElectionPlanDay8OpeningWorkshopPanel.tsx",
  "ElectionPlanDay8MiddleGamePanel.tsx",
  "ElectionPlanDay8ClosingWorkshopPanel.tsx",
  "ElectionPlanDay8CrashRunPanel.tsx",
  "ElectionPlanDay8LockSheetPanel.tsx",
  "ElectionPlanDay8Panels.tsx",
];
const componentsDir = path.join(process.cwd(), "src/components/election-plan");
for (const file of PASS4_PANELS) {
  assert.ok(fs.existsSync(path.join(componentsDir, file)), `Pass 4 panel ${file} exists`);
}

console.log(
  `test-debate-prep-day8-pathway: OK (${steps.length} steps, ${blocks.length} sections, 3 SOS domains, v1.0.0)`,
);
