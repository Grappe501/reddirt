/**
 * Day 3 debate-prep Pass 2 — block study guides + example depth exit criteria.
 */
import assert from "node:assert/strict";
import { DAY3_BLOCK_STUDY, getDay3BlockStudy } from "../src/lib/election-plan/debatePrepDay3BlockStudy";
import {
  DAY3_OPPONENT_EXAMPLE_STUDY,
  getDay3OpponentExampleStudy,
} from "../src/lib/election-plan/debatePrepDay3OpponentExampleStudy";
import { DEBATE_PREP_DAY3_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day3-release";
import { listDayBlockPhaseParams } from "../src/lib/election-plan/debatePrepBlockPhase";
import { DAY3_ID, listDayBlocksDrillDown } from "../src/lib/election-plan/debatePrepDayDrillDown";
import { kellyStudyLeadLabel } from "../src/lib/election-plan/kelly-facing-ui";

const blockIds = listDayBlocksDrillDown(DAY3_ID).map((b) => b.blockId);
assert.deepEqual(blockIds.sort(), Object.keys(DAY3_BLOCK_STUDY).sort());

let totalDeepSections = 0;
for (const blockId of blockIds) {
  const study = getDay3BlockStudy(blockId);
  assert.ok(study, `${blockId} block study must exist`);
  assert.ok((study.professorLead ?? "").length > 20, `${blockId} professorLead`);
  assert.ok(study.phases.length >= 4, `${blockId} should have >= 4 phases`);
  assert.ok(study.deepSections.length >= 4, `${blockId} should have >= 4 deepSections`);
  assert.ok(study.claimsGate?.length, `${blockId} must have claimsGate`);
  assert.ok(study.keyTakeaways.length >= 3, `${blockId} key takeaways`);
  totalDeepSections += study.deepSections.length;

  const phaseParams = listDayBlockPhaseParams(DAY3_ID, blockId);
  assert.equal(phaseParams.length, study.phases.length, `${blockId} phase params must match study phases`);
}

assert.ok(totalDeepSections >= 16, "Day 3 deepSections total should be >= 16");

const hammerAdmin = getDay3OpponentExampleStudy("ex3-hammer-admin");
assert.ok(hammerAdmin, "ex3-hammer-admin study must exist");
assert.ok(hammerAdmin.phases.length >= 4, "ex3-hammer-admin should have >= 4 phases");
assert.ok(hammerAdmin.claimsGate?.length, "ex3-hammer-admin must have claimsGate");
assert.ok((hammerAdmin.professorLead ?? "").length > 20);
assert.equal(Object.keys(DAY3_OPPONENT_EXAMPLE_STUDY).length, 1);

assert.equal(kellyStudyLeadLabel(), "Start here");
assert.ok(DEBATE_PREP_DAY3_RELEASE_VERSION.includes("pass2"));

console.log(
  `test-debate-prep-day3-pass2: OK (${blockIds.length} blocks · ${totalDeepSections} deep sections · ex3-hammer-admin ${hammerAdmin.phases.length} phases)`,
);
