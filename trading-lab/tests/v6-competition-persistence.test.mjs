import test from "node:test";import assert from "node:assert/strict";import {COMPETITION_RULES,competitionRecord,fillRecord,creditEntry} from "../src/v6-competition-persistence.js";
test("V6-09 freezes canonical competition economics",()=>{assert.equal(COMPETITION_RULES.humans,10);assert.equal(COMPETITION_RULES.startingCapital,100000);assert.equal(COMPETITION_RULES.durationDays,90);assert.equal(COMPETITION_RULES.realMoney,false)});
test("V6-09 requires frozen fingerprints",()=>assert.throws(()=>competitionRecord({id:"c1"}),/fingerprints/));
test("V6-09 fill preserves canonical price and source",()=>{const f=fillRecord({id:"f1",portfolioId:"p1",symbol:"xyz",side:"buy",quantity:2,canonicalPrice:100,decisionSource:"human",filledAt:"t"});assert.equal(f.symbol,"XYZ");assert.equal(f.canonicalPrice,100);assert.equal(f.decisionSource,"HUMAN")});
test("V6-09 rejects autonomous or unknown fill source",()=>assert.throws(()=>fillRecord({side:"BUY",quantity:1,canonicalPrice:1,decisionSource:"BOT"}),/decision source/));
test("V6-09 credit ledger is auditable",()=>assert.deepEqual(creditEntry({humanId:"h1",delta:5,reason:"VERIFIED_REFERRAL",referenceId:"r1"}),{humanId:"h1",delta:5,reason:"VERIFIED_REFERRAL",referenceId:"r1"}));
console.log("V6-09 Competition Persistence + API contracts: PASS");
