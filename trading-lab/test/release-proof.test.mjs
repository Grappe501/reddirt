import test from'node:test';import assert from'node:assert/strict';import{collectProductionProof,proofSummary,sessionProofs}from'../src/release-proof.js';
import{methodologyPanel,disclosuresVisible}from'../src/methodology.js';
import{checkProofPayload}from'../scripts/write-check-proof.mjs';
test('production proof uses real readback endpoints and does not invent untested gates',async()=>{const fetchImpl=async url=>({ok:true,status:200,json:async()=>url.includes('market-memory-status')?{ok:true,counts:{observations:3}}:url.includes('check-proof')?{ok:false}: {ok:true,strategies:[],cycles:[]}});const p=await collectProductionProof({fetchImpl});assert.equal(p.proofs.database,true);assert.equal(p.proofs.learning,true);assert.equal(p.proofs.calibration,true);assert.equal(p.proofs.disclosures,true);assert.equal(p.proofs.tests,false);assert.equal(p.proofs.mobile,false);assert.equal(p.proofs.liveShadow,false)});
test('session proofs count visible methodology and verified check evidence',()=>{
  const p=sessionProofs({base:{validation:true},learningPersisted:true,calibrationPersisted:true,checkProof:checkProofPayload(),methodologyHtml:methodologyPanel()});
  assert.equal(p.tests,true);
  assert.equal(p.disclosures,true);
  assert.equal(p.learning,true);
  assert.equal(p.calibration,true);
  assert.equal(p.mobile,undefined);
  assert.ok(disclosuresVisible(methodologyPanel()));
});
test('check proof cannot pass if it claims live orders are enabled',()=>{
  const p=sessionProofs({checkProof:{ok:true,ordersEnabled:true},methodologyHtml:methodologyPanel()});
  assert.equal(p.tests,false);
  assert.equal(p.disclosures,true);
});
test('failed endpoint keeps release proof closed',async()=>{const p=await collectProductionProof({fetchImpl:async()=>({ok:false,status:500,json:async()=>({ok:false})})});assert.equal(p.proofs.database,false);assert.equal(p.proofs.learning,false);assert.ok(proofSummary(p).percent<100)});
test('network failure becomes evidence failure instead of throwing',async()=>{const p=await collectProductionProof({fetchImpl:async()=>{throw new Error('offline')}});assert.equal(p.proofs.database,false);assert.match(p.proofs.databaseDetail,/failed/i)});
