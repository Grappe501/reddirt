import registry from '../agents/agent-registry.v1.json' with {type:'json'};
import {validateAgentResearchPacket} from './agent-research-packet.js';
const IDS=['market-data','historical-market','corporate-historian','executive-intelligence','sec-filing','financial-statement','earnings','capital-structure','ownership','industry','macro','event'];
const byId=new Map(registry.agents.map(a=>[a.id,a]));
const arr=v=>Array.isArray(v)?v:[];const iso=v=>v?new Date(v).toISOString():null;
export function dataTruthAgentIds(){return [...IDS]}
export function runDataTruthAgent(agentId,{symbols=[],sourceRecords=[],observations=[],calculations=[],missingEvidence=[],invokedAt=new Date().toISOString(),dataAsOf=null,codeVersion='v2.5-04',configVersion='v1'}={}){
 if(!IDS.includes(agentId))throw new Error('NOT_DATA_TRUTH_AGENT');const a=byId.get(agentId);if(!a)throw new Error('AGENT_NOT_REGISTERED');
 const sources=arr(sourceRecords).map((s,i)=>({sourceId:String(s.sourceId||agentId+'-source-'+i),sourceType:String(s.sourceType||'UNKNOWN'),retrievedAt:iso(s.retrievedAt||invokedAt),asOf:iso(s.asOf||dataAsOf),provenance:String(s.provenance||''),uri:s.uri??null,freshness:s.freshness||'UNKNOWN'})).filter(s=>s.provenance);
 const miss=[...arr(missingEvidence)];if(!sources.length)miss.push('No provenance-backed source records supplied.');
 const state=!sources.length?'UNAVAILABLE':miss.length?'PARTIAL':'AVAILABLE';
 const packet={schemaVersion:'1.0.0',packetId:'pkt-'+agentId+'-'+String(invokedAt).replace(/\W/g,'').slice(0,17),agent:{id:agentId,version:'1.0.0',mandate:a.mandate},scope:{kind:symbols.length?'SECURITY':'MARKET',symbols:[...new Set(symbols.map(String))],universeId:null},timing:{invokedAt:iso(invokedAt),dataAsOf:iso(dataAsOf),completedAt:new Date().toISOString()},evidenceState:state,inputs:sources.map(s=>({refId:s.sourceId,kind:'SOURCE',note:null})),observations:arr(observations).map((o,i)=>({claimId:o.claimId||agentId+'-obs-'+i,statement:String(o.statement||o),status:o.status||'OBSERVED',evidenceRefs:arr(o.evidenceRefs)})),calculations:arr(calculations),hypothesis:null,supportingEvidence:[],contradictingEvidence:[],missingEvidence:miss,uncertainty:{level:state==='AVAILABLE'?'LOW':'HIGH',reasons:miss,sampleSize:null},methodology:{confidenceKind:'NONE',value:null,description:'Data/truth packet reports source state; it does not infer probability or investment merit.',calibrationRef:null},sources,versions:{code:codeVersion,config:configVersion,model:null,dataContract:'data-truth.v1'},decision:{class:state==='UNAVAILABLE'?'UNAVAILABLE':'NO_OP',summary:'Factual evidence packet only; no investment recommendation.',direction:'NONE'},invalidationConditions:[],downstreamPacketRefs:[]};
 const v=validateAgentResearchPacket(packet);if(!v.ok)throw new Error('INVALID_PACKET:'+v.errors.join(','));return packet;
}
export function runDataTruthDepartment(inputsByAgent={}){return IDS.map(id=>runDataTruthAgent(id,inputsByAgent[id]||{}));}
