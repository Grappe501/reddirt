/**
 * Hammer bill enrolled sections — every in-depth bill must have statutory text.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildBillActProofDeep } from "../src/lib/intelligence/v4/billActProofDepth";
import { loadDebateIntelligenceV4Packet, findV4BillNarrative } from "../src/lib/intelligence/v4/debateIntelligenceV4";
import {
  hasHammerBillEnrolledSections,
  listHammerBillsWithEnrolledSections,
  loadHammerBillEnrolledAct,
} from "../src/lib/intelligence/v4/hammerBillEnrolledSections";
import { MANUAL_CURATED_BILL_NUMBERS } from "../src/lib/intelligence/v4/debateBillPlaybookIndexCurator";

const v4 = loadDebateIntelligenceV4Packet();
const withSections = listHammerBillsWithEnrolledSections();

assert.ok(withSections.length >= 16, `expected >= 16 bills with enrolled sections, got ${withSections.length}`);

for (const bill of MANUAL_CURATED_BILL_NUMBERS) {
  assert.ok(
    hasHammerBillEnrolledSections(bill),
    `manual curated bill ${bill} must have enrolled section text`,
  );
}

let sectionCount = 0;
for (const bill of withSections) {
  const narrative = findV4BillNarrative(v4, bill);
  const enrolled = loadHammerBillEnrolledAct(bill, narrative ?? undefined);
  assert.ok(enrolled, `${bill} enrolled act load failed`);
  assert.ok(enrolled.sections.length >= 1, `${bill} must have >= 1 section`);
  for (const s of enrolled.sections) {
    assert.ok(s.statutoryText.length > 40, `${bill} §${s.sectionNumber} statutory text too short`);
    assert.ok(s.plainEnglish.length > 20, `${bill} §${s.sectionNumber} plainEnglish missing`);
    assert.ok(s.debateMove.length > 20, `${bill} §${s.sectionNumber} debateMove missing`);
    assert.ok(s.kellyFrame.length > 10, `${bill} §${s.sectionNumber} kellyFrame missing`);
    sectionCount += 1;
  }

  if (narrative) {
    const deep = buildBillActProofDeep(narrative);
    assert.ok(deep.enrolledAct, `${bill} BillActProofDeep must include enrolledAct`);
    assert.equal(deep.enrolledAct?.sections.length, enrolled.sections.length);
  }
}

const jsonPath = path.join(process.cwd(), "data/opposition/kim-hammer-bill-enrolled-sections.json");
const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as { bills: unknown[] };
assert.ok(Array.isArray(raw.bills) && raw.bills.length >= 16);

console.log(
  `test-hammer-bill-enrolled-sections: OK (${withSections.length} bills · ${sectionCount} sections with analysis)`,
);
