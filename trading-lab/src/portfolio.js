export const STARTING_CASH = 500;

export function createPortfolio(name, startingCash = STARTING_CASH) {
  return {
    name,
    startingCash,
    cash: startingCash,
    position: null,
    realized: 0,
    fees: 0,
    trades: [],
    decisions: [],
  };
}

export function marketValue(portfolio, priceFor) {
  if (!portfolio.position) return 0;
  return portfolio.position.shares * priceFor(portfolio.position.symbol);
}

export function equity(portfolio, priceFor) {
  return portfolio.cash + marketValue(portfolio, priceFor);
}

export function resetPortfolio(portfolio) {
  portfolio.cash = portfolio.startingCash;
  portfolio.position = null;
  portfolio.realized = 0;
  portfolio.fees = 0;
  portfolio.trades = [];
  portfolio.decisions = [];
}

export function recordDecision(portfolio, decision) {
  portfolio.decisions.unshift({ ...decision, recordedAt: new Date().toISOString() });
  portfolio.decisions = portfolio.decisions.slice(0, 500);
}

export function buyPortfolio({ portfolio, symbol, price, costs, time, reason, stopPrice = null, targetPrice = null, maxCapitalFraction = 1 }) {
  if (portfolio.position || !(price > 0)) return { ok: false, reason: 'Position already open or price unavailable.' };
  const capital = portfolio.cash * Math.min(1, Math.max(0, maxCapitalFraction));
  let shares = Math.floor(capital / price);
  while (shares > 0) {
    const friction = costs('BUY', price, shares);
    const total = shares * price + friction.total;
    if (total <= portfolio.cash) {
      portfolio.cash -= total;
      portfolio.position = { symbol, shares, entry: price, entryCosts: friction.total, stopPrice, targetPrice, openedAt: time };
      portfolio.fees += friction.total;
      portfolio.trades.unshift({ side: 'BUY', symbol, shares, price, costs: friction.total, time, reason, net: null });
      return { ok: true, shares, costs: friction, total };
    }
    shares -= 1;
  }
  return { ok: false, reason: 'Not enough fictional cash after modeled costs.' };
}

export function sellPortfolio({ portfolio, symbol, price, costs, time, reason }) {
  const pos = portfolio.position;
  if (!pos || pos.symbol !== symbol || !(price > 0)) return { ok: false, reason: 'No matching open position.' };
  const friction = costs('SELL', price, pos.shares);
  const proceeds = pos.shares * price;
  const gross = (price - pos.entry) * pos.shares;
  const net = gross - pos.entryCosts - friction.total;
  portfolio.cash += proceeds - friction.total;
  portfolio.realized += net;
  portfolio.fees += friction.total;
  portfolio.trades.unshift({ side: 'SELL', symbol, shares: pos.shares, price, costs: friction.total, time, reason, net });
  portfolio.position = null;
  return { ok: true, shares: pos.shares, costs: friction, gross, net };
}

export function performance(portfolio, priceFor) {
  const currentEquity = equity(portfolio, priceFor);
  const exits = portfolio.trades.filter((trade) => trade.side === 'SELL' && Number.isFinite(trade.net));
  const wins = exits.filter((trade) => trade.net > 0).length;
  const losses = exits.filter((trade) => trade.net < 0).length;
  const grossWins = exits.filter((trade) => trade.net > 0).reduce((sum, trade) => sum + trade.net, 0);
  const grossLosses = Math.abs(exits.filter((trade) => trade.net < 0).reduce((sum, trade) => sum + trade.net, 0));
  return {
    equity: currentEquity,
    returnPct: ((currentEquity - portfolio.startingCash) / portfolio.startingCash) * 100,
    realized: portfolio.realized,
    fees: portfolio.fees,
    closedTrades: exits.length,
    wins,
    losses,
    winRate: exits.length ? wins / exits.length : 0,
    profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0,
  };
}
