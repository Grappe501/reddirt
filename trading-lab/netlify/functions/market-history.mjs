import {
  ALLOWED_HISTORY_FEEDS,
  ALLOWED_SYMBOLS,
  alpacaRequest,
  cleanFeed,
  jsonResponse,
  normalizeBar,
  providerConfig,
  publicProviderError,
} from './provider.mjs';

export async function handler(event) {
  const config = providerConfig();
  if (!config.configured) {
    return jsonResponse(503, {
      ok: false,
      configured: false,
      provider: config.provider,
      feed: config.feed,
      message: 'Live market data is not configured. Add the Alpaca market-data credentials in Netlify.',
    });
  }

  const symbol = String(event.queryStringParameters?.symbol || 'NVDA').toUpperCase();
  if (!ALLOWED_SYMBOLS.has(symbol)) return jsonResponse(400, { ok: false, message: 'Unsupported symbol.' });

  const feed = cleanFeed(event.queryStringParameters?.feed || config.feed, ALLOWED_HISTORY_FEEDS);
  const requestedLimit = Number(event.queryStringParameters?.limit || 80);
  const limit = Math.min(120, Math.max(20, Number.isFinite(requestedLimit) ? requestedLimit : 80));
  const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startedAt = Date.now();

  try {
    const result = await alpacaRequest(
      `/v2/stocks/${encodeURIComponent(symbol)}/bars?timeframe=1Min&start=${encodeURIComponent(start)}&limit=${limit}&adjustment=raw&feed=${feed}&sort=desc`,
      config,
    );

    const bars = (result.bars || [])
      .map(normalizeBar)
      .filter(Boolean)
      .reverse();

    return jsonResponse(200, {
      ok: true,
      configured: true,
      provider: config.provider,
      feed,
      symbol,
      bars,
      fetchedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
    });
  } catch (error) {
    const safe = publicProviderError(error);
    console.error('market-history provider error', { provider: config.provider, feed, symbol, upstreamStatus: safe.upstreamStatus || null });
    return jsonResponse(502, {
      ok: false,
      configured: true,
      provider: config.provider,
      feed,
      symbol,
      ...safe,
    });
  }
}
