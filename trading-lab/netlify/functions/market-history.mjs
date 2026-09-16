const ALLOWED_SYMBOLS = new Set(['SPY', 'QQQ', 'NVDA', 'AAPL']);
const ALLOWED_FEEDS = new Set(['iex', 'sip']);

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

  const symbol = String(event.queryStringParameters?.symbol || 'NVDA').toUpperCase();
  if (!ALLOWED_SYMBOLS.has(symbol)) return response(400, { ok: false, message: 'Unsupported symbol.' });

  const requestedFeed = String(event.queryStringParameters?.feed || process.env.ALPACA_DATA_FEED || 'iex').toLowerCase();
  const feed = ALLOWED_FEEDS.has(requestedFeed) ? requestedFeed : 'iex';
  const limit = Math.min(120, Math.max(20, Number(event.queryStringParameters?.limit || 80)));
  const start = new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString();

  try {
    const result = await alpaca(
      `/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=1Min&start=${encodeURIComponent(start)}&limit=${limit}&adjustment=raw&feed=${feed}&sort=desc`,
      key,
      secret,
    );

    const bars = (result.bars || [])
      .map((bar) => ({
        time: bar.t,
        open: Number(bar.o || 0),
        high: Number(bar.h || 0),
        low: Number(bar.l || 0),
        close: Number(bar.c || 0),
        volume: Number(bar.v || 0),
      }))
      .reverse();

    return response(200, {
      ok: true,
      configured: true,
      provider: 'alpaca',
      feed,
      symbol,
      bars,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return response(502, {
      ok: false,
      configured: true,
      provider: 'alpaca',
      feed,
      symbol,
      message: error instanceof Error ? error.message : 'Historical seed request failed.',
    });
  }
}
