import './styles.css';
import './phase2.css';
import { SYMBOLS } from './data/historical.js';
import { createReplayStore, snapshot, advance, reset } from './replay.js';
import { createLiveMarketStore, liveBars, livePrice, refreshLiveMarket, seedLiveHistory } from './live-market.js';

const STARTING_CASH = 500;
const DEFAULTS = { commissionPerOrder: 0, secFeePerMillionOnSales: 20.6, tafPerShareOnSales: 0.000195, spreadBps: 4, slippageBps: 2 };
const replay = createReplayStore();
const live = createLiveMarketStore(SYMBOLS);
const state = { cash: STARTING_CASH, position: null, realized: 0, fees: 0, trades: [], selected: 'NVDA', mode: 'REPLAY', costs: { ...DEFAULTS } };
const app = document.querySelector('#app');
let message = 'Phase 2 ready. Replay works immediately; LIVE uses Alpaca when Netlify market-data credentials are configured.';
let liveTimer = null;

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
const pct = (value) => `${value >= 0 ? '+' : ''}${Number(value || 0).toFixed(2)}%`;
const shortTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

function currentBars(symbol) { return state.mode === 'LIVE' ? liveBars(live, symbol) : snapshot(replay, symbol); }
function currentBar(symbol) { return currentBars(symbol).at(-1) || null; }
function price(symbol) { return state.mode === 'LIVE' ? livePrice(live, symbol) : replay.series[symbol]?.[replay.cursor]?.close || 0; }

function feeFor(side, fillPrice, shares) {
  const notional = fillPrice * shares;
  const spread = notional * state.costs.spreadBps / 10000;
  const slippage = notional * state.costs.slippageBps / 10000;
  const commission = state.costs.commissionPerOrder;
  const sec = side === 'SELL' ? notional * state.costs.secFeePerMillionOnSales / 1_000_000 : 0;
  const taf = side === 'SELL' ? Math.min(shares * state.costs.tafPerShareOnSales, 9.79) : 0;
  return { spread, slippage, commission, sec, taf, total: spread + slippage + commission + sec + taf };
}

function marketValue() { return state.position ? state.position.shares * price(state.position.symbol) : 0; }
function equity() { return state.cash + marketValue(); }

function decisionFor(symbol) {
  const bars = currentBars(symbol).slice(-20);
  if (bars.length < 20) return { action: 'WAIT', confidence: 50, reasons: [`${state.mode === 'LIVE' ? 'Live' : 'Replay'} analysis needs 20 completed bars; ${bars.length} are available.`], invalidation: 'No trade thesis exists until sufficient price and volume context is available.' };
  const last = bars.at(-1);
  const prior = bars.at(-2);
  const average = bars.reduce((sum, bar) => sum + bar.close, 0) / bars.length;
  const volumeAverage = bars.reduce((sum, bar) => sum + bar.volume, 0) / bars.length;
  const bullish = last.close > average && last.close > prior.close && last.volume > volumeAverage * 1.15;
  const distance = average > 0 ? Math.abs(last.close - average) / average : 0;
  return {
    action: bullish ? 'BUY' : 'WAIT',
    confidence: Math.min(90, Math.round(50 + distance * 400)),
    reasons: bullish ? ['Price is above its 20-bar average.', 'The newest completed bar closed above the prior bar.', 'Volume is at least 15% above the recent average.'] : ['Price/volume conditions do not satisfy the current momentum rule.', 'The agent waits rather than manufacturing a trade.', 'Phase 3 will expand this into multiple deterministic strategies.'],
    invalidation: bullish ? 'A reversal below recent structure invalidates the setup.' : 'No entry until price and volume confirm together.',
  };
}

function tradeTime(symbol) { return state.mode === 'LIVE' ? shortTime(live.market[symbol]?.quoteTime || live.fetchedAt || currentBar(symbol)?.time) : currentBar(symbol)?.time || '--'; }
function addTrade(side, symbol, shares, fillPrice, costs, why) { state.trades.unshift({ time: tradeTime(symbol), side, symbol, shares, price: fillPrice, costs: costs.total, why, mode: state.mode }); }
function setMessage(value) { message = value; render(); }

