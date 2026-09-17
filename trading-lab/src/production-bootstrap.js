import './learning-command-center.css';
import './production-integration.css';
import { createProductionLearningController, costModelPanel, bindCostInputs } from './production-integration.js';
import { escapeHtml } from './learning-command-center.js';
import { readinessPanel } from './release-readiness.js';

const MEMORY_KEY='reddirt:trading-lab:market-memory:v1';
const COST_KEY='reddirt:trading-lab:research-costs:v1';
const DEFAULT_COSTS={commissionPerOrder:0,secFeePerMillionOnSales:20.6,tafPerShareOnSales:.000195,spreadBps:4,slippageBps:2};
const memory=new Proxy({}, {get(_t,p){try{return JSON.parse(localStorage.getItem(MEMORY_KEY)||'{}')?.[p]}catch{return undefined}}});
let costs={...DEFAULT_COSTS};try{costs={...costs,...JSON.parse(localStorage.getItem(COST_KEY)||'{}')}}catch{}
const proofs={validation:true,validationDetail:'Bounded research validator is wired to learning and calibration writes.'};
let rendering=false;
const controller=createProductionLearningController({memory,costs,onChange:()=>renderProduction()});

function inferProofs(){
 const durable=document.querySelector('#durable-memory-status');
 if(durable?.textContent?.includes('SYNCED')){proofs.database=true;proofs.databaseDetail='Durable Market Memory reports a successful database sync.'}
 proofs.learning=Boolean(controller.state.learningPersisted);
 proofs.learningDetail=proofs.learning?'A simulation learning cycle persisted successfully.':'No persisted learning cycle has been proven in this session.';
 proofs.calibration=Boolean(controller.state.calibrationPersisted);
 proofs.calibrationDetail=proofs.calibration?'A calibration cycle persisted successfully.':'No persisted calibration cycle has been proven in this session.';
 return proofs;
}
function calibrationPanel(){const c=controller.state.calibration;if(!c)return`<section class="panel calibration-panel"><div class="panel-head"><h2>Calibration</h2><span>WAITING</span></div><p>Close a simulation to measure score reliability and feature evidence.</p></section>`;const top=(c.ablation||[]).slice(0,4);return`<section class="panel calibration-panel"><div class="panel-head"><div><h2>Score Reliability + Feature Evidence</h2><small>${escapeHtml(c.horizon)} forward outcome · descriptive research, not probability calibration</small></div><span>${Number(c.samples)||0} SAMPLES</span></div><div class="feature-grid"><div class="feature"><span>Score reliability proxy</span><strong>${Number.isFinite(c.brier)?c.brier.toFixed(4):'--'}</strong></div>${top.map(f=>`<div class="feature"><span>${escapeHtml(f.feature)} correlation</span><strong>${Number.isFinite(f.correlation)?f.correlation.toFixed(3):'--'}</strong></div>`).join('')}</div><div class="memory-meta">The evidence score is not a predicted probability. Feature correlations are descriptive screening signals, not causal ablation results.</div>${controller.state.lastError?`<div class="memory-warning" role="status" aria-live="polite">${escapeHtml(controller.state.lastError)}</div>`:''}</section>`}
function bind(panel){
 panel.querySelector('[data-learning="CLOSE"]')?.addEventListener('click',()=>controller.close('MANUAL'));
 panel.querySelector('[data-learning="REFRESH"]')?.addEventListener('click',()=>controller.refresh());
 bindCostInputs(panel,costs,()=>{try{localStorage.setItem(COST_KEY,JSON.stringify(costs))}catch{}});
}
function renderProduction(){if(rendering)return;const shell=document.querySelector('.shell');if(!shell)return;rendering=true;let host=document.querySelector('#production-learning-host');if(!host){host=document.createElement('div');host.id='production-learning-host';const footer=shell.querySelector('footer');footer?.insertAdjacentElement('beforebegin',host)||shell.appendChild(host)}host.innerHTML=`${costModelPanel(costs)}${controller.html()}${calibrationPanel()}${readinessPanel(inferProofs())}<section class="panel methodology-panel"><div class="panel-head"><h2>Simulation Methodology</h2><span>EDUCATIONAL</span></div><p>All portfolios, trades and performance are simulated. Historical and shadow results do not guarantee future results. Modeled commissions, regulatory fees, spread and slippage may differ from real execution. Strategy research uses held-out windows, baseline comparisons and retained failures to reduce performance chasing. Score reliability metrics are research diagnostics rather than investment probabilities. This release has no real-money order route and no automatic live strategy promotion.</p></section>`;bind(host);rendering=false}

const app=document.querySelector('#app');
new MutationObserver(()=>{if(!document.querySelector('#production-learning-host'))renderProduction()}).observe(app,{childList:true,subtree:true});
setTimeout(()=>{renderProduction();controller.refresh()},0);
