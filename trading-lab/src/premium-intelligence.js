import model from '../premium/premium-model.v1.json' with { type: 'json' };
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finite=n=>Number.isFinite(Number(n));
export function computePremium(input={}){
 const details=[];let weighted=0,weightSeen=0,totalWeight=model.components.reduce((a,c)=>a+c.weight,0);
 for(const c of model.components){const raw=input.components?.[c.id];if(!finite(raw)){details.push({...c,score:null,contribution:0,state:'missing'});continue}const score=clamp(Number(raw),0,100);weighted+=score*c.weight;weightSeen+=c.weight;details.push({...c,score,contribution:score*c.weight,state:'available'});}
 const coverage=totalWeight?weightSeen/totalWeight:0;
 const base=weightSeen?weighted/weightSeen:model.neutralScore;
 const penalties=model.penalties.map(p=>{const raw=input.penalties?.[p.id];const points=finite(raw)?clamp(Number(raw),0,p.maxPoints):0;return{...p,points}});const penaltyPoints=penalties.reduce((a,p)=>a+p.points,0);
 const score=clamp(base-penaltyPoints,0,100);
 const available=coverage>=model.rules.minimumEvidenceCoverage&&!input.stale;
 const direction=!available?'UNAVAILABLE':score>=model.directionThresholds.buy?'BUY':score<=model.directionThresholds.sell?'SELL':'HOLD';
 const distance=Math.abs(score-model.neutralScore);const conviction=[...model.convictionBands].reverse().find(x=>distance>=x.minDistance)?.label||'LOW';
 const evidence=[...model.evidenceBands].reverse().find(x=>coverage>=x.min)?.label||'WEAK';
 return{modelVersion:model.version,score:Number(score.toFixed(1)),direction,conviction:available?conviction:'LOW',evidenceQuality:evidence,evidenceCoverage:Number(coverage.toFixed(3)),available,stale:!!input.stale,components:details,penalties,disclaimer:'Evidence score, not probability of profit or investment advice.'};
}
export function premiumVelocity(history=[]){const valid=history.filter(x=>finite(x?.score));if(valid.length<2)return{state:'UNKNOWN',delta:null};const delta=Number(valid.at(-1).score)-Number(valid.at(-2).score);return{state:delta>1?'RISING':delta<-1?'FALLING':'STABLE',delta:Number(delta.toFixed(1))}}
export function premiumExplanation(result){return{whyNow:result.components.filter(x=>x.score!=null).sort((a,b)=>Math.abs(b.score-50)*b.weight-Math.abs(a.score-50)*a.weight).slice(0,3),whatWouldChangeMind:result.components.filter(x=>x.score==null).map(x=>x.label),riskOfBeingWrong:result.penalties.filter(x=>x.points>0),probabilityClaimAllowed:false}}
