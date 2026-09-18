import {buildMorningWarRoom,buildLiveWarRoom,buildClosingWarRoom,warRoomHealth} from './trading-war-rooms.js';
import {portfolioRisk} from './risk-command-center.js';

const esc=v=>String(v??'--').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const panel=(title,value,detail='')=>`<div class="wb-war-card"><span>${esc(title)}</span><strong>${esc(value)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</div>`;

export function warRoomMarkup({mode,selected,signal,portfolio,marketStatus,opportunitySymbol,opportunityScore}){
 const risk=portfolioRisk({asOf:new Date().toISOString(),equity:portfolio.equity||0,positions:portfolio.position?[{symbol:portfolio.position.symbol,quantity:portfolio.position.shares,price:portfolio.position.entry,side:'LONG',stop:portfolio.position.stopPrice??null,sector:null,beta:null,atr:null,avgDailyDollarVolume:null,eventRisk:null}]:[],provenance:{sourceState:'available'}});
 const marketBrain={sourceState:signal?.ready?'available':'partial',regime:signal?.action||'WAIT',score:signal?.score??null};
 const opportunities={sourceState:opportunitySymbol?'available':'partial',symbol:opportunitySymbol,score:opportunityScore};
 const common={marketBrain,opportunities,risk:{...risk,sourceState:'available'}};
 const room=mode==='LIVE'?buildLiveWarRoom({...common,positions:{sourceState:'available',position:portfolio.position||null},premiumVelocity:{sourceState:'partial'},watchlist:{sourceState:'available'},alerts:{sourceState:'partial'},copilot:{sourceState:'partial'}}):buildMorningWarRoom({...common,overnight:{sourceState:'partial'},catalysts:{sourceState:'partial'},watchlist:{sourceState:'available'},professor:{sourceState:'available'}});
 const health=warRoomHealth(room);
 return `<section class="panel wb-war-room" aria-labelledby="wb-war-title"><div class="panel-head"><div><span class="eyebrow">WEALTH BUILDER TERMINAL</span><h2 id="wb-war-title">${mode==='LIVE'?'Live War Room':'Session War Room'}</h2></div><span class="wb-health ${health.status.toLowerCase()}">${health.status}</span></div><p class="wb-war-question">${esc(room.question)}</p><div class="wb-war-grid">${panel('Market',marketBrain.regime,`Evidence ${marketBrain.score??'--'}/100`)}${panel('Focus',selected,marketStatus)}${panel('Opportunity',opportunitySymbol||'--',opportunityScore!=null?`Evidence ${opportunityScore}/100`:'No candidate')}${panel('Gross exposure',risk.grossExposurePct==null?'--':risk.grossExposurePct.toFixed(1)+'%')}${panel('Net exposure',risk.netExposurePct==null?'--':risk.netExposurePct.toFixed(1)+'%')}${panel('Data coverage',Math.round(health.coverage*100)+'%',health.missingPanels.length?`Missing: ${health.missingPanels.join(', ')}`:'All panels present')}</div><div class="wb-war-note">Evidence scores are not probabilities. Opportunity surfaces are for investigation, not trade recommendations. Fictional trading only.</div></section>`;
}
