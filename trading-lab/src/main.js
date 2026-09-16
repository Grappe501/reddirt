import './styles.css';

const STARTING_CASH = 500;
const DEFAULTS = {
  commissionPerOrder: 0,
  secFeePerMillionOnSales: 20.60,
  tafPerShareOnSales: 0.000195,
  spreadBps: 4,
  slippageBps: 2,
};

const state = {
  cash: STARTING_CASH,
  position: null,
  realized: 0,
  fees: 0,
  trades: [],
  prices: { SPY: 672.14, QQQ: 601.22, NVDA: 177.31, AAPL: 238.18 },
  selected: 'NVDA',
  tape: [],
  paused: false,
  costs: { ...DEFAULTS },
};

const app = document.querySelector('#app');

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function pct(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function feeFor(order, price, shares) {
  const notional = price * shares;
  const spread = notional * (state.costs.spreadBps / 10000);
  const slippage = notional * (state.costs.slippageBps / 10000);
  const commission = state.costs.commissionPerOrder;
  const sec = order === 'SELL' ? notional * (state.costs.secFeePerMillionOnSales / 1_000_000) : 0;
  const taf = order === 'SELL' ? Math.min(shares * state.costs.tafPerShareOnSales, 9.79) : 0;
  return { spread, slippage, commission, sec, taf, total: spread + slippage + commission + sec + taf };
}

function marketValue() {
  return state.position ? state.position.shares * state.prices[state.position.symbol] : 0;
}

function equity() {
  return state.cash + marketValue();
}

function decisionFor(symbol) {
  const price = state.prices[symbol];
  const momentum = ((price % 10) / 10);
  const volume = 1 + ((Math.sin(price) + 1) / 2) * 1.2;
  const bullish = momentum > 0.45 && volume > 1.4;
  return {
    action: bullish ? 'BUY' : 'WAIT',
    confidence: Math.round(55 + momentum * 25),
    reasons: bullish
      ? ['Price momentum is positive in the simulated tape.', 'Relative volume is above the Phase 0 threshold.', 'The model is treating the setup as a momentum continuation.']
      : ['Momentum is not strong enough for the entry rule.', 'The simulated volume confirmation is incomplete.', 'The agent would rather preserve cash than force a trade.'],
    invalidation: bullish ? `A loss of momentum below the simulated trigger would invalidate the setup.` : 'No position is justified until the setup confirms.',
  };
}

function trade(action) {
  const symbol = state.selected;
  const price = state.prices[symbol];
  const shares = Math.max(1, Math.floor(state.cash / price));
  if (action === 'BUY') {
    if (state.position) return setMessage('Position already open. Phase 0 allows one position at a time.');
    const costs = feeFor('BUY', price, shares);
    const total = shares * price + costs.total;
    if (total > state.cash) return setMessage('Not enough simulated cash after estimated execution costs.');
    state.cash -= total;
    state.position = { symbol, shares, entry: price, entryCosts: costs.total };
    state.fees += costs.total;
    addTrade('BUY', symbol, shares, price, costs, `Opened because the Phase 0 momentum/volume rules confirmed the setup.`);
    setMessage(`Bought ${shares} ${symbol}. Estimated execution cost: ${money(costs.total)}.`);
  } else if (action === 'SELL') {
    if (!state.position) return setMessage('No open position to sell.');
    const pos = state.position;
    const proceeds = pos.shares * price;
    const costs = feeFor('SELL', price, pos.shares);
    const gross = (price - pos.entry) * pos.shares;
    const net = gross - pos.entryCosts - costs.total;
    state.cash += proceeds - costs.total;
    state.realized += net;
    state.fees += costs.total;
    addTrade('SELL', symbol, pos.shares, price, costs, `Closed the position. Net result includes entry and exit execution costs.`);
    state.position = null;
    setMessage(`Sold ${pos.shares} ${symbol}. Net trade result: ${money(net)}.`);
  }
  render();
}

function addTrade(side, symbol, shares, price, costs, why) {
  state.trades.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    side, symbol, shares, price, costs: costs.total, why,
  });
}

let message = 'Offline simulation. No broker, exchange, or real money is connected.';
function setMessage(value) { message = value; render(); }

