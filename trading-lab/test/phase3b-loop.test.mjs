import test from 'node:test';
import assert from 'node:assert/strict';
import { createDurableSyncState, syncDurableMemory, readDurableStatus } from '../src/durable-memory.js';
import { readMemoryStatus } from '../netlify/functions/market-memory-status.mjs';

function storage(){const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}}

test('successful durable sync acknowledges rows and persists sync state',async()=>{
  const s=storage(),state=createDurableSyncState(s),memory={observations:[{id:'o1'}],regimes:[],decisions:[],trades:[],experimentRuns:[],sourceHealth:[]};
  const fetchImpl=async()=>({ok:true,status:200,json:async()=>({ok:true,configured:true,acceptedRows:1})});
  const result=await syncDurableMemory(memory,state,{fetchImpl});
  assert.equal(result.ok,true);assert.equal(state.status,'SYNCED');assert.ok(state.acknowledged.observations.has('o1'));
  const restored=createDurableSyncState(s);assert.ok(restored.acknowledged.observations.has('o1'));
});

test('durable status read stores database counts',async()=>{
  const state=createDurableSyncState(storage());
  const fetchImpl=async()=>({ok:true,status:200,json:async()=>({ok:true,counts:{observations:42,decisions:7,trades:3}})});
  const result=await readDurableStatus(state,{fetchImpl});
  assert.equal(result.ok,true);assert.equal(state.remote.counts.observations,42);
});

test('database status query returns all institutional memory counters',async()=>{
  const db={pool:{query:async()=>({rows:[{observations:10,regimes:2,decisions:3,trades:1,experiment_runs:0,source_health:4}]})}};
  const result=await readMemoryStatus(db);
  assert.equal(result.observations,10);assert.equal(result.source_health,4);
});
