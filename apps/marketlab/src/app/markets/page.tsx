import Link from "next/link";
import { getMarketDataProvider } from "@/lib/market/provider";

type SearchParams = Promise<{ q?: string; symbol?: string }>;

export default async function MarketsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", symbol = "" } = await searchParams;
  const provider = getMarketDataProvider();

  let results: Awaited<ReturnType<typeof provider.searchSecurities>> = [];
  let quote: Awaited<ReturnType<typeof provider.getQuote>> | null = null;
  let marketState: Awaited<ReturnType<typeof provider.getMarketStatus>> | null = null;
  let error: string | null = null;

  try {
    marketState = await provider.getMarketStatus();
    if (q.trim()) results = await provider.searchSecurities(q);
    if (symbol.trim()) quote = await provider.getQuote(symbol);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Market data is unavailable";
  }

  return (
    <main className="shell">
      <header className="topbar compactTopbar">
        <div>
          <p className="eyebrow">MARKETLAB · MARKETS</p>
          <h1 className="pageTitle">Search the real market.</h1>
          <p className="lede">Quotes are retrieved server-side through MarketLab's provider layer. No brokerage order is placed.</p>
        </div>
        <div className="marketStatus">
          <span className="statusDot" /> {marketState?.state ?? "UNAVAILABLE"}
        </div>
      </header>

      <form className="searchBar" action="/markets" method="get">
        <input name="q" defaultValue={q} placeholder="Search ticker or company" aria-label="Search ticker or company" />
        <button className="primaryButton" type="submit">Search</button>
      </form>

      {error ? <section className="panel"><strong>Market data not connected.</strong><p className="muted">{error}</p></section> : null}

      {quote ? (
        <section className="heroCard quoteHero">
          <div>
            <p className="eyebrow">{quote.symbol}</p>
            <p className="portfolioValue">${quote.price.toFixed(2)}</p>
            <p className="muted">Bid {quote.bid == null ? "—" : `$${quote.bid.toFixed(2)}`} · Ask {quote.ask == null ? "—" : `$${quote.ask.toFixed(2)}`} · {quote.source}</p>
          </div>
          <Link className="primaryButton buttonLink" href={`/markets?q=${encodeURIComponent(q)}`}>Back to results</Link>
        </section>
      ) : null}

      {results.length ? (
        <section className="marketList" aria-label="Security results">
          {results.map((security) => (
            <Link className="marketRow" href={`/markets?q=${encodeURIComponent(q)}&symbol=${encodeURIComponent(security.symbol)}`} key={security.symbol}>
              <div>
                <strong>{security.symbol}</strong>
                <span>{security.name}</span>
              </div>
              <div className="marketRowMeta">
                <span>{security.exchange || "US"}</span>
                <span>{security.tradable ? "Tradable in simulation" : "Reference only"}</span>
              </div>
            </Link>
          ))}
        </section>
      ) : q && !error ? <p className="muted searchEmpty">No matching securities found.</p> : null}

      <footer className="footer">
        <Link href="/dashboard">Dashboard</Link> · Educational simulation only. MarketLab does not place real-money trades.
      </footer>
    </main>
  );
}
