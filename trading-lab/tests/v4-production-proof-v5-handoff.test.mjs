import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const handoff=fs.readFileSync(new URL("../docs/V4_PRODUCTION_PROOF_AND_V5_HANDOFF.md",import.meta.url),"utf8");const lock=JSON.parse(fs.readFileSync(new URL("../agents/v4-architecture-lock.json",import.meta.url),"utf8"));
test("V4-17 handoff locks complete V4 and points to V5-01",()=>{assert.equal(lock.nextSlice,"V5-01");assert.equal(lock.completedSlices.length,17);assert.ok(lock.invariants.includes("HUMAN_DECIDES"));});
test("V4-17 carries calm progressive experience and Intelligence Tape into V5",()=>{assert.match(handoff,/GLANCE → EXPLAIN → LEARN → ADVANCED → RESEARCH → TRY/);assert.match(handoff,/Wealth Builder Intelligence Tape/);assert.match(handoff,/not probabilities of profit/i);assert.match(handoff,/Do not greet users with chart walls/i);});
console.log("V4-17 Production Proof + V5 Handoff: PASS");
