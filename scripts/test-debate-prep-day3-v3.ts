/**
 * Day 3 debate-prep v3.0 — Norris coalition + superiority map integration.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";
import { getGopSos2026StatewideSummary } from "../src/lib/election-plan/load-gop-sos-2026-results";

assert.equal(DEBATE_PREP_DAY3_RELEASE_VERSION, "day-3-superiority-map-v3.0.0");

const sw = getGopSos2026StatewideSummary();
assert.ok(sw, "statewide GOP SOS summary");
assert.ok(sw!.runoff.norrisCountiesWon >= 35);
assert.ok(sw!.runoff.hammerCountiesWon >= 35);
assert.ok(Math.abs(sw!.runoff.norrisPct + sw!.runoff.hammerPct - 100) < 1);

const root = path.join(process.cwd(), "src");
const countyPanel = fs.readFileSync(path.join(root, "components/election-plan/CountyPlaybookPanel.tsx"), "utf8");
assert.ok(countyPanel.includes("LocationGopPrimaryRunoffPanel"));

const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
assert.ok(blockPage.includes("ElectionPlanDay3SuperiorityClipPanel"), "b3 clips");
assert.ok(blockPage.includes("ElectionPlanQualificationStackPanel"), "b3 stack");

console.log(
  `test-debate-prep-day3-v3: OK (Norris ${sw!.runoff.norrisCountiesWon} counties · Hammer ${sw!.runoff.hammerCountiesWon} · Day 3 v3.0.0)`,
);
