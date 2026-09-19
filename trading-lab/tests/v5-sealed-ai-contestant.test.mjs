import test from "node:test";import assert from "node:assert/strict";import {sealAiContestant,verifyAiSeal,assertNoOutcomeAwareMutation} from "../src/v5-sealed-ai-contestant.js";
const config={cohortId:"C001",modelVersion:"m1",researchPolicyVersion:"r1",strategyPolicyVersion:"s1",universeVersion:"u1",costModelVersion:"c1",configuration:{riskBudget:1,mode:"paper"},sealedAt:"2026-09-21T13:29:00Z"};
test("V5-09 produces deterministic auditable seal",()=>{const a=sealAiContestant(config);const b=sealAiContestant({...config,configuration:{mode:"paper",riskBudget:1}});assert.equal(a.fingerprint,b.fingerprint);assert.equal(verifyAiSeal(a),true);assert.equal(a.realMoney,false);});
test("V5-09 detects post-seal mutation",()=>{const a=sealAiContestant(config);const tampered={...a,modelVersion:"m2"};assert.equal(verifyAiSeal(tampered),false);});
test("V5-09 forbids outcome-aware config changes",()=>{const a=sealAiContestant(config);assert.throws(()=>assertNoOutcomeAwareMutation(a,{...config,strategyPolicyVersion:"s2"}));assert.equal(assertNoOutcomeAwareMutation(a,config),true);});
console.log("V5-09 Sealed Wealth Builder AI Contestant: PASS");
