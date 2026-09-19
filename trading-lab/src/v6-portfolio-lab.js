import { applyFill, createCompetitionPortfolio } from './v5-competition-portfolio.js';
import { escapeAttr, escapeHtml as esc } from './v6-production-proof.js';

export const PAPER_DESK_KEY = 'wb-paper-desk-v1';

export function portfolioView({
  cash = 100000,
  positions = [],
  fills = [],
  startingCapital = 100000,
  assigned = true,
} = {}) {
  const marketValue = positions.reduce((a, p) => a + Number(p.marketValue ?? Number(p.shares || 0) * Number(p.price || 0)), 0);
  const equity = Number(cash) + marketValue;
  return {
    cash: Number(cash),
    positions,
    fillCount: fills.length,
    marketValue,
    equity,
    returnPct: startingCapital ? ((equity - startingCapital) / startingCapital) * 100 : 0,
    simulationOnly: true,
    assigned: assigned !== false,
  };
}

export function emptyPaperDesk() {
  return createCompetitionPortfolio({
    portfolioId: 'paper-desk',
    cohortId: 'paper',
    ownerId: 'visitor',
    ownerType: 'HUMAN',
  });
}

export function loadPaperDesk(storage = globalThis.sessionStorage) {
  try {
    const raw = storage?.getItem?.(PAPER_DESK_KEY);
    if (!raw) return emptyPaperDesk();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.positions) return emptyPaperDesk();
    return parsed;
  } catch {
    return emptyPaperDesk();
  }
}

export function savePaperDesk(portfolio, storage = globalThis.sessionStorage) {
  storage?.setItem?.(PAPER_DESK_KEY, JSON.stringify(portfolio));
  return portfolio;
}

export function paperDeskOrder(portfolio, { side, symbol, quantity, price, cost = 1 } = {}) {
  return applyFill(portfolio, {
    side: String(side || '').toUpperCase(),
    symbol: String(symbol || '').trim().toUpperCase(),
    quantity: Number(quantity),
    price: Number(price),
    cost: Number(cost) || 0,
    filledAt: new Date().toISOString(),
  });
}

export function paperDeskView(portfolio, prices = {}) {
  const positions = Object.entries(portfolio.positions || {}).map(([symbol, pos]) => {
    const price = Number(prices[symbol] || pos.costBasis || 0);
    return {
      symbol,
      shares: pos.quantity,
      price,
      marketValue: price * Number(pos.quantity || 0),
    };
  });
  return portfolioView({
    cash: portfolio.cash,
    positions,
    fills: (portfolio.ledger || []).filter((row) => row.type !== 'PORTFOLIO_OPENED'),
    startingCapital: 100000,
    assigned: true,
  });
}

export function portfolioMarkup(v) {
  if (v.assigned === false) {
    return '<section class="wb-placeholder"><p>SIMULATED PORTFOLIO</p><h1>No competition portfolio assigned.</h1><p>Founding cohort launch has not happened. $100,000 is the future simulated starting capital, not a live account value.</p><small>Simulation only. Canonical execution costs and fills apply; no live-money order endpoint exists.</small></section>';
  }
  return '<section><p>SIMULATED PORTFOLIO</p><h1>' + v.equity.toFixed(2) + '</h1><p>' + (v.returnPct >= 0 ? '+' : '') + v.returnPct.toFixed(2) + '% · ' + v.positions.length + ' positions · ' + v.fillCount + ' fills</p><small>Simulation only. Canonical execution costs and fills apply; no live-money order endpoint exists.</small></section>';
}