function trade(side) {
  const symbol = state.selected;
  const fillPrice = price(symbol);
  if (!fillPrice) return setMessage(`${state.mode} market price is not available yet.`);
  if (side === 'BUY') {
    if (state.position) return setMessage('One simulated position is already open.');
    const shares = Math.floor(state.cash / fillPrice);
    if (shares < 1) return setMessage('Not enough simulated cash to buy one share.');
    const costs = feeFor('BUY', fillPrice, shares);
    const total = shares * fillPrice + costs.total;
    if (total > state.cash) return setMessage('Not enough simulated cash after modeled execution costs.');
    state.cash -= total;
    state.position = { symbol, shares, entry: fillPrice, entryCosts: costs.total, mode: state.mode };
    state.fees += costs.total;
    addTrade('BUY', symbol, shares, fillPrice, costs, `${state.mode} simulated entry. The order never leaves the browser.`);
    return setMessage(`Simulated BUY: ${shares} ${symbol} at ${money(fillPrice)}. Entry costs: ${money(costs.total)}.`);
  }
  if (!state.position) return setMessage('No open simulated position to sell.');
  const pos = state.position;
  if (pos.symbol !== symbol) return setMessage(`The open simulated position is ${pos.symbol}. Select it before selling.`);
  const costs = feeFor('SELL', fillPrice, pos.shares);
  const proceeds = pos.shares * fillPrice;
  const gross = (fillPrice - pos.entry) * pos.shares;
  const net = gross - pos.entryCosts - costs.total;
  state.cash += proceeds - costs.total;
  state.realized += net;
  state.fees += costs.total;
  addTrade('SELL', pos.symbol, pos.shares, fillPrice, costs, 'Closed simulated position. Net result includes modeled entry and exit friction.');
  state.position = null;
  setMessage(`Simulated SELL: ${pos.shares} ${pos.symbol} at ${money(fillPrice)}. Net result: ${money(net)}.`);
}

function resetAccount() {
  state.cash = STARTING_CASH;
  state.position = null;
  state.realized = 0;
  state.fees = 0;
  state.trades = [];
  reset(replay);
  setMessage('The fictional $500 account was reset. Live/replay market data was not altered.');
}

function costInput(key, label, value, step) { return `<label>${label}<input data-cost="${key}" type="number" min="0" step="${step}" value="${value}"></label>`; }

function chart(symbol) {
  const bars = currentBars(symbol).slice(-80);
  if (!bars.length) return '<div class="empty chart-empty">No bars loaded yet.</div>';
  const min = Math.min(...bars.map((bar) => bar.low));
  const max = Math.max(...bars.map((bar) => bar.high));
  const range = Math.max(max - min, 0.01);
  const points = bars.map((bar, index) => `${(index / Math.max(bars.length - 1, 1)) * 700},${190 - ((bar.close - min) / range) * 160}`).join(' ');
  return `<svg viewBox="0 0 700 220" role="img" aria-label="${state.mode.toLowerCase()} market chart"><path class="gridline" d="M0 40H700M0 90H700M0 140H700M0 190H700"/><polyline class="line" points="${points}"/></svg>`;
}

function liveStatusText() {
  if (live.status === 'loading') return 'CONNECTING';
  if (live.status === 'live') return `${live.provider.toUpperCase()} ${live.feed.toUpperCase()}`;
  if (live.configured === false) return 'NEEDS API KEYS';
  if (live.status === 'error') return 'DATA ERROR';
  return 'NOT CONNECTED';
}

async function connectLive() {
  stopLiveTimer();
  state.mode = 'LIVE';
  render();
  await seedLiveHistory(live, state.selected);
  try {
    await refreshLiveMarket(live);
    message = `Live market data connected through ${live.provider.toUpperCase()} ${live.feed.toUpperCase()}. Trades remain fictional.`;
    startLiveTimer();
  } catch (error) { message = error.message; }
  render();
}

function startLiveTimer() {
  stopLiveTimer();
  liveTimer = setInterval(async () => {
    if (state.mode !== 'LIVE') return;
    try { await refreshLiveMarket(live); } catch { /* surfaced in UI */ }
    render();
  }, 5000);
}

function stopLiveTimer() { if (liveTimer) clearInterval(liveTimer); liveTimer = null; }

