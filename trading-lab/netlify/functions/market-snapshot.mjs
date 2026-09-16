import {
  ALLOWED_LIVE_FEEDS,
  alpacaRequest,
  cleanFeed,
  cleanSymbols,
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

  const symbols = cleanSymbols(event.queryStringParameters?.symbols);
  if (!symbols.length) return jsonResponse(400, { ok: false, message: 'No supported symbols requested.' });

  const feed = cleanFeed(event.queryStringParameters?.feed || config.feed, ALLOWED_LIVE_FEEDS);
  const symbolList = encodeURIComponent(symbols.join(','));
  const startedAt = Date.now();

  try {
    const [quotesResult, barsResult] = await Promise.all([
      alpacaRequest(`/v2/stocks/quotes/latest?symbols=${symbolList}&feed=${feed}`, config),
      alpacaRequest(`/v2/stocks/bars/latest?symbols=${symbolList}&feed=${feed}`, config),
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
        bar: normalizeBar(bar),
      };
    }

    return jsonResponse(200, {
      ok: true,
      configured: true,
      provider: config.provider,
      feed,
      fetchedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      symbols,
      market,
    });
  } catch (error) {
    const safe = publicProviderError(error);
    console.error('market-snapshot provider error', { provider: config.provider, feed, upstreamStatus: safe.upstreamStatus || null });
    return jsonResponse(502, {
      ok: false,
      configured: true,
      provider: config.provider,
      feed,
      ...safe,
    });
  }
}
