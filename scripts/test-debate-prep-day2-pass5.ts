/**
 * Day 2 debate-prep Pass 5 — hub integration and production sign-off checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildDebatePrepPathwayTonightFocus,
  debatePrepHubPrimaryDayId,
  resolveDebatePrepTonightDayId,
} from "../src/lib/election-plan/debate-prep-hub-tonight";
import { DEBATE_PREP_DAY2_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day2-release";
import { DAY1_ID, DAY2_ID } from "../src/lib/election-plan/debatePrepDayDrillDown";

assert.equal(resolveDebatePrepTonightDayId("2026-06-19"), DAY1_ID);
assert.equal(resolveDebatePrepTonightDayId("2026-06-20"), DAY2_ID);
assert.equal(debatePrepHubPrimaryDayId("2026-06-20"), DAY2_ID);
assert.equal(debatePrepHubPrimaryDayId("2026-06-19"), DAY1_ID);

const day2Focus = buildDebatePrepPathwayTonightFocus("2026-06-20");
assert.ok(day2Focus.includes("Day 2 pathway"), "tonight focus should name Day 2 on calendar day 2");
assert.ok(day2Focus.includes("Film"), "Day 2 focus should mention film minimum");

const hubPanel = fs.readFileSync(
  path.join(process.cwd(), "src/components/election-plan/ElectionPlanDebatePrepHubPanel.tsx"),
  "utf8",
);
assert.ok(hubPanel.includes("ElectionPlanDay2StartCard"), "hub should render Day 2 start card");
assert.ok(hubPanel.includes("debatePrepHubPrimaryDayId"), "hub should use calendar primary day");
assert.ok(hubPanel.includes("Day 1 complete?"), "hub should collapse Day 1 when Day 2 is tonight");

const subnav = fs.readFileSync(
  path.join(process.cwd(), "src/components/election-plan/ElectionPlanDebatePrepSubnav.tsx"),
  "utf8",
);
assert.ok(subnav.includes("Day 1"), "subnav should include Day 1");
assert.ok(subnav.includes("Day 2"), "subnav should include Day 2");

const v8 = fs.readFileSync(path.join(process.cwd(), "src/lib/election-plan/debate-prep-system-v8.ts"), "utf8");
assert.ok(v8.includes("buildDebatePrepPathwayTonightFocus"), "v8 snapshot should use pathway tonight focus");
assert.equal(DEBATE_PREP_DAY2_RELEASE_VERSION, "day-2-read-the-table-v1.0.0");

console.log("test-debate-prep-day2-pass5: OK (hub focus, subnav, todayFocus, release version)");
