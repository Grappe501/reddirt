function number(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function firstRealLesson(lessons) {
  const rows = Array.isArray(lessons) ? lessons : [];
  const lesson = rows.find((row) => row && row.strategy_id !== 'PROOF_SYNTHETIC' && row.lesson);
  return lesson?.lesson || '';
}

export function snapshotQuotes(snapshot = {}) {
  const market = snapshot.market && typeof snapshot.market === 'object' ? snapshot.market : {};
  const names = Object.keys(market).length
    ? Object.keys(market)
    : (Array.isArray(snapshot.symbols) ? snapshot.symbols.filter((row) => typeof row === 'string') : []);
  return names.map((symbol) => {
    const row = market[symbol] || {};
    const price = number(row.bar?.close, row.midpoint, row.bid, row.ask);
    return {
      symbol,
      price,
      bid: number(row.bid),
      ask: number(row.ask),
      time: row.bar?.time || row.quoteTime || snapshot.fetchedAt || '',
    };
  }).filter((row) => row.price > 0);
}

export function dashboardViewModel(overview) {
  const s = overview?.sources || {};
  const learning = s.learning?.data || {};
  const memory = s.marketMemory?.data || {};
  const counts = memory.counts || {};
  const database = s.database?.data || {};
  const snapshot = s.marketSnapshot?.data || {};
  const p = learning.portfolio || memory.portfolio || {};
  const degraded = overview?.degraded || [];
  const observations = number(memory.observations, memory.count, counts.observations);
  const trades = number(memory.trades, counts.trades);
  const liveEquity = p.equity ?? p.value;
  const portfolioLive = Number.isFinite(Number(liveEquity));
  const quotes = snapshotQuotes(snapshot);
  const lesson = learning.nextLesson || learning.recommendation || firstRealLesson(learning.lessons) || 'Continue building your evidence and risk vocabulary.';
  const cohortCount = number(database.counts?.competition_cohorts);
  return {
    portfolioValue: portfolioLive ? Number(liveEquity) : 100000,
    returnPct: number(p.returnPct),
    portfolioLive,
    quotes,
    attention: degraded.length
      ? [`Some Wealth Builder data services are degraded: ${degraded.join(', ')}.`]
      : [],
    research: [observations
      ? {
        title: `${observations.toLocaleString('en-US')} market observations retained`,
        summary: trades
          ? `${trades.toLocaleString('en-US')} fictional trades are stored. This is research memory, not a live brokerage account.`
          : 'Market Memory is accumulating evidence for comparison and research.',
      }
      : {
        title: 'Research organization ready',
        summary: 'Evidence-backed findings, disagreements and view changes will surface here.',
      }],
    learning: lesson,
    competition: cohortCount
      ? `Database has ${cohortCount} competition cohort record${cohortCount === 1 ? '' : 's'}. Founding humans are not launched. 10 humans + one sealed Wealth Builder AI · 90 days · simulated capital.`
      : '10 humans + one sealed Wealth Builder AI · 90 days · simulated capital.',
    tape: degraded.length
      ? 'DATA HEALTH · Some services are degraded. Wealth Builder will not invent missing evidence.'
      : (quotes.length
        ? `MARKETS LIVE · ${quotes.map((q) => `${q.symbol} ${q.price.toFixed(2)}`).join(' · ')} · simulation only`
        : 'SYSTEM READY · Production data services are responding.'),
  };
}
