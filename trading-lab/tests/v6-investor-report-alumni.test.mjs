import test from "node:test";import assert from "node:assert/strict";import {investorReport,alumniRecord,investorReportMarkup,alumniMarkup} from "../src/v6-investor-report-alumni.js";
test("V6-13 computes return and AI delta",()=>{const r=investorReport({startingCapital:100000,endingValue:112000,aiEndingValue:108000,rank:2});assert.equal(r.returnPct,12);assert.equal(r.deltaVsAi,4000);assert.equal(r.simulationOnly,true)});
test("V6-13 report avoids claiming skill from short contest",()=>assert.match(investorReportMarkup(investorReport({rank:1})),/does not establish investing skill or predict future returns/));
test("V6-13 report does not invent strengths",()=>assert.match(investorReportMarkup(investorReport({rank:1})),/Not enough evidence to identify a durable strength yet/));
test("V6-13 alumni preserves longitudinal record",()=>{const a=alumniRecord(investorReport({humanId:"h1",cohortId:"c1"}));assert.equal(a.portfolioHistoryPreserved,true);assert.equal(a.researchHistoryPreserved,true);assert.equal(a.learningHistoryPreserved,true);assert.equal(a.subscriptionRequired,false);assert.match(alumniMarkup(a),/HISTORY IS NOT/)});
console.log("V6-13 Investor Report + Alumni: PASS");
