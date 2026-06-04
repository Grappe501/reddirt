import assert from "node:assert/strict";
import {
  getAllTrapLaneIds,
  getTrapLaneDrillDown,
  listTrapLaneSummaries,
} from "../src/lib/intelligence/v4/trapLaneDrillDowns";
import { OPPONENT_TRAP_LANES } from "../src/lib/intelligence/v4/kellyOpponentContrastPlaybook";

assert.equal(getAllTrapLaneIds().length, OPPONENT_TRAP_LANES.length);
assert.equal(listTrapLaneSummaries().length, 6);

for (const id of getAllTrapLaneIds()) {
  const drill = getTrapLaneDrillDown(id);
  assert.ok(drill, `missing drill ${id}`);
  assert.ok(drill.narrativeOverview.length > 40);
  assert.ok(drill.whatToExpectHammerToSay.length >= 1);
  assert.ok(drill.setupMoves.length >= 1);
  assert.ok(drill.kellyPivotDeep.length > 20);
  assert.ok(drill.rehearsalSteps.length >= 2);
  assert.ok(drill.whatToLookForOffensive.length >= 1, `${id} offensive findings`);
  assert.ok(drill.debateOffensiveUse.length > 15, `${id} offensive use`);
}

const experience = getTrapLaneDrillDown("experience-equals-sos-ready");
assert.ok(experience?.sampleScripts.length >= 1);

console.log("test-trap-lane-drilldowns: OK", { lanes: getAllTrapLaneIds() });
