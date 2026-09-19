import test from "node:test";import assert from "node:assert/strict";import {transitionCohort,scheduleCompetition,lifecycleSummary} from "../src/v5-cohort-lifecycle.js";
const full={cohortId:"C001",state:"FULL",humanIdentityIds:Array.from({length:10},(_,i)=>`h${i}`),aiContestants:1,lifecycleHistory:[]};
test("V5-06 schedules only full ten-human cohort",()=>{const s=scheduleCompetition(full,{startAt:"2026-09-21T09:30:00-04:00",endAt:"2026-12-20T16:00:00-05:00"});assert.equal(s.state,"SCHEDULED");assert.equal(s.rulesMutable,false);});
test("V5-06 cannot activate before common start",()=>{const s={...full,state:"SCHEDULED",startAt:"2026-09-21T09:30:00-04:00"};assert.throws(()=>transitionCohort(s,{to:"ACTIVE",at:"2026-09-20T09:30:00-04:00"}));});
test("V5-06 enforces lifecycle order",()=>{assert.throws(()=>transitionCohort(full,{to:"ACTIVE",at:"2026-09-21"}));});
test("V5-06 complete cohort becomes immutable historical record",()=>{const c=transitionCohort({...full,state:"CLOSING"},{to:"COMPLETE",at:"2026-12-20T16:01:00-05:00"});assert.equal(c.historicalRecordImmutable,true);assert.equal(lifecycleSummary(c).state,"COMPLETE");});
console.log("V5-06 Cohort Lifecycle Engine: PASS");
