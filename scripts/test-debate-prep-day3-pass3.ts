/**
 * Day 3 debate-prep Pass 3 — linear pathway UI + day landing exit criteria.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildDay3PathwaySteps,
  DAY3_DAY4_TEASER,
  DAY3_EVENING_REVIEW,
  DAY3_MINIMUM_BLOCK_IDS,
  getFirstDay3PathwayStep,
  getNextDay3PathwayStep,
  isDay3PathwayStepOptional,
} from "../src/lib/election-plan/day3-learning-pathway";
import { DAY3_PATHWAY_STORAGE_KEY } from "../src/lib/election-plan/day3-pathway-progress";
import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";
import { DAY3_ID } from "../src/lib/election-plan/debatePrepDayDrillDown";
import { isKellyDay3StreamlinedPath } from "../src/lib/election-plan/kelly-facing-ui";
import { getDayDeepOverlay } from "../src/lib/intelligence/v4/debateWeekIntensive2026Deep";

const steps = buildDay3PathwaySteps();
assert.ok(steps.length >= 8, "Day 3 pathway should have blocks + rehearsals + close");
assert.equal(getFirstDay3PathwayStep().id, DAY3_MINIMUM_BLOCK_IDS[0]);
assert.ok(isKellyDay3StreamlinedPath(), "Kelly streamlined Day 3 flag should be on by default");
assert.ok(DEBATE_PREP_DAY3_RELEASE_VERSION.includes("day-3-superiority-map"));
assert.ok(DAY3_PATHWAY_STORAGE_KEY.includes("kelly-day3-pathway"));

const optionalExample = steps.find((s) => s.kind === "example");
assert.ok(optionalExample, "Day 3 should have optional example");
assert.ok(isDay3PathwayStepOptional(optionalExample!.id));
assert.ok(optionalExample!.label.toLowerCase().includes("optional"));

for (let i = 0; i < steps.length - 1; i++) {
  const step = steps[i]!;
  const next = getNextDay3PathwayStep(step.id);
  assert.ok(next, `${step.id} should have a next step`);
  assert.equal(next!.id, steps[i + 1]!.id);
}

assert.equal(DAY3_EVENING_REVIEW.length, 3);
assert.ok(DAY3_DAY4_TEASER.href.includes("day-4-forum-intelligence"));

const overlay = getDayDeepOverlay(DAY3_ID);
assert.ok(overlay.kellyStrengthToday.length > 10);
assert.ok(overlay.kellyWatchOut.length > 10);
assert.deepEqual([...DAY3_EVENING_REVIEW], [...overlay.eveningReview]);

for (const step of steps) {
  assert.ok(step.href.startsWith("/election-plan/"), `${step.id} href must stay in election-plan portal`);
  assert.ok(step.href.includes(DAY3_ID), `${step.id} href must reference ${DAY3_ID}`);
}

const root = path.join(process.cwd(), "src");
const panelPath = path.join(root, "components/election-plan/ElectionPlanDay3PathwayPanel.tsx");
assert.ok(fs.existsSync(panelPath), "Day 3 pathway panel should exist");
const panelSrc = fs.readFileSync(panelPath, "utf8");
assert.ok(panelSrc.includes("ElectionPlanDay3PathwayProgressBar"));
assert.ok(panelSrc.includes("showDay4Teaser"));
assert.ok(panelSrc.includes("kellyStrengthToday"));

const overviewSrc = fs.readFileSync(
  path.join(root, "components/election-plan/ElectionPlanDayDrillDownOverview.tsx"),
  "utf8",
);
assert.ok(overviewSrc.includes("ElectionPlanDay3PathwayPanel"));
assert.ok(overviewSrc.includes("ElectionPlanDay3ContinueButton"));
assert.ok(overviewSrc.includes("isKellyDay3StreamlinedPath"));

const dayPageSrc = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/page.tsx"),
  "utf8",
);
assert.ok(dayPageSrc.includes("getFirstDay3PathwayStep"));
assert.ok(dayPageSrc.includes("streamlinedDay3"));

const blockPageSrc = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
assert.ok(blockPageSrc.includes("DAY3_ID"), "block page should wire Day 3 footers");

console.log(`test-debate-prep-day3-pass3: OK (${steps.length} pathway steps, Pass 3 exit criteria)`);
