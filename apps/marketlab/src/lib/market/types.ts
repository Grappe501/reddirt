export type MarketSecurity = {
  symbol: string;
  name: string;
  exchange?: string | null;
  assetClass: "US_EQUITY";
  tradable: boolean;
};

export type MarketQuote = {
  symbol: string;
  price: number;
  bid?: number | null;
  ask?: number | null;
  previousClose?: number | null;
  asOf: string;
  source: string;
  delayed: boolean;
};

export type MarketStatus = {
  state: "PRE" | "OPEN" | "AFTER" | "CLOSED" | "UNKNOWN";
  asOf: string;
  source: string;
};

export interface MarketDataProvider {
  searchSecurities(query: string): Promise<MarketSecurity[]>;
  getQuote(symbol: string): Promise<MarketQuote>;
  getQuotes(symbols: string[]): Promise<MarketQuote[]>;
  getMarketStatus(): Promise<MarketStatus>;
}
