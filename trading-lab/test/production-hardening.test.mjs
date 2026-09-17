import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductionLearningController } from '../src/production-integration.js';
import { escapeHtml } from '../src/learning-command-center.js';

test('escapeHtml neutralizes stored markup before innerHTML rendering',()=>{
  assert.equal(escapeHtml(`<img src=x onerror="boom()"> & 'x'`),'&lt;img src=x onerror=&quot;boom()&quot;&gt; &amp; &#39;x&#39;');
});

test('production close is idempotent until new market evidence arrives',async()=>{
  const memory={observations:Array.from({length:80},(_,i)=>({symbol:'SPY',providerTime:new Date(1700000000000+i*60000).toISOString(),price:100+i*.1,score:55,regime:'TRENDING_RISK_ON',features:{momentum5:.01}}))};
  const calls=[];
  const fetchImpl=async(url,options={})=>{
    calls.push({url,options});
    if(url.includes('learning-history'))return {ok:true,status:200,json:async()=>({ok:true,strategies:[],lessons:[]})};
    return {ok:true,status:200,json:async()=>({ok:true})};
  };
  const controller=createProductionLearningController({memory,costs:{commissionPerOrder:0,secFeePerMillionOnSales:20.6,tafPerShareOnSales:.000195,spreadBps:4,slippageBps:2},fetchImpl});
  await controller.close('TEST');
  const writesAfterFirst=calls.filter(c=>c.options?.method==='POST').length;
  assert.equal(controller.state.learningPersisted,true);
  assert.equal(controller.state.calibrationPersisted,true);
  assert.equal(writesAfterFirst,2);
  await controller.close('TEST');
  assert.equal(calls.filter(c=>c.options?.method==='POST').length,writesAfterFirst,'same evidence must not create another learning/calibration write');
  assert.match(controller.state.lastError,/already closed/i);
  memory.observations.push({symbol:'SPY',providerTime:new Date(1700000000000+80*60000).toISOString(),price:108.2,score:56,regime:'TRENDING_RISK_ON',features:{momentum5:.01}});
  await controller.close('TEST');
  assert.equal(calls.filter(c=>c.options?.method==='POST').length,4,'new evidence should permit one new learning/calibration pair');
});

test('calibration persistence failure cannot masquerade as release proof',async()=>{
  const memory={observations:Array.from({length:80},(_,i)=>({symbol:'SPY',providerTime:new Date(1700000000000+i*60000).toISOString(),price:100+i*.1,score:55,regime:'TRENDING_RISK_ON',features:{momentum5:.01}}))};
  const fetchImpl=async(url)=>{
    if(url.includes('calibration-cycle'))return {ok:false,status:500,json:async()=>({ok:false,message:'calibration unavailable'})};
    if(url.includes('learning-history'))return {ok:true,status:200,json:async()=>({ok:true,strategies:[],lessons:[]})};
    return {ok:true,status:200,json:async()=>({ok:true})};
  };
  const controller=createProductionLearningController({memory,costs:{commissionPerOrder:0,secFeePerMillionOnSales:20.6,tafPerShareOnSales:.000195,spreadBps:4,slippageBps:2},fetchImpl});
  await controller.close('TEST');
  assert.equal(controller.state.learningPersisted,true);
  assert.equal(controller.state.calibrationPersisted,false);
  assert.match(controller.state.lastCalibrationPersistenceError,/calibration unavailable/i);
});
