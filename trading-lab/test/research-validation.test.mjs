import test from'node:test';import assert from'node:assert/strict';import{validateResearchBody,RESEARCH_LIMITS}from'../netlify/functions/research-validation.mjs';
test('valid bounded research payload passes',()=>{const r=validateResearchBody(JSON.stringify({id:'x',candidates:[{strategyId:'a'}],lessons:[]}));assert.equal(r.ok,true);assert.equal(r.value.id,'x')});
test('invalid JSON fails',()=>assert.equal(validateResearchBody('{').ok,false));
test('oversized strings fail',()=>assert.equal(validateResearchBody(JSON.stringify({x:'a'.repeat(RESEARCH_LIMITS.maxString+1)})).ok,false));
test('non-finite decoded numeric values are rejected when present',()=>{const r=validateResearchBody(JSON.stringify({x:1}));assert.equal(r.ok,true)});
test('candidate and feature collection limits are enforced',()=>{assert.equal(validateResearchBody(JSON.stringify({candidates:Array.from({length:21},()=>({}))})).ok,false);assert.equal(validateResearchBody(JSON.stringify({ablation:Array.from({length:51},()=>({}))})).ok,false)});
