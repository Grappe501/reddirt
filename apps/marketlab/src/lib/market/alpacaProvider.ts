import type { MarketDataProvider, MarketQuote, MarketSecurity, MarketStatus } from "./types";

const DATA_BASE = "https://data.alpaca.markets";
const TRADING_BASE = "https://paper-api.alpaca.markets";

function getCredentials() {
  const key =
    process.env.MARKETLAB_ALPACA_API_KEY_ID?.trim() || process.env.MARKETLAB_MARKET_DATA_API_KEY?.trim();
  const secret =
    process.env.MARKETLAB_ALPACA_API_SECRET_KEY?.trim() || process.env.MARKETLAB_ALPACA_API_SECRET?.trim();
  if (!key || !secret) {
    throw new Error("MarketLab Alpaca credentials are not configured");
  }
  return { key, secret };
}

function headers() {
  const { key, secret } = getCredentials();
  return {
    "APCA-API-KEY-ID": key,
    "APCA-API-SECRET-KEY": secret,
  };
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

export class AlpacaMarketDataProvider implements MarketDataProvider {
  async searchSecurities(query: string): Promise<MarketSecurity[]> {
    const q = query.trim().toUpperCase();
    if (!q) return [];

    const response = await fetch(`${TRADING_BASE}/v2/assets?status=active&asset_class=us_equity`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Alpaca asset search failed (${response.status})`);

    const assets = (await response.json()) as Array<{
      symbol: string;
      name: string;
      exchange?: string;
      tradable?: boolean;
    }>;

    return assets
      .filter((asset) =>
        asset.symbol?.toUpperCase().includes(q) || asset.name?.toUpperCase().includes(q)
      )
      .slice(0, 12)
      .map((asset) => ({
        symbol: asset.symbol,
        name: asset.name,
        exchange: asset.exchange ?? null,
        assetClass: "US_EQUITY" as const,
        tradable: Boolean(asset.tradable),
      }));
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const normalized = normalizeSymbol(symbol);
    const feed = process.env.MARKETLAB_ALPACA_FEED?.trim() || "iex";
    const url = `${DATA_BASE}/v2/stocks/${encodeURIComponent(normalized)}/snapshot?feed=${encodeURIComponent(feed)}`;
    const response = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!response.ok) throw new Error(`Alpaca quote failed (${response.status})`);

    const snapshot = (await response.json()) as {
      latestTrade?: { p?: number; t?: string };
      latestQuote?: { bp?: number; ap?: number; t?: string };
      prevDailyBar?: { c?: number };
    };

    const price = snapshot.latestTrade?.p ?? snapshot.latestQuote?.ap ?? snapshot.latestQuote?.bp;
    if (typeof price !== "number") throw new Error("No current price available for symbol");

    return {
      symbol: normalized,
      price,
      bid: snapshot.latestQuote?.bp ?? null,
      ask: snapshot.latestQuote?.ap ?? null,
      previousClose: snapshot.prevDailyBar?.c ?? null,
      asOf: snapshot.latestTrade?.t ?? snapshot.latestQuote?.t ?? new Date().toISOString(),
      source: `alpaca:${feed}`,
      delayed: feed === "delayed_sip",
    };
  }

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return Promise.all(symbols.map((symbol) => this.getQuote(symbol)));
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const response = await fetch(`${TRADING_BASE}/v2/clock`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Alpaca market clock failed (${response.status})`);
    const clock = (await response.json()) as { is_open?: boolean; timestamp?: string };

    return {
      state: clock.is_open ? "OPEN" : "CLOSED",
      asOf: clock.timestamp ?? new Date().toISOString(),
      source: "alpaca:clock",
    };
  }
}
