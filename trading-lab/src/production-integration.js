import { closeSimulationLearning, fetchLearningHistory, learningCommandCenter } from './learning-command-center.js';
import { labelForwardOutcomes } from './outcome-lab.js';
import { calibrationCycle } from './calibration-lab.js';
import { normalizeProviderTime } from './data/historical.js';

export function createProductionLearningController({memory,costs,fetchImpl=globalThis.fetch,onChange=()=>{}}){
 const state={latest:null,history:null,calibration:null,busy:false,lastError:null,learningPersisted:false,calibrationPersisted:false,lastLearningPersistenceError:null,lastCalibrationPersistenceError:null,lastClosedObservationKey:null};
 const notify=()=>onChange(state);
 const observations=()=> (memory?.observations||[]).filter(r=>Number(r.price)>0&&r.providerTime).map(r=>({...r,providerTime:normalizeProviderTime(r.providerTime)||r.providerTime}));
 const observationKey=rows=>rows.length?`${rows.length}:${rows[rows.length-1].symbol||''}:${rows[rows.length-1].providerTime}`:null;
 async function refresh(){state.history=await fetchLearningHistory(fetchImpl);if(state.history?.error)state.lastError=state.history.error;notify();return state.history}
 async function persistCalibration(cycle){const r=await fetchImpl('/.netlify/functions/calibration-cycle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(cycle)});const b=await r.json().catch(()=>({}));if(!r.ok||!b.ok)throw new Error(b.message||`Calibration persistence failed: ${r.status}`);return b}
 async function close(reason='MANUAL'){
  if(state.busy)return state;
  const rows=observations(),key=observationKey(rows);
  if(!key){state.lastError='No market observations are available to learn from.';notify();return state}
  if(key===state.lastClosedObservationKey){state.lastError='This observation set was already closed. Add new market evidence before learning again.';notify();return state}
  state.busy=true;state.lastError=null;state.learningPersisted=false;state.calibrationPersisted=false;state.lastLearningPersistenceError=null;state.lastCalibrationPersistenceError=null;notify();
  try{
   const id=`${reason.toLowerCase()}-${Date.now()}`;
   state.latest=await closeSimulationLearning({memory,costs,simulationId:id,fetchImpl});
   state.learningPersisted=Boolean(state.latest?.persisted);
   state.lastLearningPersistenceError=state.latest?.error||null;
   if(!state.learningPersisted)state.lastError=state.lastLearningPersistenceError||'Learning cycle was not persisted.';
   const labeled=labelForwardOutcomes(rows);
   state.calibration=calibrationCycle({labeled,simulationId:`cal-${id}`});
   try{await persistCalibration(state.calibration);state.calibrationPersisted=true}catch(e){state.lastCalibrationPersistenceError=e.message;state.lastError=e.message}
   if(state.learningPersisted&&state.calibrationPersisted)state.lastClosedObservationKey=key;
   await refresh();
  }catch(e){state.lastError=e.message}
  finally{state.busy=false;notify()}
  return state
 }
 return{state,refresh,close,html:()=>learningCommandCenter({latest:state.latest,history:state.history})};
}

export function costModelPanel(costs){const field=(key,label,step)=>`<label>${label}<input data-cost="${key}" type="number" step="${step}" min="0" value="${costs[key]}"></label>`;return`<section class="panel cost-model"><div class="panel-head"><div><h2>Execution Cost Model</h2><small>Applied to fictional simulation and research results</small></div><span>EDITABLE</span></div><div class="cost-grid">${field('commissionPerOrder','Commission / order','0.01')}${field('secFeePerMillionOnSales','SEC fee / $1M sales','0.1')}${field('tafPerShareOnSales','TAF / share sold','0.000001')}${field('spreadBps','Spread bps','0.1')}${field('slippageBps','Slippage bps','0.1')}</div></section>`}

export function bindCostInputs(root,costs,onChange){root.querySelectorAll('[data-cost]').forEach(input=>input.addEventListener('change',()=>{const v=Number(input.value);if(Number.isFinite(v)&&v>=0){costs[input.dataset.cost]=v;onChange?.(costs)}}))}
