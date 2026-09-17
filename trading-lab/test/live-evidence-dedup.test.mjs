import test from 'node:test';
import assert from 'node:assert/strict';
import { captureLiveBreadth, liveEvidenceKey } from '../src/breadth-live.js';

function store(time='2026-09-17T03:00:00Z'){
 return {symbols:['SPY'],fetchedAt:time,market:{SPY:{quoteTime:time,bid:100,ask:101,bar:{time,close:100.5,high:101,low:100,volume:1000}}},series:{SPY:Array.from({length:25},(_,i)=>({time:`t${i}`,open:100,high:101,low:99,close:100+i/100,volume:1000}))}};
}

test('live evidence key changes only when provider evidence changes',()=>{
 const s=store();
 const first=liveEvidenceKey(s);
 s.fetchedAt='2026-09-17T03:00:05Z';
 assert.equal(liveEvidenceKey(s),first,'poll timestamp alone must not manufacture evidence when provider quote time is unchanged');
 s.market.SPY.quoteTime='2026-09-17T03:00:06Z';
 assert.notEqual(liveEvidenceKey(s),first);
});

test('same provider snapshot is captured once per runtime',()=>{
 let calls=0;
 const runtime={captureMarket(){calls++;return {captured:true}}};
 const s=store();
 assert.equal(captureLiveBreadth(runtime,s).captured,true);
 const duplicate=captureLiveBreadth(runtime,s);
 assert.equal(duplicate.skipped,true);
 assert.equal(duplicate.reason,'UNCHANGED_PROVIDER_EVIDENCE');
 assert.equal(calls,1);
 s.market.SPY.quoteTime='2026-09-17T03:00:06Z';
 captureLiveBreadth(runtime,s);
 assert.equal(calls,2,'new provider evidence must be captured');
});
