import './styles.css';
import './phase2.css';
import './phase3.css';
import { SYMBOLS } from './data/historical.js';
import { createReplayStore, snapshot, advance, reset } from './replay.js';
import { createLiveMarketStore, liveBars, livePrice, refreshLiveMarket, seedLiveHistory, checkLiveHealth } from './live-market.js';
import { analyzeMarket } from './market-analytics.js';
import { createPortfolio, buyPortfolio, sellPortfolio, performance, resetPortfolio } from './portfolio.js';
import { createAutopilot, evaluateAutopilot } from './autopilot.js';

const DEFAULTS = { commissionPerOrder: 0, secFeePerMillionOnSales: 20.6, tafPerShareOnSales: 0.000195, spreadBps: 4, slippageBps: 2 };
const replay = createReplayStore();
const live = createLiveMarketStore(SYMBOLS);
const portfolios = { human: createPortfolio('Human / Gated'), auto: createPortfolio('Autopilot') };
const autopilot = createAutopilot({ enabled: true, entryScore: 70, exitScore: 46, capitalFraction: 0.8 });
const state = { selected: 'NVDA', mode: 'REPLAY', costs: { ...DEFAULTS } };
const app = document.querySelector('#app');
let message = 'Parallel lab active: human/gated and autopilot accounts both start at $500 and see the same market data.';
let liveTimer = null;

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
const pct = (value) => `${value >= 0 ? '+' : ''}${Number(value || 0).toFixed(2)}%`;
const sharesText = (value) => Number(value || 0).toFixed(3).replace(/\.000$/, '');
const shortTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

function currentBars(symbol) { return state.mode === 'LIVE' ? liveBars(live, symbol) : snapshot(replay, symbol); }
function currentBar(symbol) { return currentBars(symbol).at(-1) || null; }
function price(symbol) { return state.mode === 'LIVE' ? livePrice(live, symbol) : replay.series[symbol]?.[replay.cursor]?.close || 0; }
function quote(symbol) { return state.mode === 'LIVE' ? live.market[symbol] || null : null; }
function eventTime(symbol) { return state.mode === 'LIVE' ? shortTime(live.market[symbol]?.quoteTime || live.fetchedAt) : currentBar(symbol)?.time || '--'; }
function evaluationKey(symbol) { return `${state.mode}:${symbol}:${state.mode === 'LIVE' ? live.fetchedAt || 'none' : currentBar(symbol)?.time || replay.cursor}`; }

function feeFor(side, fillPrice, shares) {
  const notional = fillPrice * shares;
  const spread = notional * state.costs.spreadBps / 10000;
  const slippage = notional * state.costs.slippageBps / 10000;
  const commission = state.costs.commissionPerOrder;
  const sec = side === 'SELL' ? notional * state.costs.secFeePerMillionOnSales / 1_000_000 : 0;
  const taf = side === 'SELL' ? Math.min(shares * state.costs.tafPerShareOnSales, 9.79) : 0;
  return { spread, slippage, commission, sec, taf, total: spread + slippage + commission + sec + taf };
}

function signalFor(symbol) {
  const benchmark = symbol === 'SPY' ? 'QQQ' : 'SPY';
  return analyzeMarket({ bars: currentBars(symbol), quote: quote(symbol), benchmarkBars: currentBars(benchmark) });
}

function bestAutopilotCandidate() {
  if (portfolios.auto.position) {
    const symbol = portfolios.auto.position.symbol;
    return { symbol, signal: signalFor(symbol) };
  }
  return SYMBOLS
    .map((symbol) => ({ symbol, signal: signalFor(symbol) }))
    .filter((item) => item.signal.ready)
    .sort((a, b) => b.signal.score - a.signal.score)[0] || { symbol: state.selected, signal: signalFor(state.selected) };
}

function runAutopilot() {
  const candidate = bestAutopilotCandidate();
  const result = evaluateAutopilot({
    autopilot,
    portfolio: portfolios.auto,
    signal: candidate.signal,
    symbol: candidate.symbol,
    price: price(candidate.symbol),
    costs: feeFor,
    time: eventTime(candidate.symbol),
    evaluationKey: evaluationKey(candidate.symbol),
  });
  if (result.executed) message = `Autopilot ${result.action}: ${result.reason}`;
  return result;
}

