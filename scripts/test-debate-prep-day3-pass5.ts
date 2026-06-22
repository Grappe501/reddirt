/**
 * Day 3 debate-prep Pass 5 — hub integration and production sign-off checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildDebatePrepPathwayTonightFocus,
  debatePrepHubPrimaryDayId,
  resolveDebatePrepTonightDayId,
} from "../src/lib/election-plan/debate-prep-hub-tonight";
import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";
import { DAY3_CONCEPT_ANCHORS } from "../src/lib/election-plan/day3-supplement-anchors";
import { DAY1_ID, DAY2_ID, DAY3_ID } from "../src/lib/election-plan/debatePrepDayDrillDown";

assert.equal(resolveDebatePrepTonightDayId("2026-06-19"), DAY1_ID);
assert.equal(resolveDebatePrepTonightDayId("2026-06-20"), DAY2_ID);
assert.equal(resolveDebatePrepTonightDayId("2026-06-21"), DAY3_ID);
assert.equal(debatePrepHubPrimaryDayId("2026-06-21"), DAY3_ID);
assert.equal(debatePrepHubPrimaryDayId("2026-06-20"), DAY2_ID);
assert.equal(debatePrepHubPrimaryDayId("2026-06-19"), DAY1_ID);

const day3Focus = buildDebatePrepPathwayTonightFocus("2026-06-21");
assert.ok(day3Focus.includes("Day 3 pathway"), "tonight focus should name Day 3 on calendar day 3");
assert.ok(day3Focus.includes("Manual"), "Day 3 focus should mention manual minimum");

const hubPanel = fs.readFileSync(
  path.join(process.cwd(), "src/components/election-plan/ElectionPlanDebatePrepHubPanel.tsx"),
  "utf8",
);
assert.ok(hubPanel.includes("ElectionPlanDay3StartCard"), "hub should render Day 3 start card");
assert.ok(hubPanel.includes("ElectionPlanDay3PathwayHubCard"), "hub should render Day 3 pathway hub card");
assert.ok(hubPanel.includes("debatePrepHubPrimaryDayId"), "hub should use calendar primary day");
assert.ok(hubPanel.includes("Day 2 complete?"), "hub should collapse Day 2 when Day 3 is tonight");

const subnav = fs.readFileSync(
  path.join(process.cwd(), "src/components/election-plan/ElectionPlanDebatePrepSubnav.tsx"),
  "utf8",
);
assert.ok(subnav.includes("Day 1"), "subnav should include Day 1");
assert.ok(subnav.includes("Day 2"), "subnav should include Day 2");
assert.ok(subnav.includes("Day 3"), "subnav should include Day 3");

const v8 = fs.readFileSync(path.join(process.cwd(), "src/lib/election-plan/debate-prep-system-v8.ts"), "utf8");
assert.ok(v8.includes("buildDebatePrepPathwayTonightFocus"), "v8 snapshot should use pathway tonight focus");
assert.equal(DEBATE_PREP_DAY3_RELEASE_VERSION, "day-3-superiority-map-v2.0.0");
assert.ok(DAY3_CONCEPT_ANCHORS["success-check-d3"]?.continueFromStepId === "b3-claims");

console.log("test-debate-prep-day3-pass5: OK (hub focus, subnav, todayFocus, release version)");