function render() {
  const selected = state.selected;
  const selectedPrice = state.prices[selected];
  const dayReturn = ((equity() - STARTING_CASH) / STARTING_CASH) * 100;
  const openPnl = state.position ? (selectedPrice - state.position.entry) * state.position.shares - state.position.entryCosts : 0;
  const decision = decisionFor(selected);

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div>
          <div class="eyebrow">REDDIRT / TRADING LAB</div>
          <h1>Paper Trading Control Room</h1>
          <p>Phase 0 · offline market simulation · $500 starting account</p>
        </div>
        <div class="status ${state.paused ? 'paused' : ''}"><span></span>${state.paused ? 'AGENT PAUSED' : 'SIMULATION RUNNING'}</div>
      </header>

      <section class="grid metrics">
        <article><span>Equity</span><strong>${money(equity())}</strong><em class="${dayReturn >= 0 ? 'up' : 'down'}">${pct(dayReturn)}</em></article>
        <article><span>Cash</span><strong>${money(state.cash)}</strong><em>available</em></article>
        <article><span>Open P/L</span><strong>${money(openPnl)}</strong><em>${state.position ? state.position.shares + ' shares' : 'flat'}</em></article>
        <article><span>Total costs</span><strong>${money(state.fees)}</strong><em>modeled execution</em></article>
      </section>

      <section class="workspace">
        <div class="panel market">
          <div class="panel-head"><h2>Market Watch</h2><span>SIMULATED TAPE</span></div>
          <div class="symbols">
            ${Object.entries(state.prices).map(([symbol, price]) => `<button class="symbol ${symbol === selected ? 'active' : ''}" data-symbol="${symbol}"><b>${symbol}</b><strong>${money(price)}</strong><small>phase 0 feed</small></button>`).join('')}
          </div>
          <div class="chart-wrap">
            <svg viewBox="0 0 700 220" role="img" aria-label="Simulated price chart">
              <path class="gridline" d="M0 40H700M0 90H700M0 140H700M0 190H700" />
              <polyline class="line" points="0,168 45,158 90,164 135,130 180,143 225,112 270,120 315,92 360,105 405,72 450,86 495,62 540,74 585,48 630,60 700,36" />
            </svg>
          </div>
          <div class="quote-row"><span>Last <b>${money(selectedPrice)}</b></span><span>Spread <b>${(selectedPrice * state.costs.spreadBps / 10000).toFixed(3)}</b></span><span>Regime <b>Momentum</b></span></div>
        </div>

        <aside class="panel decision">
          <div class="panel-head"><h2>Agent Decision</h2><span>WHY</span></div>
          <div class="decision-action ${decision.action.toLowerCase()}">${decision.action}</div>
          <div class="confidence">Model confidence <strong>${decision.confidence}%</strong></div>
          <ul>${decision.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
          <div class="invalidation"><b>Invalidation</b><p>${decision.invalidation}</p></div>
          <div class="actions">
            <button class="primary" data-action="BUY" ${state.paused ? 'disabled' : ''}>Simulate BUY</button>
            <button data-action="SELL">Simulate SELL</button>
            <button class="pause" data-action="PAUSE">${state.paused ? 'Resume Agent' : 'Pause Agent'}</button>
          </div>
        </aside>
      </section>

      <section class="workspace lower">
        <div class="panel costs">
          <div class="panel-head"><h2>Execution Cost Model</h2><span>EDITABLE</span></div>
          <p class="muted">Every simulated trade records estimated spread, slippage, commission and regulatory costs. Broker-specific schedules will replace these defaults in a later phase.</p>
          <div class="cost-grid">
            ${costInput('commissionPerOrder','Commission / order',state.costs.commissionPerOrder,2)}
            ${costInput('secFeePerMillionOnSales','Section 31 / $1M sales',state.costs.secFeePerMillionOnSales,2)}
            ${costInput('tafPerShareOnSales','TAF / share sold',state.costs.tafPerShareOnSales,6)}
            ${costInput('spreadBps','Spread assumption (bps)',state.costs.spreadBps,1)}
            ${costInput('slippageBps','Slippage assumption (bps)',state.costs.slippageBps,1)}
          </div>
          <div class="cost-note">Current Phase 0 default uses a $20.60 / $1M Section 31 rate for covered stock sales. The SEC says this rate became effective April 4, 2026; actual customer charges depend on the broker. citeturn0search0turn0search3</div>
        </div>
        <div class="panel journal">
          <div class="panel-head"><h2>Trade Journal</h2><span>${state.trades.length} EVENTS</span></div>
          ${state.trades.length ? state.trades.slice(0,6).map(t => `<div class="trade"><div><b>${t.side} ${t.symbol}</b><small>${t.time} · ${t.shares} shares @ ${money(t.price)}</small></div><strong>${money(t.costs)} costs</strong><p>${t.why}</p></div>`).join('') : '<div class="empty">No trades yet. The journal will preserve the reason, execution cost and result of every simulated order.</div>'}
        </div>
      </section>

      <footer><b>Phase 0 rule:</b> no live market APIs, no broker credentials, no real orders. The simulator is deliberately isolated while we build the accounting and teaching engine.</footer>
      <div class="toast" aria-live="polite">${message}</div>
    </main>
  `;

  app.querySelectorAll('[data-symbol]').forEach(btn => btn.addEventListener('click', () => { state.selected = btn.dataset.symbol; render(); }));
  app.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'PAUSE') { state.paused = !state.paused; render(); return; }
    trade(action);
  }));
  app.querySelectorAll('input[data-cost]').forEach(input => input.addEventListener('change', () => {
    const key = input.dataset.cost;
    const value = Number(input.value);
    state.costs[key] = Number.isFinite(value) && value >= 0 ? value : DEFAULTS[key];
    render();
  }));
}

function costInput(key, label, value, step) {
  return `<label>${label}<input data-cost="${key}" type="number" min="0" step="${step}" value="${value}"></label>`;
}

setInterval(() => {
  if (state.paused) return;
  Object.keys(state.prices).forEach((symbol, i) => {
    const drift = Math.sin(Date.now() / 2200 + i * 1.7) * 0.025 + (Math.random() - 0.5) * 0.04;
    state.prices[symbol] = Math.max(1, state.prices[symbol] * (1 + drift / 100));
  });
  render();
}, 1800);

render();
