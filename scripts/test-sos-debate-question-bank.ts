import assert from "node:assert/strict";
import {
  getAllSosDebateQuestionIds,
  getSosDebateQuestionDrillDown,
  listSosDebateQuestionSummaries,
  loadSosDebateQuestionResearch,
} from "../src/lib/intelligence/v4/sosDebateQuestionBank";
import { SOS_DEBATE_QUESTION_BANK } from "../src/lib/intelligence/v4/sosDebateQuestionBankData";

assert.equal(getAllSosDebateQuestionIds().length, SOS_DEBATE_QUESTION_BANK.length);
assert.equal(listSosDebateQuestionSummaries().length, 23);

const civic = getSosDebateQuestionDrillDown("civic-education-unity-accountability");
assert.ok(civic?.probability === "HIGH");
assert.ok(civic!.directAnswer30s.includes("division") || civic!.directAnswer30s.includes("aisle"));

const research = loadSosDebateQuestionResearch();
assert.ok(research, "sos-debate-question-research.json should load");
assert.ok(research.sosOfficeDutiesArkansas.length >= 3);
assert.ok(research.researchRefs.length >= 3);

for (const id of getAllSosDebateQuestionIds()) {
  const drill = getSosDebateQuestionDrillDown(id);
  assert.ok(drill, `missing drill ${id}`);
  assert.equal(drill.speakOrderDrills.length, 3, `${id} speak order drills`);
  for (const s of drill.speakOrderDrills) {
    assert.ok(s.freshAddition.length > 20, `${id} position ${s.position} fresh addition`);
    const openingOk =
      s.openingLine.trim().length >= 5 && !/^N\/A/i.test(s.openingLine.trim());
    assert.ok(openingOk || s.freshAddition.length > 20, `${id} position ${s.position} opening or fresh`);
  }
  assert.ok(drill.directAnswer30s.length > 40, `${id} 30s answer`);
  assert.ok(drill.directAnswer60s.length > 60, `${id} 60s answer`);
  if (!/^N\/A/i.test(drill.agreeButNeverOnlyAgree.trim())) {
    assert.ok(drill.agreeButNeverOnlyAgree.length >= 20, `${id} agree-but-never-only`);
  }
  assert.ok(drill.whatHammerLikelySays.length >= 1, `${id} hammer lines`);
  assert.ok(drill.moderatorLikelyPhrasings.length >= 1, `${id} phrasings`);
  assert.ok(drill.rehearsalSteps.length >= 1, `${id} rehearsal`);
  assert.ok(drill.claimsGate.trim().length >= 1, `${id} claims gate`);
}

const opening = getSosDebateQuestionDrillDown("opening-why-running");
assert.ok(opening?.speakOrderDrills[0].position === 1);

const threeWay = getSosDebateQuestionDrillDown("three-way-why-kelly");
assert.ok(threeWay && threeWay.whatPackoMayAdd.length >= 1);

console.log("test-sos-debate-question-bank: OK", {
  questions: getAllSosDebateQuestionIds().length,
  high: listSosDebateQuestionSummaries().filter((q) => q.probability === "HIGH").length,
});
