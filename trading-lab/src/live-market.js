export function createLiveMarketStore(symbols) {
  return {
    symbols: [...symbols],
    status: 'idle',
    provider: 'alpaca',
    feed: 'iex',
    configured: null,
    error: null,
    fetchedAt: null,
    market: {},
    series: Object.fromEntries(symbols.map((symbol) => [symbol, []])),
  };
}

function mergeBar(series, bar) {
  if (!bar?.time) return series;
  const next = [...series];
  const existing = next.findIndex((item) => item.time === bar.time);
  if (existing >= 0) next[existing] = bar;
  else next.push(bar);
  return next.sort((a, b) => new Date(a.time) - new Date(b.time)).slice(-120);
}

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.message || `Request failed: ${response.status}`), { body });
  return body;
}

export async function seedLiveHistory(store, symbol) {
  try {
    const body = await getJson(`/.netlify/functions/market-history?symbol=${encodeURIComponent(symbol)}&feed=${encodeURIComponent(store.feed)}&limit=80`);
    store.configured = body.configured ?? true;
    store.provider = body.provider || store.provider;
    store.feed = body.feed || store.feed;
    store.series[symbol] = Array.isArray(body.bars) ? body.bars : [];
    return store.series[symbol];
  } catch (error) {
    store.configured = error.body?.configured ?? store.configured;
    store.error = error.message;
    return store.series[symbol] || [];
  }
}

export async function refreshLiveMarket(store) {
  store.status = 'loading';
  store.error = null;
  const params = new URLSearchParams({ symbols: store.symbols.join(','), feed: store.feed });

  try {
    const body = await getJson(`/.netlify/functions/market-snapshot?${params}`);
    store.status = 'live';
    store.configured = body.configured ?? true;
    store.provider = body.provider || store.provider;
    store.feed = body.feed || store.feed;
    store.fetchedAt = body.fetchedAt || new Date().toISOString();
    store.market = body.market || {};

    for (const symbol of store.symbols) {
      const bar = store.market[symbol]?.bar;
      if (bar) store.series[symbol] = mergeBar(store.series[symbol] || [], bar);
    }

    return body;
  } catch (error) {
    store.status = 'error';
    store.configured = error.body?.configured ?? store.configured;
    store.error = error.message;
    throw error;
  }
}

export function livePrice(store, symbol) {
  const market = store.market[symbol];
  const midpoint = Number(market?.midpoint || 0);
  if (midpoint > 0) return midpoint;
  const close = Number(market?.bar?.close || 0);
  if (close > 0) return close;
  return Number(store.series[symbol]?.at(-1)?.close || 0);
}

export function liveBars(store, symbol) {
  return store.series[symbol] || [];
}
