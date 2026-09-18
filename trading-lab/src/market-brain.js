import cfg from '../market-brain/market-brain.v1.json' with { type:'json' };
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)));
const num=n=>Number.isFinite(Number(n));
export function classifyRegime(input={}){
 const values=cfg.regimeInputs.filter(k=>num(input[k])).map(k=>[k,clamp(input[k])]);
 const coverage=values.length/cfg.regimeInputs.length;if(!values.length)return{label:'UNKNOWN',coverage:0,score:null};
 const avg=values.reduce((a,[,v])=>a+v,0)/values.length;
 const label=input.stale?'STALE':coverage<.5?'LOW_CONFIDENCE':avg>=65?'SUPPORTIVE':avg<=35?'DEFENSIVE':'MIXED';
 return{label,coverage:Number(coverage.toFixed(3)),score:Number(avg.toFixed(1)),inputs:Object.fromEntries(values),stale:!!input.stale};
}
export function scoreOpportunity(candidate={},regime={}){
 let weighted=0,seen=0,total=cfg.opportunitySignals.reduce((a,s)=>a+s.weight,0),reasons=[];
 for(const s of cfg.opportunitySignals){const v=candidate.signals?.[s.id];if(!num(v))continue;const score=clamp(v);weighted+=score*s.weight;seen+=s.weight;reasons.push({id:s.id,label:s.label,score,weight:s.weight});}
 const coverage=seen/total,raw=seen?weighted/seen:0;
 const premiumAvailable=candidate.premium?.available!==false;
 const available=coverage>=cfg.minimumCoverage&&premiumAvailable&&!candidate.stale&&regime.label!=='STALE';
 const score=available?Number(raw.toFixed(1)):null;
 return{symbol:candidate.symbol,score,available,coverage:Number(coverage.toFixed(3)),premium:candidate.premium||null,regime:regime.label||'UNKNOWN',reasons:reasons.sort((a,b)=>(b.score-50)*b.weight-(a.score-50)*a.weight),whySurfaced:reasons.filter(x=>x.score>=65).slice(0,3).map(x=>x.label),disclaimer:'Investigation priority, not a trade recommendation.'};
}
export function opportunityBoard(candidates=[],marketInput={}){
 const regime=classifyRegime(marketInput);
 const rows=candidates.map(c=>scoreOpportunity(c,regime)).filter(x=>x.available&&x.score>=cfg.minimumOpportunityScore).sort((a,b)=>b.score-a.score);
 return{regime,generatedAt:new Date().toISOString(),opportunities:rows,unavailable:candidates.length-rows.length};
}
export function marketBrainSummary(board){return{regime:board.regime.label,regimeConfidence:board.regime.coverage,opportunityCount:board.opportunities.length,leaders:board.opportunities.slice(0,5).map(x=>({symbol:x.symbol,score:x.score,why:x.whySurfaced}))}}
