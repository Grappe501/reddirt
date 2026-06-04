import assert from "node:assert/strict";
import {
  DEBATE_PREP_SECTION_DRILL_DOWNS,
  getAllPrepSectionDrillDownIds,
  getPrepSectionDrillDown,
} from "../src/lib/intelligence/v4/debatePrepSectionDrillDowns";

const ids = getAllPrepSectionDrillDownIds();
assert.equal(ids.length, 28);

for (const id of ids) {
  const d = getPrepSectionDrillDown(id)!;
  assert.ok(d.whyItMatters.length > 20, `${id} whyItMatters`);
  assert.ok(d.howToUseInDebate.length > 10, `${id} howToUseInDebate`);
  assert.ok(d.rehearsalSteps.length >= 1, `${id} rehearsalSteps`);
  assert.ok(d.estimatedPrepMinutes >= 10, `${id} minutes`);
}

assert.ok(DEBATE_PREP_SECTION_DRILL_DOWNS["likely-hammer"].rebuttalScripts.length >= 2);
assert.ok(DEBATE_PREP_SECTION_DRILL_DOWNS.opening.sampleScripts.length >= 1);
assert.ok(DEBATE_PREP_SECTION_DRILL_DOWNS.rebuttal.rebuttalScripts.length >= 2);

console.log("test-debate-intelligence-prep-drilldown: OK");