export function paperDeskMarkup(view, { symbol = 'SPY', price = '', message = '' } = {}) {
  const rows = view.positions.length
    ? view.positions.map((p) => '<article><b>' + esc(p.symbol) + '</b><span>' + Number(p.shares).toFixed(2) + ' shares · ' + Number(p.price).toFixed(2) + '</span></article>').join('')
    : '<article><p>No paper positions yet. Buy a supported symbol to see the simulated ledger move.</p></article>';
  return '<section class="wb-portfolio"><p>PAPER DESK</p><h1>' + view.equity.toFixed(2) + '</h1><p>'
    + (view.returnPct >= 0 ? '+' : '') + view.returnPct.toFixed(2) + '% · ' + view.positions.length + ' positions · ' + view.fillCount
    + ' fills · cash ' + view.cash.toFixed(2) + '</p>'
    + '<form class="wb-form" data-paper-form>'
    + '<label>Symbol<input name="symbol" value="' + escapeAttr(symbol) + '" required></label>'
    + '<label>Side<select name="side"><option value="BUY">Buy</option><option value="SELL">Sell</option></select></label>'
    + '<label>Shares<input name="quantity" type="number" min="1" step="1" value="1" required></label>'
    + '<label>Price<input name="price" type="number" min="0.01" step="0.01" value="' + escapeAttr(price) + '" required></label>'
    + '<button type="submit">Fill paper order</button>'
    + '</form>'
    + (message ? '<p class="wb-notice">' + esc(message) + '</p>' : '')
    + '<div class="wb-desk-rows">' + rows + '</div>'
    + '<small>Paper desk only. This is not the founding competition and cannot place live-money orders.</small></section>';
}

export function runScenario({
  symbol,
  entryPrice,
  shares,
  exitPrices = [],
  commission = 0,
  spreadBps = 0,
  slippageBps = 0,
} = {}) {
  const entry = Number(entryPrice);
  const qty = Number(shares);
  if (!(entry > 0 && qty > 0)) return { ok: false, reason: 'Valid entry price and shares are required.' };
  const bps = Number(spreadBps) + Number(slippageBps);
  const entryCost = entry * qty * bps / 10000 + Number(commission);
  const scenarios = exitPrices.map((exit) => {
    const p = Number(exit);
    const gross = (p - entry) * qty;
    const costs = entryCost + p * qty * bps / 10000 + Number(commission);
    return { exitPrice: p, gross, costs, net: gross - costs, returnPct: (gross - costs) / (entry * qty) * 100 };
  });
  return { ok: true, symbol, entryPrice: entry, shares: qty, scenarios, simulationOnly: true };
}

export function simulationMarkup(r) {
  if (!r.ok) return '<section><h1>Simulation Lab</h1><p>' + esc(r.reason) + '</p></section>';
  return '<section><p>TRY</p><h1>' + esc(r.symbol) + ' scenario lab</h1>'
    + r.scenarios.map((x) => '<article><b>Exit ' + x.exitPrice.toFixed(2) + '</b><span> Net ' + x.net.toFixed(2) + ' · ' + (x.returnPct >= 0 ? '+' : '') + x.returnPct.toFixed(2) + '%</span><small> Estimated costs ' + x.costs.toFixed(2) + '</small></article>').join('')
    + '<small>Counterfactual simulation, not a forecast or promise of return.</small></section>';
}

export function labFormMarkup({
  symbol = 'SPY',
  entryPrice = '',
  shares = '10',
  exitHigh = '',
  exitLow = '',
  commission = '1',
  spreadBps = '2',
  slippageBps = '2',
  result = null,
} = {}) {
  return '<section class="wb-lab"><p>TRY</p><h1>Simulation Lab</h1><p>Change the inputs and run a counterfactual. This does not send a live order.</p>'
    + '<form class="wb-form" data-lab-form>'
    + '<label>Symbol<input name="symbol" value="' + escapeAttr(symbol) + '" required></label>'
    + '<label>Entry price<input name="entryPrice" type="number" min="0.01" step="0.01" value="' + escapeAttr(entryPrice) + '" required></label>'
    + '<label>Shares<input name="shares" type="number" min="1" step="1" value="' + escapeAttr(shares) + '" required></label>'
    + '<label>Higher exit<input name="exitHigh" type="number" min="0.01" step="0.01" value="' + escapeAttr(exitHigh) + '" required></label>'
    + '<label>Lower exit<input name="exitLow" type="number" min="0.01" step="0.01" value="' + escapeAttr(exitLow) + '" required></label>'
    + '<label>Commission<input name="commission" type="number" min="0" step="0.01" value="' + escapeAttr(commission) + '"></label>'
    + '<label>Spread bps<input name="spreadBps" type="number" min="0" step="0.1" value="' + escapeAttr(spreadBps) + '"></label>'
    + '<label>Slippage bps<input name="slippageBps" type="number" min="0" step="0.1" value="' + escapeAttr(slippageBps) + '"></label>'
    + '<button type="submit">Run scenario</button>'
    + '</form>'
    + (result ? simulationMarkup(result) : '<p>Enter a symbol and prices, then run the scenario.</p>')
    + '</section>';
}