function humanTrade(side) {
  const symbol = state.selected;
  const signal = signalFor(symbol);
  const fillPrice = price(symbol);
  if (!(fillPrice > 0)) return setMessage('No market price is available yet.');

  if (side === 'BUY') {
    const result = buyPortfolio({
      portfolio: portfolios.human,
      symbol,
      price: fillPrice,
      costs: feeFor,
      time: eventTime(symbol),
      reason: `Human/gated entry at evidence score ${signal.score}. ${signal.reasons.join(' ')}`,
      stopPrice: signal.risk?.stopPrice ?? null,
      targetPrice: signal.risk?.targetPrice ?? null,
      maxCapitalFraction: 1,
    });
    return setMessage(result.ok ? `Human simulated BUY: ${sharesText(result.shares)} ${symbol} at ${money(fillPrice)}.` : result.reason);
  }

  const result = sellPortfolio({
    portfolio: portfolios.human,
    symbol,
    price: fillPrice,
    costs: feeFor,
    time: eventTime(symbol),
    reason: `Human/gated exit at evidence score ${signal.score}.`,
  });
  return setMessage(result.ok ? `Human simulated SELL: net ${money(result.net)}.` : result.reason);
}

function setMessage(value) { message = value; render(); }
function resetAll() { resetPortfolio(portfolios.human); resetPortfolio(portfolios.auto); reset(replay); autopilot.lastKey = null; autopilot.lastAction = 'WAIT'; setMessage('Both fictional $500 accounts and the replay were reset.'); }
function costInput(key, label, value, step) { return `<label>${label}<input data-cost="${key}" type="number" min="0" step="${step}" value="${value}"></label>`; }

function chart(symbol) {
  const bars = currentBars(symbol).slice(-80);
  if (!bars.length) return '<div class="empty chart-empty">No bars loaded yet.</div>';
  const min = Math.min(...bars.map((bar) => bar.low));
  const max = Math.max(...bars.map((bar) => bar.high));
  const range = Math.max(max - min, 0.01);
  const points = bars.map((bar, index) => `${(index / Math.max(bars.length - 1, 1)) * 700},${190 - ((bar.close - min) / range) * 160}`).join(' ');
  return `<svg viewBox="0 0 700 220" role="img"><path class="gridline" d="M0 40H700M0 90H700M0 140H700M0 190H700"/><polyline class="line" points="${points}"/></svg>`;
}

function feature(label, value) { return `<div class="feature"><span>${label}</span><strong>${value}</strong></div>`; }
function portfolioCard(key) {
  const portfolio = portfolios[key];
  const stats = performance(portfolio, price);
  const pos = portfolio.position;
  return `<article class="compare-card ${key}"><div class="compare-head"><div><span>${key === 'human' ? 'HUMAN / GATED' : 'AUTOPILOT'}</span><h3>${portfolio.name}</h3></div><strong>${money(stats.equity)}</strong></div><div class="compare-stats"><span>Return <b class="${stats.returnPct >= 0 ? 'up' : 'down'}">${pct(stats.returnPct)}</b></span><span>Realized <b>${money(stats.realized)}</b></span><span>Costs <b>${money(stats.fees)}</b></span><span>Closed <b>${stats.closedTrades}</b></span><span>Win rate <b>${(stats.winRate * 100).toFixed(0)}%</b></span></div><div class="position-line">${pos ? `${sharesText(pos.shares)} ${pos.symbol} @ ${money(pos.entry)} · stop ${money(pos.stopPrice)} · target ${money(pos.targetPrice)}` : 'Flat / no open position'}</div></article>`;
}

function tradeRows(portfolio, limit = 8) {
  if (!portfolio.trades.length) return '<div class="empty">No trades yet.</div>';
  return portfolio.trades.slice(0, limit).map((trade) => `<div class="trade"><div><b>${trade.side} ${trade.symbol}</b><small>${trade.time} · ${sharesText(trade.shares)} @ ${money(trade.price)}</small></div><strong>${trade.net === null ? `${money(trade.costs)} costs` : `${money(trade.net)} net`}</strong><p>${trade.reason}</p></div>`).join('');
}

function liveStatusText() {
  if (state.mode !== 'LIVE') return `REPLAY ${currentBar(state.selected)?.time || '--'}`;
  if (live.status === 'loading') return 'CONNECTING';
  if (live.status === 'live') return `${live.provider.toUpperCase()} ${live.feed.toUpperCase()}`;
  if (live.configured === false) return 'NEEDS API KEYS';
  if (live.status === 'error') return 'DATA ERROR';
  return 'LIVE IDLE';
}

async function connectLive() {
  stopLiveTimer();
  state.mode = 'LIVE';
  render();
  try { await checkLiveHealth(live, true); } catch { /* diagnostics appear below */ }
  await Promise.all(SYMBOLS.map((symbol) => seedLiveHistory(live, symbol)));
  try {
    await refreshLiveMarket(live);
    runAutopilot();
    message = 'Live market data connected. Human and autopilot tracks remain fictional.';
    startLiveTimer();
  } catch (error) { message = error.message; }
  render();
}

