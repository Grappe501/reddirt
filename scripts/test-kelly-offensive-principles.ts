import assert from "node:assert/strict";
import {
  HAMMER_STATEMENT_FLIPS,
  HOW_WE_PLAY_OUR_HAND,
  OFFENSIVE_DEBATE_PRINCIPLES,
} from "../src/lib/intelligence/v4/kellyOffensivePrinciples";

assert.ok(OFFENSIVE_DEBATE_PRINCIPLES.principles.length >= 8);
assert.ok(HOW_WE_PLAY_OUR_HAND.tableStakes.length >= 4);
assert.ok(HAMMER_STATEMENT_FLIPS.length >= 8);

for (const flip of HAMMER_STATEMENT_FLIPS) {
  assert.ok(flip.hammerSays.length > 10);
  assert.ok(flip.kellyTurn.length > 20);
  assert.ok(flip.proofAnchor.length > 5);
}

const ids = new Set(HAMMER_STATEMENT_FLIPS.map((f) => f.id));
assert.equal(ids.size, HAMMER_STATEMENT_FLIPS.length, "duplicate flip ids");

console.log("test-kelly-offensive-principles: OK", {
  principles: OFFENSIVE_DEBATE_PRINCIPLES.principles.length,
  flips: HAMMER_STATEMENT_FLIPS.length,
});
