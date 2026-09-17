export const PROVIDER = 'alpaca';
export const CORE_SYMBOLS = ['SPY', 'QQQ', 'NVDA', 'AAPL'];
export const BREADTH_SYMBOLS = [
  'SPY', 'QQQ', 'IWM', 'DIA',
  'XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XLC',
  'NVDA', 'AAPL', 'MSFT', 'AMZN', 'META', 'GOOGL', 'TSLA', 'AMD', 'AVGO', 'JPM',
];
export const ALLOWED_SYMBOLS = new Set(BREADTH_SYMBOLS);
export const ALLOWED_LIVE_FEEDS = new Set(['iex', 'sip', 'delayed_sip']);
export const ALLOWED_HISTORY_FEEDS = new Set(['iex', 'sip']);

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
    },
    body: JSON.stringify(body),
  };
}

export function providerConfig(env = process.env) {
  const key = env.ALPACA_KEY_ID || env.ALPACA_API_KEY || '';
  const secret = env.ALPACA_SECRET_KEY || env.ALPACA_API_SECRET_KEY || env.ALPACA_API_SECRET || '';
  const requestedFeed = String(env.ALPACA_DATA_FEED || 'iex').toLowerCase();
  return {
    provider: PROVIDER,
    configured: Boolean(key && secret),
    key,
    secret,
    feed: ALLOWED_LIVE_FEEDS.has(requestedFeed) ? requestedFeed : 'iex',
    envPresent: {
      ALPACA_KEY_ID: Boolean(env.ALPACA_KEY_ID || env.ALPACA_API_KEY),
      ALPACA_SECRET_KEY: Boolean(env.ALPACA_SECRET_KEY || env.ALPACA_API_SECRET_KEY || env.ALPACA_API_SECRET),
    },
  };
}

export function cleanSymbols(raw, limit = BREADTH_SYMBOLS.length) {
  const requested = String(raw || CORE_SYMBOLS.join(','))
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  return [...new Set(requested.filter((symbol) => ALLOWED_SYMBOLS.has(symbol)))].slice(0, limit);
}

export function cleanFeed(raw, allowed = ALLOWED_LIVE_FEEDS, fallback = 'iex') {
  const value = String(raw || fallback).toLowerCase();
  return allowed.has(value) ? value : fallback;
}

export class ProviderRequestError extends Error {
  constructor(message, status = 502, retryAfter = null) {
    super(message);
    this.name = 'ProviderRequestError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export async function alpacaRequest(path, { key, secret, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`https://data.alpaca.markets${path}`, {
    headers: {
      'APCA-API-KEY-ID': key,
      'APCA-API-SECRET-KEY': secret,
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const retryAfter = response.headers?.get?.('retry-after') || null;
    const safeMessage = response.status === 401 || response.status === 403
      ? 'Market-data credentials or feed entitlement were rejected.'
      : response.status === 429
        ? 'Market-data provider rate limit reached.'
        : `Market-data provider request failed with status ${response.status}.`;
    throw new ProviderRequestError(safeMessage, response.status, retryAfter);
  }

  return response.json();
}

export function normalizeBar(bar) {
  if (!bar) return null;
  return {
    time: bar.t,
    open: Number(bar.o || 0),
    high: Number(bar.h || 0),
    low: Number(bar.l || 0),
    close: Number(bar.c || 0),
    volume: Number(bar.v || 0),
  };
}

export function publicProviderError(error) {
  if (error instanceof ProviderRequestError) {
    return {
      message: error.message,
      upstreamStatus: error.status,
      retryAfter: error.retryAfter,
    };
  }
  return { message: 'Market-data provider request failed.' };
}
