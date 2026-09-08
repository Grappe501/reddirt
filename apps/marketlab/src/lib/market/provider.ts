import type { MarketDataProvider } from "./types";
import { AlpacaMarketDataProvider } from "./alpacaProvider";

let provider: MarketDataProvider | null = null;

export function getMarketDataProvider(): MarketDataProvider {
  if (provider) return provider;

  const selected = (process.env.MARKETLAB_MARKET_DATA_PROVIDER || "alpaca").trim().toLowerCase();
  switch (selected) {
    case "alpaca":
      provider = new AlpacaMarketDataProvider();
      return provider;
    default:
      throw new Error(`Unsupported MarketLab market data provider: ${selected}`);
  }
}
