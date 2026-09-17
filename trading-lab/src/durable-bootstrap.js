import { createDurableSyncState, startDurableLoop, syncDurableMemory, readDurableStatus } from './durable-memory.js';
import { escapeHtml } from './learning-command-center.js';

const MEMORY_KEY = 'reddirt:trading-lab:market-memory:v1';
const syncState = createDurableSyncState();

function currentMemory() {
  try { return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}') || {}; }
  catch { return {}; }
}

function counts() { return syncState.remote?.counts || {}; }
function fmt(value) { return value == null ? '--' : Number(value).toLocaleString(); }
function time(value) { if (!value) return '--'; const d=new Date(value); return Number.isNaN(d.getTime())?'--':d.toLocaleTimeString(); }

function renderDurableStatus() {
  const memoryPanel=document.querySelector('.memory-panel');
  if(!memoryPanel)return;
  let panel=document.querySelector('#durable-memory-status');
  if(!panel){panel=document.createElement('section');panel.id='durable-memory-status';panel.className='panel memory-panel durable-memory-panel';memoryPanel.insertAdjacentElement('afterend',panel);}
  const c=counts();
  panel.innerHTML=`<div class="panel-head"><div><h2>Durable Memory</h2><small>Netlify Database · automatic 15-second sync</small></div><span>${escapeHtml(syncState.status)}</span></div><div class="feature-grid"><div class="feature"><span>DB observations</span><strong>${fmt(c.observations)}</strong></div><div class="feature"><span>DB regimes</span><strong>${fmt(c.regimes)}</strong></div><div class="feature"><span>DB decisions</span><strong>${fmt(c.decisions)}</strong></div><div class="feature"><span>DB trades</span><strong>${fmt(c.trades)}</strong></div><div class="feature"><span>Experiment runs</span><strong>${fmt(c.experiment_runs)}</strong></div><div class="feature"><span>Source health</span><strong>${fmt(c.source_health)}</strong></div></div><div class="memory-meta">Last durable sync: ${time(syncState.lastSuccessAt)} · latest DB observation: ${time(c.latest_observation_at)}</div>${syncState.lastError?`<div class="memory-warning" role="status" aria-live="polite">${escapeHtml(syncState.lastError)}</div>`:''}<div class="actions"><button type="button" id="durable-sync-now">Sync database now</button><button type="button" id="durable-refresh-now">Refresh DB counts</button></div>`;
  panel.querySelector('#durable-sync-now')?.addEventListener('click',async()=>{await syncDurableMemory(currentMemory(),syncState);await readDurableStatus(syncState);renderDurableStatus();});
  panel.querySelector('#durable-refresh-now')?.addEventListener('click',async()=>{await readDurableStatus(syncState);renderDurableStatus();});
}

const proxyMemory = new Proxy({}, { get(_target, prop) { return currentMemory()?.[prop]; } });
startDurableLoop(proxyMemory,syncState,{intervalMs:15000,onUpdate:renderDurableStatus});
new MutationObserver(()=>{if(!document.querySelector('#durable-memory-status'))renderDurableStatus();}).observe(document.querySelector('#app'),{childList:true,subtree:true});
renderDurableStatus();
