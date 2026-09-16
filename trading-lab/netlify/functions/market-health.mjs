import { alpacaRequest, jsonResponse, providerConfig, publicProviderError } from './provider.mjs';

export async function handler(event) {
  const config = providerConfig();
  const probe = String(event.queryStringParameters?.probe || '0') === '1';
  const base = {
    ok: true,
    service: 'reddirt-market-data',
    provider: config.provider,
    feed: config.feed,
    configured: config.configured,
    ordersEnabled: false,
    checkedAt: new Date().toISOString(),
  };

  if (!config.configured || !probe) {
    return jsonResponse(config.configured ? 200 : 503, {
      ...base,
      ok: config.configured,
      providerReachable: null,
      message: config.configured
        ? 'Market-data credentials are configured. Add ?probe=1 to verify the upstream provider.'
        : 'Market-data credentials are not configured.',
    });
  }

  const startedAt = Date.now();
  try {
    const result = await alpacaRequest(`/v2/stocks/quotes/latest?symbols=SPY&feed=${encodeURIComponent(config.feed)}`, config);
    const quote = result.quotes?.SPY || null;
    return jsonResponse(200, {
      ...base,
      providerReachable: true,
      latencyMs: Date.now() - startedAt,
      probeSymbol: 'SPY',
      quoteAvailable: Boolean(quote),
      quoteTime: quote?.t || null,
    });
  } catch (error) {
    const safe = publicProviderError(error);
    console.error('market-health provider error', { provider: config.provider, feed: config.feed, upstreamStatus: safe.upstreamStatus || null });
    return jsonResponse(502, {
      ...base,
      ok: false,
      providerReachable: false,
      latencyMs: Date.now() - startedAt,
      ...safe,
    });
  }
}