function startLiveTimer() {
  stopLiveTimer();
  liveTimer = setInterval(async () => {
    if (state.mode !== 'LIVE') return;
    try { await refreshLiveMarket(live); runAutopilot(); } catch { /* surfaced in UI */ }
    render();
  }, 5000);
}
function stopLiveTimer() { if (liveTimer) clearInterval(liveTimer); liveTimer = null; }
function switchToReplay() { stopLiveTimer(); state.mode = 'REPLAY'; message = 'Historical replay mode active.'; render(); }

function render() {
  const signal = signalFor(state.selected);
  const f = signal.features || {};
  const bar = currentBar(state.selected);
  const quoteData = quote(state.selected) || {};
  const autoCandidate = bestAutopilotCandidate();
  app.innerHTML = `<main class="shell"><header class="topbar"><div><div class="eyebrow">REDDIRT / TRADING LAB</div><h1>Parallel Decision Lab</h1><p>Human-gated vs shadow autopilot · same data · same costs · separate $500 accounts</p></div><div class="status ${state.mode === 'LIVE' && live.status === 'error' ? 'error' : ''}"><span></span>${liveStatusText()}</div></header>
  <section class="mode-switch"><button data-mode="REPLAY" class="${state.mode === 'REPLAY' ? 'active' : ''}">Historical Replay</button><button data-mode="LIVE" class="${state.mode === 'LIVE' ? 'active' : ''}">Live Market</button><button data-auto="TOGGLE" class="${autopilot.enabled ? 'auto-on' : ''}">Autopilot ${autopilot.enabled ? 'ON' : 'OFF'}</button><div class="safety-copy">Autopilot executes only against its fictional account. No broker-order endpoint is connected.</div></section>
  <section class="compare-grid">${portfolioCard('human')}${portfolioCard('auto')}</section>
  <section class="workspace"><div class="panel market"><div class="panel-head"><h2>Market + Analytics</h2><span>${state.selected}</span></div><div class="symbols">${SYMBOLS.map((symbol) => `<button class="symbol ${symbol === state.selected ? 'active' : ''}" data-symbol="${symbol}"><b>${symbol}</b><strong>${money(price(symbol))}</strong><small>score ${signalFor(symbol).score}</small></button>`).join('')}</div><div class="chart-wrap">${chart(state.selected)}</div><div class="quote-row"><span>Price <b>${money(price(state.selected))}</b></span><span>Bid <b>${quoteData.bid ? money(quoteData.bid) : '--'}</b></span><span>Ask <b>${quoteData.ask ? money(quoteData.ask) : '--'}</b></span><span>Volume <b>${(bar?.volume || 0).toLocaleString()}</b></span></div><div class="feature-grid">${feature('Evidence score', signal.score)}${feature('VWAP', f.vwap ? money(f.vwap) : '--')}${feature('Rel volume', f.relativeVolume ? `${f.relativeVolume.toFixed(2)}x` : '--')}${feature('5-bar momentum', f.momentum5 !== undefined ? pct(f.momentum5 * 100) : '--')}${feature('20-bar momentum', f.momentum20 !== undefined ? pct(f.momentum20 * 100) : '--')}${feature('Rel strength vs SPY', f.relativeStrength !== undefined ? pct(f.relativeStrength * 100) : '--')}${feature('Spread', f.spreadBps !== null && f.spreadBps !== undefined ? `${f.spreadBps.toFixed(1)} bps` : '--')}${feature('ATR', f.atr ? money(f.atr) : signal.risk?.atr ? money(signal.risk.atr) : '--')}</div>${state.mode === 'REPLAY' ? `<div class="replay-controls"><button data-replay="BACK">◀ Step</button><button data-replay="PLAY">${replay.playing ? 'Pause' : 'Play'}</button><button data-replay="NEXT">Step ▶</button><button data-replay="RESET">Reset replay</button></div>` : `<div class="live-controls"><button data-live="REFRESH">Refresh now</button><span>5 sec polling · last ${shortTime(live.fetchedAt)}</span></div>`}</div>
  <aside class="panel decision"><div class="panel-head"><h2>Human Gate</h2><span>WHY</span></div><div class="decision-action ${signal.action.toLowerCase()}">${signal.action}</div><div class="confidence">Evidence <strong>${signal.score}/100</strong> · confidence ${signal.confidence}%</div><h4>For</h4><ul>${(signal.reasons.length ? signal.reasons : ['No positive evidence yet.']).map((reason) => `<li>${reason}</li>`).join('')}</ul><h4>Against</h4><ul>${(signal.counterEvidence.length ? signal.counterEvidence : ['No material counter-evidence detected.']).map((reason) => `<li>${reason}</li>`).join('')}</ul><div class="invalidation"><b>Invalidation</b><p>${signal.invalidation}</p></div><div class="actions"><button class="primary" data-human="BUY">Human BUY</button><button data-human="SELL">Human SELL</button><button class="pause" data-reset="ALL">Reset both accounts</button></div></aside></section>
  <section class="workspace lower"><div class="panel"><div class="panel-head"><h2>Autopilot Watch</h2><span>${autopilot.enabled ? 'ACTIVE' : 'PAUSED'}</span></div><div class="autopilot-callout"><strong>${autopilot.lastAction}</strong><p>${autopilot.lastReason}</p></div><div class="feature-grid">${feature('Best candidate', autoCandidate.symbol)}${feature('Candidate score', autoCandidate.signal.score)}${feature('Entry threshold', autopilot.entryScore)}${feature('Exit threshold', autopilot.exitScore)}${feature('Capital per entry', `${Math.round(autopilot.capitalFraction * 100)}%`)}${feature('Decisions logged', portfolios.auto.decisions.length)}</div><p class="muted">This v1 autopilot is a deterministic quant core. The future AI layer will synthesize additional data and explain/critique these signals; it will not bypass the risk/execution engine.</p></div><div class="panel costs"><div class="panel-head"><h2>Execution Cost Model</h2><span>SHARED</span></div><div class="cost-grid">${costInput('commissionPerOrder','Commission / order',state.costs.commissionPerOrder,0.01)}${costInput('secFeePerMillionOnSales','Section 31 / $1M sales',state.costs.secFeePerMillionOnSales,0.01)}${costInput('tafPerShareOnSales','TAF / share sold',state.costs.tafPerShareOnSales,0.000001)}${costInput('spreadBps','Spread assumption (bps)',state.costs.spreadBps,0.1)}${costInput('slippageBps','Slippage assumption (bps)',state.costs.slippageBps,0.1)}</div></div></section>
  <section class="compare-grid journals"><div class="panel journal"><div class="panel-head"><h2>Human Journal</h2><span>${portfolios.human.trades.length}</span></div>${tradeRows(portfolios.human)}</div><div class="panel journal"><div class="panel-head"><h2>Autopilot Journal</h2><span>${portfolios.auto.trades.length}</span></div>${tradeRows(portfolios.auto)}</div></section>
  <footer><b>Experiment design:</b> both tracks receive the same observed market data and the same modeled trading costs. The human decides when to act on the gated recommendation; the shadow autopilot acts from its own fixed rules. Neither can place a real-money order.</footer><div class="toast" aria-live="polite">${message}</div></main>`;

  app.querySelectorAll('[data-symbol]').forEach((button) => button.addEventListener('click', async () => { state.selected = button.dataset.symbol; if (state.mode === 'LIVE' && !live.series[state.selected]?.length) await seedLiveHistory(live, state.selected); render(); }));
  app.querySelectorAll('[data-human]').forEach((button) => button.addEventListener('click', () => humanTrade(button.dataset.human)));
  app.querySelector('[data-auto]')?.addEventListener('click', () => { autopilot.enabled = !autopilot.enabled; message = `Autopilot ${autopilot.enabled ? 'enabled' : 'disabled'}.`; render(); });
  app.querySelector('[data-reset]')?.addEventListener('click', resetAll);
  app.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => button.dataset.mode === 'LIVE' ? connectLive() : switchToReplay()));
  app.querySelectorAll('[data-live]').forEach((button) => button.addEventListener('click', async () => { try { await refreshLiveMarket(live); runAutopilot(); message = 'Live market snapshot refreshed.'; } catch (error) { message = error.message; } render(); }));
  app.querySelectorAll('[data-replay]').forEach((button) => button.addEventListener('click', () => { const action = button.dataset.replay; if (action === 'PLAY') replay.playing = !replay.playing; else if (action === 'RESET') reset(replay); else if (action === 'NEXT') { advance(replay); runAutopilot(); } else if (action === 'BACK') replay.cursor = Math.max(0, replay.cursor - 1); render(); }));
  app.querySelectorAll('input[data-cost]').forEach((input) => input.addEventListener('change', () => { const key = input.dataset.cost; const value = Number(input.value); state.costs[key] = Number.isFinite(value) && value >= 0 ? value : DEFAULTS[key]; render(); }));
}

setInterval(() => { if (state.mode === 'REPLAY' && replay.playing) { advance(replay); runAutopilot(); render(); } }, 250);
render();
