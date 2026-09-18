import {portfolioRisk,preTradeRisk,stressScenario} from '../src/risk-command-center.js';
const s={snapshotId:'x',asOf:'2026-01-01',equity:10000,positions:[{symbol:'AAA',quantity:20,price:100,side:'LONG',stop:95,sector:'Tech',beta:1.2,atr:3,avgDailyDollarVolume:1000000,eventRisk:null}],limits:{maxPositionPct:25,maxSectorPct:30,maxStopLossPctEquity:2,maxGrossExposurePct:100},provenance:{sourceState:'available',marketDataAsOf:'2026-01-01'}};
const r=portfolioRisk(s);if(r.grossExposurePct!==20)throw new Error('gross exposure');
const p=preTradeRisk(s,{symbol:'BBB',quantity:20,price:100,side:'LONG',stop:90,sector:'Tech',beta:1,atr:4,avgDailyDollarVolume:1000000,eventRisk:null});if(p.pass||!p.breaches.some(x=>x.type==='SECTOR_CONCENTRATION'))throw new Error('concentration gate');
const st=stressScenario(s,{marketShockPct:-10});if(st.modeledPnl!==-200||!st.disclaimer.includes('not a forecast'))throw new Error('stress');console.log('risk-command-center contract: PASS');
