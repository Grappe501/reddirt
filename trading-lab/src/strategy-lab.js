import { providerTimeMs } from './data/historical.js';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

export const STRATEGIES=[
 {id:'evidence-trend',name:'Evidence Trend',description:'Requires strong evidence, positive medium momentum and price above VWAP.',enter:s=>s.ready&&s.score>=70&&(s.features?.momentum20||0)>0&&s.features?.close>=(s.features?.vwap||Infinity),exit:s=>s.score<=46||(s.features?.momentum5||0)<-.003},
 {id:'momentum-confirmed',name:'Momentum Confirmed',description:'Requires short and medium momentum agreement with relative strength.',enter:s=>s.ready&&(s.features?.momentum5||0)>.002&&(s.features?.momentum20||0)>.004&&(s.features?.relativeStrength||0)>=0,exit:s=>(s.features?.momentum5||0)<0||s.score<50},
 {id:'vwap-participation',name:'VWAP Participation',description:'Trades above VWAP when relative volume confirms participation.',enter:s=>s.ready&&s.features?.close>s.features?.vwap&&(s.features?.relativeVolume||0)>=1.1&&s.score>=62,exit:s=>s.features?.close<s.features?.vwap||s.score<48},
];

export function strategyById(id){return STRATEGIES.find(s=>s.id===id)||STRATEGIES[0]}

export function evaluateStrategy(strategy,signal,positionOpen=false){if(!signal?.ready)return{action:'WAIT',reason:'Insufficient feature history.'};if(positionOpen&&strategy.exit(signal))return{action:'SELL',reason:`${strategy.name} exit condition met.`};if(!positionOpen&&strategy.enter(signal))return{action:'BUY',reason:`${strategy.name} entry condition met.`};return{action:'WAIT',reason:`${strategy.name} conditions not met.`}}

export function summarizeClosedTrades(trades=[]){const closed=trades.filter(t=>Number.isFinite(t.pnl));const wins=closed.filter(t=>t.pnl>0);const grossWin=wins.reduce((a,t)=>a+t.pnl,0),grossLoss=Math.abs(closed.filter(t=>t.pnl<0).reduce((a,t)=>a+t.pnl,0));return{trades:closed.length,winRate:closed.length?wins.length/closed.length:0,net:closed.reduce((a,t)=>a+t.pnl,0),expectancy:closed.length?closed.reduce((a,t)=>a+t.pnl,0)/closed.length:0,profitFactor:grossLoss?grossWin/grossLoss:grossWin?Infinity:0}}

export function splitWalkForward(rows=[],trainPct=.7){const ordered=[...rows].sort((a,b)=>providerTimeMs(a.providerTime)-providerTimeMs(b.providerTime));const cut=clamp(Math.floor(ordered.length*trainPct),1,Math.max(1,ordered.length-1));return{train:ordered.slice(0,cut),test:ordered.slice(cut),cutIndex:cut}}

export function nearestHistoricalStates(current,history=[],limit=5){if(!current?.features)return[];const keys=['momentum5','momentum20','relativeStrength','realizedVolatility','spreadBps'];const scored=history.filter(x=>x?.features&&x.providerTime!==current.providerTime).map(row=>{let sum=0,n=0;for(const k of keys){const a=Number(current.features[k]),b=Number(row.features[k]);if(Number.isFinite(a)&&Number.isFinite(b)){const scale=k==='spreadBps'?10:.01;sum+=Math.abs(a-b)/scale;n++}}if(Number.isFinite(current.score)&&Number.isFinite(row.score)){sum+=Math.abs(current.score-row.score)/20;n++}return{...row,distance:n?sum/n:Infinity}}).filter(x=>Number.isFinite(x.distance)).sort((a,b)=>a.distance-b.distance).slice(0,limit);return scored}

export function historicalAnalogueSummary(current,history=[]){const matches=nearestHistoricalStates(current,history,5);return{matches,count:matches.length,averageScore:matches.length?matches.reduce((a,x)=>a+Number(x.score||0),0)/matches.length:null,regimes:[...new Set(matches.map(x=>x.regime).filter(Boolean))]}}
