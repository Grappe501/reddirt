import {
  createMarketMemory, persistMarketMemory, recordObservation, recordDecision, recordTrade,
  recordSourceHealth, computeBreadth, classifyRegime, memorySummary, clearMarketMemory,
} from './market-memory.js';

export function createPhase3BRuntime({ storage = globalThis.localStorage } = {}) {
  const memory = createMarketMemory({ storage });
  let lastBreadth = computeBreadth([]), lastRegime = 'INSUFFICIENT_DATA';
  const save = () => persistMarketMemory(memory, storage);
  function captureMarket({ mode, symbols, signalFor, priceFor, quoteFor, providerTimeFor }) {
    const items=[];
    for(const symbol of symbols){const signal=signalFor(symbol),price=priceFor(symbol),quote=quoteFor(symbol)||{},providerTime=providerTimeFor(symbol);items.push({symbol,signal,price});if(!providerTime)continue;recordObservation(memory,{mode,symbol,providerTime,price,bid:quote.bid,ask:quote.ask,volume:quote.volume,score:signal.score,action:signal.action,features:signal.features});}
    lastBreadth=computeBreadth(items);const benchmarkSignal=items.find(x=>x.symbol==='SPY')?.signal||null;lastRegime=classifyRegime({benchmarkSignal,breadth:lastBreadth});const latest=memory.regimes.at(-1),providerTime=providerTimeFor('SPY')||providerTimeFor(symbols[0]);if(providerTime&&(!latest||latest.providerTime!==providerTime||latest.regime!==lastRegime)){memory.regimes.push({providerTime,ingestedAt:new Date().toISOString(),regime:lastRegime,breadth:lastBreadth});if(memory.regimes.length>2000)memory.regimes.shift();}save();return{breadth:lastBreadth,regime:lastRegime};
  }
  function decision(event){recordDecision(memory,event);save()} function trade(event){recordTrade(memory,event);save()} function health(event){recordSourceHealth(memory,event);save()}
  function reset(){clearMarketMemory(memory,storage);lastBreadth=computeBreadth([]);lastRegime='INSUFFICIENT_DATA'}
  function status(){return{...memorySummary(memory),breadth:lastBreadth,regime:lastRegime}}
  function exportJson(){return JSON.stringify({exportedAt:new Date().toISOString(),schema:'reddirt-trading-lab-market-memory-v1',memory},null,2)}
  return{memory,captureMarket,decision,trade,health,reset,status,exportJson};
}

export function phase3BPanel(runtime,durable=null){
  const s=runtime.status(),b=s.breadth||{},remote=durable?.remote?.counts||{};
  const pct=v=>v==null?'--':`${(Number(v)*100).toFixed(0)}%`,ratio=v=>v==null?'--':Number(v).toFixed(2),names=items=>items?.length?items.map(i=>`${i.symbol} ${i.score}`).join(' · '):'--';
  const dbStatus=durable?.status||'STARTING',dbObs=remote.observations??'--',dbDec=remote.decisions??'--',dbTrades=remote.trades??'--';
  return `<section class="panel memory-panel"><div class="panel-head"><div><h2>Market Memory</h2><small>Phase 3B institutional memory · Netlify Database</small></div><span>${s.regime}</span></div><div class="feature-grid"><div class="feature"><span>Browser observations</span><strong>${s.observations}</strong></div><div class="feature"><span>Symbols remembered</span><strong>${s.symbols}</strong></div><div class="feature"><span>Browser decisions</span><strong>${s.decisions}</strong></div><div class="feature"><span>Browser trades</span><strong>${s.trades}</strong></div><div class="feature"><span>DB status</span><strong>${dbStatus}</strong></div><div class="feature"><span>DB observations</span><strong>${dbObs}</strong></div><div class="feature"><span>DB decisions</span><strong>${dbDec}</strong></div><div class="feature"><span>DB trades</span><strong>${dbTrades}</strong></div><div class="feature"><span>Above VWAP</span><strong>${pct(b.aboveVwapPct)}</strong></div><div class="feature"><span>Above SMA20</span><strong>${pct(b.aboveSma20Pct)}</strong></div><div class="feature"><span>Positive momentum</span><strong>${pct(b.positiveMomentumPct)}</strong></div><div class="feature"><span>Advance / decline</span><strong>${ratio(b.advanceDeclineRatio)}</strong></div></div><div class="memory-ranks"><p><b>Leaders:</b> ${names(b.leaders)}</p><p><b>Laggards:</b> ${names(b.laggards)}</p></div><div class="memory-meta">Latest market timestamp: ${s.latestProviderTime||'--'} · browser ingested: ${s.latestIngestedAt||'--'} · DB synced: ${durable?.lastSuccessAt||'--'}</div>${durable?.lastError?`<div class="memory-warning">Database sync: ${durable.lastError}</div>`:''}<div class="actions"><button data-memory="SYNC">Sync database now</button><button data-memory="EXPORT">Export experiment JSON</button><button data-memory="CLEAR">Clear browser memory</button></div></section>`;
}

export function downloadMarketMemory(runtime){const blob=new Blob([runtime.exportJson()],{type:'application/json'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`reddirt-market-memory-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;anchor.click();URL.revokeObjectURL(url)}
