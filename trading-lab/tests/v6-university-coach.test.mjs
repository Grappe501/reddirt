import test from "node:test";import assert from "node:assert/strict";import {lessonFor,coachFor,universityMarkup,coachMarkup} from "../src/v6-university-coach.js";
test("V6-08 exposes all six knowledge depths",()=>{const x=lessonFor("evidence","ADVANCED");assert.deepEqual(x.depths,["GLANCE","EXPLAIN","LEARN","ADVANCED","RESEARCH","TRY"]);assert.equal(x.depth,"ADVANCED")});
test("V6-08 evidence lesson rejects probability interpretation",()=>assert.match(lessonFor("evidence","EXPLAIN").content,/not a probability/i));
test("V6-08 coach changes with user context",()=>{assert.equal(coachFor({surface:"lab"}).concept,"friction");assert.equal(coachFor({surface:"portfolio"}).concept,"drawdown");assert.equal(coachFor({surface:"research"}).concept,"evidence")});
test("V6-08 degraded data overrides normal coaching",()=>assert.match(coachFor({surface:"lab",degraded:true}).body,/incomplete/i));
test("V6-08 UI preserves education boundary",()=>{const h=universityMarkup(lessonFor("evidence","LEARN"));assert.match(h,/does not tell you what security to buy or sell/);assert.match(h,/data-depth="LEARN"/);assert.match(h,/data-concept="evidence"/);assert.match(coachMarkup(coachFor({surface:"lab"})),/Learn this concept/)});
console.log("V6-08 University + Contextual Coach: PASS");
