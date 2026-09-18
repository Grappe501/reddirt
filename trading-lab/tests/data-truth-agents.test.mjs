import {dataTruthAgentIds,runDataTruthAgent,runDataTruthDepartment} from '../src/data-truth-agents.js';
if(dataTruthAgentIds().length!==12)throw new Error('expected 12 data truth agents');
const p=runDataTruthAgent('market-data',{symbols:['TEST'],invokedAt:'2026-01-01T00:00:00Z',dataAsOf:'2026-01-01T00:00:00Z',sourceRecords:[{sourceId:'quote-1',sourceType:'MARKET_FEED',retrievedAt:'2026-01-01T00:00:01Z',asOf:'2026-01-01T00:00:00Z',provenance:'provider:test',freshness:'CURRENT'}],observations:[{statement:'Test observation',evidenceRefs:['quote-1']}]});if(p.evidenceState!=='AVAILABLE'||p.decision.direction!=='NONE'||p.methodology.confidenceKind!=='NONE')throw new Error('truth agent overreached');
const u=runDataTruthAgent('sec-filing',{symbols:['TEST'],invokedAt:'2026-01-01T00:00:00Z'});if(u.evidenceState!=='UNAVAILABLE'||u.sources.length)throw new Error('missing source invented');
const d=runDataTruthDepartment({});if(d.length!==12||!d.every(x=>x.evidenceState==='UNAVAILABLE'))throw new Error('department degradation failure');
console.log('V2.5 Data & Truth department contract: PASS');