async function selectSymbol(symbol) {
  state.selected = symbol;
  if (state.mode === 'LIVE' && !(live.series[symbol]?.length)) await seedLiveHistory(live, symbol);
  render();
}

function switchToReplay() {
  stopLiveTimer();
  state.mode = 'REPLAY';
  message = 'Historical replay mode active. Dataset remains deterministic synthetic data in Phase 2.';
  render();
}

function render() {
  const selectedPrice = price(state.selected);
  const accountReturn = (equity() - STARTING_CASH) / STARTING_CASH * 100;
  const openPnl = state.position ? (price(state.position.symbol) - state.position.entry) * state.position.shares - state.position.entryCosts : 0;
  const decision = decisionFor(state.selected);
  const bar = currentBar(state.selected);
  const quote = live.market[state.selected] || {};
  const modeLabel = state.mode === 'LIVE' ? liveStatusText() : `REPLAY ${currentBar(state.selected)?.time || '--'}`;
  app.innerHTML = `<main class="shell"><header class="topbar"><div><div class="eyebrow">REDDIRT / TRADING LAB</div><h1>Paper Trading Control Room</h1><p>Phase 2 · live-data adapter + historical replay · $500 fictional account</p></div><div class="status ${state.mode === 'LIVE' && live.status === 'error' ? 'error' : ''}"><span></span>${modeLabel}</div></header>
  <section class="mode-switch" aria-label="Market mode"><button data-mode="REPLAY" class="${state.mode === 'REPLAY' ? 'active' : ''}">Historical Replay</button><button data-mode="LIVE" class="${state.mode === 'LIVE' ? 'active' : ''}">Live Market</button><div class="safety-copy">All BUY/SELL actions remain simulated. No broker-order endpoint exists in Phase 2.</div></section>
  <section class="grid metrics"><article><span>Equity</span><strong>${money(equity())}</strong><em class="${accountReturn >= 0 ? 'up' : 'down'}">${pct(accountReturn)}</em></article><article><span>Cash</span><strong>${money(state.cash)}</strong><em>fictional capital</em></article><article><span>Open P/L</span><strong>${money(openPnl)}</strong><em>${state.position ? `${state.position.shares} ${state.position.symbol}` : 'flat'}</em></article><article><span>Total costs</span><strong>${money(state.fees)}</strong><em>modeled execution</em></article></section>
  <section class="workspace"><div class="panel market"><div class="panel-head"><h2>${state.mode === 'LIVE' ? 'Live Market' : 'Historical Replay'}</h2><span>${state.selected}</span></div><div class="symbols">${SYMBOLS.map((symbol) => `<button class="symbol ${symbol === state.selected ? 'active' : ''}" data-symbol="${symbol}"><b>${symbol}</b><strong>${money(price(symbol))}</strong><small>${state.mode === 'LIVE' ? shortTime(live.market[symbol]?.quoteTime || live.fetchedAt) : currentBar(symbol)?.time || '--'}</small></button>`).join('')}</div><div class="chart-wrap">${chart(state.selected)}</div><div class="quote-row"><span>Price <b>${selectedPrice ? money(selectedPrice) : '--'}</b></span><span>Bid <b>${state.mode === 'LIVE' && quote.bid ? money(quote.bid) : '--'}</b></span><span>Ask <b>${state.mode === 'LIVE' && quote.ask ? money(quote.ask) : '--'}</b></span><span>Volume <b>${(bar?.volume || 0).toLocaleString()}</b></span></div>${state.mode === 'REPLAY' ? `<div class="replay-controls"><button data-replay="BACK">◀ Step</button><button data-replay="PLAY">${replay.playing ? 'Pause' : 'Play'}</button><button data-replay="NEXT">Step ▶</button><button data-replay="RESET">Reset</button></div>` : `<div class="live-controls"><button data-live="REFRESH">Refresh now</button><span>Auto-refresh: 5 sec · ${live.fetchedAt ? `last ${shortTime(live.fetchedAt)}` : 'not connected'}</span></div>`}</div>
  <aside class="panel decision"><div class="panel-head"><h2>Agent Decision</h2><span>WHY</span></div><div class="decision-action ${decision.action.toLowerCase()}">${decision.action}</div><div class="confidence">Rule confidence <strong>${decision.confidence}%</strong></div><ul>${decision.reasons.map((reason) => `<li>${reason}</li>`).join('')}</ul><div class="invalidation"><b>Invalidation</b><p>${decision.invalidation}</p></div><div class="actions"><button class="primary" data-action="BUY">Simulate BUY</button><button data-action="SELL">Simulate SELL</button><button class="pause" data-action="RESET">Reset $500 Account</button></div></aside></section>
  <section class="workspace lower"><div class="panel costs"><div class="panel-head"><h2>Execution Cost Model</h2><span>EDITABLE</span></div><p class="muted">Results include spread, slippage, commission assumptions, Section 31 pass-through modeling and FINRA TAF modeling.</p><div class="cost-grid">${costInput('commissionPerOrder','Commission / order',state.costs.commissionPerOrder,0.01)}${costInput('secFeePerMillionOnSales','Section 31 / $1M sales',state.costs.secFeePerMillionOnSales,0.01)}${costInput('tafPerShareOnSales','TAF / share sold',state.costs.tafPerShareOnSales,0.000001)}${costInput('spreadBps','Spread assumption (bps)',state.costs.spreadBps,0.1)}${costInput('slippageBps','Slippage assumption (bps)',state.costs.slippageBps,0.1)}</div></div><div class="panel journal"><div class="panel-head"><h2>Trade Journal</h2><span>${state.trades.length} EVENTS</span></div>${state.trades.length ? state.trades.slice(0,10).map((item) => `<div class="trade"><div><b>${item.side} ${item.symbol}</b><small>${item.time} · ${item.shares} shares @ ${money(item.price)} · ${item.mode}</small></div><strong>${money(item.costs)} costs</strong><p>${item.why}</p></div>`).join('') : '<div class="empty">No trades yet. Observe the market, inspect WHY, then make a fictional trade.</div>'}</div></section>
  <section class="panel provider-panel"><div class="panel-head"><h2>Phase 2 Data Adapter</h2><span>${liveStatusText()}</span></div><div class="provider-grid"><div><b>Provider</b><strong>${live.provider.toUpperCase()}</strong><small>credentials stay in Netlify environment variables</small></div><div><b>Feed</b><strong>${live.feed.toUpperCase()}</strong><small>IEX default; SIP requires provider entitlement</small></div><div><b>Transport</b><strong>SERVER-SIDE REST</strong><small>browser polls the Netlify function every 5 seconds</small></div><div><b>Broker orders</b><strong>DISABLED</strong><small>Phase 2 exposes market data only</small></div></div>${live.error ? `<div class="provider-error">${live.error}</div>` : ''}</section>
  <footer><b>Education simulator:</b> live prices can be real when configured, but every trade and account balance shown here is fictional. Phase 2 has no endpoint capable of placing a real order.</footer><div class="toast" aria-live="polite">${message}</div></main>`;

  app.querySelectorAll('[data-symbol]').forEach((button) => button.addEventListener('click', () => selectSymbol(button.dataset.symbol)));
  app.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => button.dataset.action === 'RESET' ? resetAccount() : trade(button.dataset.action)));
  app.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => button.dataset.mode === 'LIVE' ? connectLive() : switchToReplay()));
  app.querySelectorAll('[data-live]').forEach((button) => button.addEventListener('click', async () => { button.disabled = true; try { await refreshLiveMarket(live); message = 'Live market snapshot refreshed.'; } catch (error) { message = error.message; } render(); }));
  app.querySelectorAll('[data-replay]').forEach((button) => button.addEventListener('click', () => { const action = button.dataset.replay; if (action === 'PLAY') replay.playing = !replay.playing; else if (action === 'RESET') reset(replay); else if (action === 'NEXT') advance(replay); else if (action === 'BACK') replay.cursor = Math.max(0, replay.cursor - 1); render(); }));
  app.querySelectorAll('input[data-cost]').forEach((input) => input.addEventListener('change', () => { const key = input.dataset.cost; const value = Number(input.value); state.costs[key] = Number.isFinite(value) && value >= 0 ? value : DEFAULTS[key]; render(); }));
}

setInterval(() => { if (state.mode === 'REPLAY' && replay.playing) { advance(replay); render(); } }, 250);
render();
