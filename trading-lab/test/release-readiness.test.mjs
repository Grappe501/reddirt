import test from'node:test';import assert from'node:assert/strict';import{releaseReadiness,readinessPanel,RELEASE_GATES}from'../src/release-readiness.js';
test('release is blocked without all evidence',()=>{const r=releaseReadiness({tests:true,database:true});assert.equal(r.ready,false);assert.equal(r.passed,2);assert.equal(r.total,RELEASE_GATES.length)});
test('release opens only when every gate passes',()=>{const proofs=Object.fromEntries(RELEASE_GATES.map(([id])=>[id,true]));const r=releaseReadiness(proofs);assert.equal(r.ready,true);assert.equal(r.percent,100)});
test('readiness UI clearly says no live-money execution',()=>{const html=readinessPanel({tests:true});assert.match(html,/no live-money execution/i);assert.match(html,/Release remains blocked/)});
