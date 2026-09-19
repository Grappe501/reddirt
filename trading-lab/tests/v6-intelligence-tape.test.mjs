import test from "node:test";import assert from "node:assert/strict";import {buildTapeItems,tapeLabel,tapeDrawerMarkup} from "../src/v6-intelligence-tape.js";
test("V6-05 fallback avoids invented claims",()=>{const x=buildTapeItems({sources:{},degraded:[]});assert.equal(x.length,1);assert.equal(x[0].evidenceScore,null)});
test("V6-05 shows degraded health",()=>{const x=buildTapeItems({sources:{},degraded:["marketSnapshot"]});assert.equal(x[0].posture,"CAUTIOUS");assert.match(x[0].summary,/degraded/)});
test("V6-05 bounds evidence and preserves freshness",()=>{const x=buildTapeItems({sources:{marketSnapshot:{data:{symbols:[{symbol:"ABC",score:120,providerTime:"T1"}]}}},degraded:[]});assert.equal(x[0].evidenceScore,100);assert.match(tapeLabel(x[0]),/EVIDENCE 100\/100/);assert.match(tapeLabel(x[0]),/T1/)});
test("V6-05 drawer preserves human decision semantics",()=>{const h=tapeDrawerMarkup(buildTapeItems({sources:{},degraded:[]})[0]);assert.match(h,/not a probability of profit/);assert.match(h,/you decide/);assert.match(h,/Research deeper/);assert.match(h,/Run simulation/)});
console.log("V6-05 Intelligence Tape: PASS");
