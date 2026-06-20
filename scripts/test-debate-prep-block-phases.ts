/**
 * Block study timed phases — each phase has a drill-down page.
 */
import assert from "node:assert/strict";

import { DAY1_ID, DAY2_ID, DAY3_ID, listDayBlocksDrillDown } from "../src/lib/election-plan/debatePrepDayDrillDown";
import { getDayBlockPhaseContext, listDayBlockPhaseParams } from "../src/lib/election-plan/debatePrepBlockPhase";
import { staticParamsForDayBlockPhases } from "../src/lib/election-plan/debatePrepDayStaticParams";
import { epDebatePrepDayBlockPhaseHref } from "../src/lib/election-plan/debate-prep-links";

for (const dayId of [DAY1_ID, DAY2_ID, DAY3_ID]) {
  for (const block of listDayBlocksDrillDown(dayId)) {
    const phases = listDayBlockPhaseParams(dayId, block.blockId);
    assert.ok(phases.length >= 3, `${block.blockId} should have >= 3 timed phases`);
    for (const phaseIndex of phases) {
      const ctx = getDayBlockPhaseContext(dayId, block.blockId, phaseIndex);
      assert.ok(ctx, `${block.blockId} phase ${phaseIndex} context missing`);
      assert.ok(ctx.phase.steps.length >= 1, `${block.blockId} phase ${phaseIndex} needs steps`);
      const href = epDebatePrepDayBlockPhaseHref(dayId, block.blockId, phaseIndex);
      assert.ok(href.includes(`/phases/${phaseIndex}`), href);
    }
  }
}

const params = staticParamsForDayBlockPhases();
assert.ok(params.length >= 30, `expected many phase static params, got ${params.length}`);

console.log(`test-debate-prep-block-phases: OK (${params.length} phase routes)`);
