import {buildMorningWarRoom,buildLiveWarRoom,warRoomHealth} from './trading-war-rooms.js';
import {portfolioRisk} from './risk-command-center.js';
import {computePremium,premiumExplanation} from './premium-intelligence.js';
import {classifyRegime,scoreOpportunity} from './market-brain.js';
const esc=v=>String(v??'--').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const panel=(title,value,detail='')=>`<div class="wb-war-card"><span>${esc(title)}</span><strong>${esc(value)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</div>`;
const n=(v,f=50)=>Number.isFinite(Number(v))?Math.max(0,Math.min(100,Number(v))):f;
function intelligence(signal={}){
 const f=signal.features||{},score=n(signal.score);
 const premium=computePremium({components:{technical:score,participation:n((f.relativeVolume||1)*35),relativeStrength:n(50+(f.momentum20||0)*500),regime:score,historicalEvidence:null,strategyConsensus:score,walkForward:null,calibration:null,eventEvidence:null,patternEvidence:n(50+(f.momentum5||0)*500)},penalties:{costLiquidity:n(f.spreadBps,0)/10,risk:0,dataQuality:0},stale:!signal.ready});
 const regime=classifyRegime({breadth:score,trend:n(50+(f.momentum20||0)*500),volatility:n(100-(f.atrPct||0)*500),dispersion:50,liquidity:n(100-(f.spreadBps||0)*2),correlation:50,stale:!signal.ready});
 const opportunity=scoreOpportunity({symbol:signal.symbol||null,premium,signals:{'premium-rise':premium.score,'relative-strength':n(50+(f.momentum20||0)*500),'volume-expansion':n((f.relativeVolume||1)*35),'trend-alignment':score,'regime-fit':regime.score,'historical-support':null}},regime);
 return{premium,regime,opportunity,explain:premiumExplanation(premium)};
}
export function warRoomMarkup({mode,selected,signal,portfolio,marketStatus,opportunitySymbol,opportunityScore}){
 const intel=intelligence({...signal,symbol:selected});
 const risk=portfolioRisk({asOf:new Date().toISOString(),equity:portfolio.equity||0,positions:portfolio.position?[{symbol:portfolio.position.symbol,quantity:portfolio.position.shares,price:portfolio.position.entry,side:'LONG',stop:portfolio.position.stopPrice??null,sector:null,beta:null,atr:null,avgDailyDollarVolume:null,eventRisk:null}]:[],provenance:{sourceState:'available'}});
 const marketBrain={sourceState:intel.regime.stale?'stale':'available',regime:intel.regime.label,score:intel.regime.score};
 const opportunities={sourceState:intel.opportunity.available?'available':'partial',symbol:intel.opportunity.available?selected:opportunitySymbol,score:intel.opportunity.score??opportunityScore};
 const common={marketBrain,opportunities,risk:{...risk,sourceState:'available'}};
 const room=mode==='LIVE'?buildLiveWarRoom({...common,positions:{sourceState:'available',position:portfolio.position||null},premiumVelocity:{sourceState:'partial'},watchlist:{sourceState:'available'},alerts:{sourceState:'partial'},copilot:{sourceState:'partial'}}):buildMorningWarRoom({...common,overnight:{sourceState:'partial'},catalysts:{sourceState:'partial'},watchlist:{sourceState:'available'},professor:{sourceState:'available'}});
 const health=warRoomHealth(room),top=intel.explain.whyNow[0];
 const stopRisk=risk.positions?.[0]?.stopLossPctEquity;
 return `<section class="panel wb-war-room" aria-labelledby="wb-war-title"><div class="panel-head"><div><span class="eyebrow">WEALTH BUILDER TERMINAL</span><h2 id="wb-war-title">${mode==='LIVE'?'Live War Room':'Session War Room'}</h2></div><span class="wb-health ${health.status.toLowerCase()}">${health.status}</span></div><p class="wb-war-question">${esc(room.question)}</p><div class="wb-war-grid">${panel('Premium',intel.premium.available?intel.premium.score+'/100':'Unavailable',intel.premium.available?`${intel.premium.direction} · ${intel.premium.conviction}`:`Coverage ${Math.round(intel.premium.evidenceCoverage*100)}%`)}${panel('Market Brain',intel.regime.label,intel.regime.score==null?'Insufficient evidence':`Regime evidence ${intel.regime.score}/100`)}${panel('Why now',top?.label||'Evidence incomplete',top?.score!=null?`${top.score}/100 component`:'No dominant component')}${panel('Opportunity',opportunities.symbol||'--',opportunities.score!=null?`Priority ${opportunities.score}/100`:'Insufficient evidence')}${panel('Gross exposure',risk.grossExposurePct==null?'--':risk.grossExposurePct.toFixed(1)+'%',stopRisk==null?'Stop risk unavailable':`Loss at stop ${stopRisk.toFixed(2)}% equity`)}${panel('Data coverage',Math.round(health.coverage*100)+'%',health.missingPanels.length?`Missing: ${health.missingPanels.join(', ')}`:'All panels present')}</div><div class="wb-war-note">Premium is a composite evidence score, not probability of profit. Market Brain and Opportunity use currently available evidence; missing inputs reduce coverage. Stress/risk estimates are models, not guarantees. Fictional trading only.</div></section>`;
}
