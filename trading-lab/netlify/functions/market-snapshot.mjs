const ALLOWED_SYMBOLS = new Set(['SPY', 'QQQ', 'NVDA', 'AAPL']);
const ALLOWED_FEEDS = new Set(['iex', 'sip', 'delayed_sip']);

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function cleanSymbols(raw) {
  const requested = String(raw || 'SPY,QQQ,NVDA,AAPL')
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  return [...new Set(requested.filter((symbol) => ALLOWED_SYMBOLS.has(symbol)))].slice(0, 8);
}

async function alpaca(path, key, secret) {
  const result = await fetch(`https://data.alpaca.markets${path}`, {
    headers: {
      'APCA-API-KEY-ID': key,
      'APCA-API-SECRET-KEY': secret,
      accept: 'application/json',
    },
  });

  if (!result.ok) {
    const text = await result.text();
    throw new Error(`Alpaca ${result.status}: ${text.slice(0, 240)}`);
  }

  return result.json();
}

export async function handler(event) {
  const key = process.env.ALPACA_KEY_ID;
  const secret = process.env.ALPACA_SECRET_KEY;

  if (!key || !secret) {
    return response(503, {
      ok: false,
      configured: false,
      provider: 'alpaca',
      message: 'Live market data is not configured. Add ALPACA_KEY_ID and ALPACA_SECRET_KEY in Netlify.',
    });
  }

  const symbols = cleanSymbols(event.queryStringParameters?.symbols);
  if (!symbols.length) return response(400, { ok: false, message: 'No supported symbols requested.' });

  const requestedFeed = String(event.queryStringParameters?.feed || process.env.ALPACA_DATA_FEED || 'iex').toLowerCase();
  const feed = ALLOWED_FEEDS.has(requestedFeed) ? requestedFeed : 'iex';
  const symbolList = encodeURIComponent(symbols.join(','));

  try {
    const [quotesResult, barsResult] = await Promise.all([
      alpaca(`/v2/stocks/quotes/latest?symbols=${symbolList}&feed=${feed}`, key, secret),
      alpaca(`/v2/stocks/bars/latest?symbols=${symbolList}&feed=${feed}`, key, secret),
    ]);

    const quotes = quotesResult.quotes || {};
    const bars = barsResult.bars || {};
    const market = {};

    for (const symbol of symbols) {
      const quote = quotes[symbol] || null;
      const bar = bars[symbol] || null;
      const bid = Number(quote?.bp || 0);
      const ask = Number(quote?.ap || 0);
      const midpoint = bid > 0 && ask > 0 ? (bid + ask) / 2 : Number(bar?.c || 0);

      market[symbol] = {
        symbol,
        bid,
        ask,
        midpoint,
        quoteTime: quote?.t || null,
        bar: bar
          ? {
              time: bar.t,
              open: Number(bar.o || 0),
              high: Number(bar.h || 0),
              low: Number(bar.l || 0),
              close: Number(bar.c || 0),
              volume: Number(bar.v || 0),
            }
          : null,
      };
    }

    return response(200, {
      ok: true,
      configured: true,
      provider: 'alpaca',
      feed,
      fetchedAt: new Date().toISOString(),
      symbols,
      market,
    });
  } catch (error) {
    return response(502, {
      ok: false,
      configured: true,
      provider: 'alpaca',
      feed,
      message: error instanceof Error ? error.message : 'Market-data request failed.',
    });
  }
}
