/**
 * Day 8 debate-prep Pass 5 — hub integration and production sign-off.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildDay8PathwaySteps,
  totalDay8PathwayMinutes,
} from "../src/lib/election-plan/day8-learning-pathway";
import { DAY8_HUB_TONIGHT_SUMMARY } from "../src/lib/election-plan/debate-prep-day8-crash-copy";
import {
  buildDebatePrepPathwayTonightFocus,
  debatePrepHubPrimaryDayId,
} from "../src/lib/election-plan/debate-prep-hub-tonight";
import { DEBATE_PREP_DAY8_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day8-release";
import {
  DAY8_CRASH_SECTION_SPECS,
  DAY8_SECTION_IDS,
} from "../src/lib/election-plan/debatePrepDay8Registry";
import { DAY8_ID, listDayBlocksDrillDown } from "../src/lib/election-plan/debatePrepDayDrillDown";
import { getDebateWeekIntensiveDay } from "../src/lib/intelligence/v4/debateWeekIntensive2026";

const DEBATE_DAY = "2026-06-26";

assert.equal(DEBATE_PREP_DAY8_RELEASE_VERSION, "day-8-command-course-v1.1.0");
const v8Source = fs.readFileSync(
  path.join(process.cwd(), "src/lib/election-plan/debate-prep-system-v8.ts"),
  "utf8",
);
assert.ok(
  v8Source.includes('DEBATE_PREP_SYSTEM_V8_VERSION = "debate-prep-system-v8.8-day8-command-course-v1.1.0"'),
  "v8 system version should match Day 8 v1.1.0 sign-off",
);

assert.equal(debatePrepHubPrimaryDayId(DEBATE_DAY), DAY8_ID);
assert.ok(DAY8_HUB_TONIGHT_SUMMARY.includes("Debate command course"));
assert.ok(buildDebatePrepPathwayTonightFocus(DEBATE_DAY).includes("Module 8 command course"));

const day8Plan = getDebateWeekIntensiveDay(DAY8_ID)!;
assert.equal(day8Plan.hoursTarget, 3);
assert.ok(day8Plan.blocks.some((b) => b.id === "b8-crash-course-am"));
assert.ok(day8Plan.subtitle.includes("§0–§8"));

assert.equal(DAY8_SECTION_IDS.length, 9);
assert.equal(listDayBlocksDrillDown(DAY8_ID).length, 9);

const sectionMinutes = DAY8_CRASH_SECTION_SPECS.reduce((sum, s) => sum + s.minutes, 0);
assert.ok(sectionMinutes >= 180 && sectionMinutes <= 200, "crash course ~3h");
assert.ok(totalDay8PathwayMinutes() >= sectionMinutes);

assert.equal(buildDay8PathwaySteps().length, 10);

const root = path.join(process.cwd(), "src");
const hubPanel = fs.readFileSync(
  path.join(root, "components/election-plan/ElectionPlanDebatePrepHubPanel.tsx"),
  "utf8",
);
const panelsFile = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanDay8Panels.tsx"), "utf8");
const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);

assert.ok(hubPanel.includes("ElectionPlanDay8StartCard"), "hub should promote Day 8 start card");
assert.ok(hubPanel.includes("focusDay8"), "hub should branch on Day 8 primary");
assert.ok(hubPanel.includes("debatePrepHubPrimaryDayId"), "hub should use calendar primary day");
assert.ok(panelsFile.includes("ElectionPlanDay8PersonaWallPanel"), "Day 8 panels include persona wall");
assert.ok(panelsFile.includes("ElectionPlanDay8LockSheetPanel"), "Day 8 panels include lock sheet export");
assert.ok(blockPage.includes("ElectionPlanDay8BlockEmbed"), "block page wires Day 8 product embed");

console.log(
  `test-debate-prep-day8-pass5: OK (${DAY8_SECTION_IDS.length} sections, ${sectionMinutes}m command course, v1.1.0 sign-off)`,
);
