/**
 * Day 3 debate-prep v2.0 — ACCA superiority clips + block panels exit criteria.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  DAY3_SUPERIORITY_CLIP_IDS,
  listAccaForumStudyClips,
} from "../src/lib/election-plan/acca-forum-study-clips";
import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";

const clips = listAccaForumStudyClips(DAY3_SUPERIORITY_CLIP_IDS);
assert.equal(clips.length, DAY3_SUPERIORITY_CLIP_IDS.length, "Day 3 superiority clips must resolve");

const root = path.join(process.cwd(), "src");
const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
assert.ok(blockPage.includes("ElectionPlanDay3SuperiorityClipPanel"), "Day 3 blocks should render superiority clips");
assert.ok(blockPage.includes('variant="manual"'), "b3-manual clip variant");
assert.ok(blockPage.includes('variant="opposition"'), "b3-opposition clip variant");
assert.ok(blockPage.includes("ElectionPlanHammerEnrolledContrastPanel"), "b3-opposition hammer contrast");
assert.ok(blockPage.includes("ElectionPlanFundingResearchFramePanel"), "b3-funding research frame");
assert.ok(blockPage.includes("ElectionPlanQualificationStackPanel"), "b3-manual qualification stack");
assert.ok(blockPage.includes("ElectionPlanClaimsSuperiorityChecklist"), "b3-claims checklist");

assert.equal(DEBATE_PREP_DAY3_RELEASE_VERSION, "day-3-superiority-map-v2.0.0");

console.log(`test-debate-prep-day3-v2: OK (${clips.length} superiority clips · Day 3 v2.0.0)`);
