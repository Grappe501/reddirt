/**
 * Day 3 debate-prep Pass 4 — qualification stack worksheet + claims superiority checklist.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildElectionPlanClaimsSuperioritySummary } from "../src/lib/election-plan/debate-prep-claims-superiority-summary";
import {
  countFilledQualificationNotecards,
  emptyQualificationStackState,
  QUALIFICATION_NOTECARD_LABELS,
} from "../src/lib/election-plan/debate-prep-day3-qualification-stack";
import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";
import { getDay3BlockStudy } from "../src/lib/election-plan/debatePrepDay3BlockStudy";
import { DAY3_ID } from "../src/lib/election-plan/debatePrepDayDrillDown";

assert.equal(QUALIFICATION_NOTECARD_LABELS.length, 3);
assert.equal(countFilledQualificationNotecards(emptyQualificationStackState()), 0);

const manualStudy = getDay3BlockStudy("b3-manual");
const claimsStudy = getDay3BlockStudy("b3-claims");
assert.ok(manualStudy?.claimsGate?.length, "b3-manual study should have claims gate");
assert.ok(claimsStudy?.claimsGate?.length, "b3-claims study should have claims gate");

const summary = buildElectionPlanClaimsSuperioritySummary();
assert.ok(summary.ledgerTotals.totalClaims > 0, "ledger should have indexed claims");
assert.ok(summary.superiorityCategories.length > 0, "superiority categories should be populated");
assert.ok(
  summary.superiorityCategories.every(
    (c) => c.totalCount >= c.needsReviewCount && c.totalCount >= c.stageSafeCount,
  ),
  "category counts should be consistent",
);
assert.equal(typeof summary.hubBuckets.supported, "number");
assert.equal(typeof summary.hubBuckets.needsResearch, "number");

const root = path.join(process.cwd(), "src");
const qualPanel = path.join(root, "components/election-plan/ElectionPlanQualificationStackPanel.tsx");
const claimsPanel = path.join(root, "components/election-plan/ElectionPlanClaimsSuperiorityChecklist.tsx");
assert.ok(fs.existsSync(qualPanel), "Qualification stack panel should exist");
assert.ok(fs.existsSync(claimsPanel), "Claims superiority checklist should exist");

const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
assert.ok(blockPage.includes("ElectionPlanQualificationStackPanel"), "block page should render qualification stack");
assert.ok(blockPage.includes('blockId === "b3-manual"'), "qualification stack gated to b3-manual");
assert.ok(blockPage.includes("ElectionPlanClaimsSuperiorityChecklist"), "block page should render claims checklist");
assert.ok(blockPage.includes('blockId === "b3-claims"'), "claims checklist gated to b3-claims");
assert.ok(blockPage.includes("buildElectionPlanClaimsSuperioritySummary"), "block page should build claims summary");

const claimsPanelSrc = fs.readFileSync(claimsPanel, "utf8");
assert.ok(!claimsPanelSrc.includes("claimText"), "checklist panel must not expose raw claim text");
assert.ok(claimsPanelSrc.includes("epOppositionResearchModuleHref"), "checklist should link to claims ledger module");

assert.equal(DEBATE_PREP_DAY3_RELEASE_VERSION, "day-3-superiority-map-v1.1.0");

console.log(
  `test-debate-prep-day3-pass4: OK (${summary.superiorityCategories.length} claim categories · ${summary.ledgerTotals.totalClaims} ledger claims indexed)`,
);
