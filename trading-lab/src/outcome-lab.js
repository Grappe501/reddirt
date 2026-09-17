import { evaluateStrategy, summarizeClosedTrades } from './strategy-lab.js';

export const OUTCOME_HORIZONS=[5,15,30,60];
const time=v=>new Date(v).getTime();

export function labelForwardOutcomes(rows=[],horizons=OUTCOME_HORIZONS){
 const bySymbol=new Map();for(const row of rows){if(!row?.symbol||!row?.providerTime||!(Number(row.price)>0))continue;if(!bySymbol.has(row.symbol))bySymbol.set(row.symbol,[]);bySymbol.get(row.symbol).push(row)}
 const labeled=[];
 for(const group of bySymbol.values()){
  group.sort((a,b)=>time(a.providerTime)-time(b.providerTime));
  for(let i=0;i<group.length;i++){const row=group[i],base=time(row.providerTime),outcomes={};for(const minutes of horizons){const target=base+minutes*60000;const future=group.find((x,j)=>j>i&&time(x.providerTime)>=target);outcomes[`${minutes}m`]=future?{providerTime:future.providerTime,price:Number(future.price),returnPct:(Number(future.price)-Number(row.price))/Number(row.price)}:null}labeled.push({...row,outcomes})}
 }
 return labeled.sort((a,b)=>time(a.providerTime)-time(b.providerTime));
}

export function applyRoundTripCosts({entryPrice,exitPrice,shares,commissionPerOrder=0,spreadBps=4,slippageBps=2,secFeePerMillionOnSales=20.6,tafPerShareOnSales=.000195}){
 const buyNotional=entryPrice*shares,sellNotional=exitPrice*shares,executionBps=spreadBps+slippageBps;
 const buyCosts=commissionPerOrder+buyNotional*executionBps/10000;
 const sellCosts=commissionPerOrder+sellNotional*executionBps/10000+sellNotional*secFeePerMillionOnSales/1e6+Math.min(shares*tafPerShareOnSales,9.79);
 return{buyCosts,sellCosts,total:buyCosts+sellCosts};
}

export function backtestStrategy({strategy,rows=[],startingCash=500,costs={}}){
 let cash=startingCash,position=null,peak=startingCash,maxDrawdown=0;const closed=[];
 for(const row of [...rows].sort((a,b)=>time(a.providerTime)-time(b.providerTime))){const signal={ready:true,score:Number(row.score||0),features:row.features||{}},decision=evaluateStrategy(strategy,signal,Boolean(position)),price=Number(row.price);if(!(price>0))continue;
  if(decision.action==='BUY'&&!position){const shares=Math.max(0,(cash*.8)/price);if(!shares)continue;position={symbol:row.symbol,entryPrice:price,shares,entryTime:row.providerTime};}
  else if(decision.action==='SELL'&&position&&position.symbol===row.symbol){const fees=applyRoundTripCosts({entryPrice:position.entryPrice,exitPrice:price,shares:position.shares,...costs}),gross=(price-position.entryPrice)*position.shares,pnl=gross-fees.total;cash+=pnl;closed.push({...position,exitPrice:price,exitTime:row.providerTime,gross,costs:fees.total,pnl});position=null;}
  const equity=cash+(position?(price-position.entryPrice)*position.shares:0);peak=Math.max(peak,equity);maxDrawdown=Math.max(maxDrawdown,peak?((peak-equity)/peak):0);
 }
 const summary=summarizeClosedTrades(closed);return{strategyId:strategy.id,startingCash,endingCash:cash,returnPct:(cash-startingCash)/startingCash,maxDrawdown,closedTrades:closed,...summary};
}

export function rollingWalkForward({strategy,rows=[],trainSize=120,testSize=40,costs={}}){const ordered=[...rows].sort((a,b)=>time(a.providerTime)-time(b.providerTime)),windows=[];for(let start=0;start+trainSize+testSize<=ordered.length;start+=testSize){const train=ordered.slice(start,start+trainSize),test=ordered.slice(start+trainSize,start+trainSize+testSize);windows.push({trainStart:train[0]?.providerTime,trainEnd:train.at(-1)?.providerTime,testStart:test[0]?.providerTime,testEnd:test.at(-1)?.providerTime,train:backtestStrategy({strategy,rows:train,costs}),test:backtestStrategy({strategy,rows:test,costs})})}return windows}

export function outcomeStats(labeled=[],horizon='15m'){const values=labeled.map(x=>x.outcomes?.[horizon]?.returnPct).filter(Number.isFinite);return{samples:values.length,averageReturn:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,positiveRate:values.length?values.filter(x=>x>0).length/values.length:null,min:values.length?Math.min(...values):null,max:values.length?Math.max(...values):null}}
