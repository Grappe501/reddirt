import { randomUUID } from "node:crypto";
import Link from "next/link";
import { requireMarketLabUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultCompetition } from "@/lib/competition/ensureDefaultCompetition";
import { getCashBalance } from "@/lib/ledger/getCashBalance";
import { getMarketDataProvider } from "@/lib/market/provider";
import { placeMarketOrder } from "./actions";

function money(value: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default async function TradePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const user = await requireMarketLabUser();
  const competition = await ensureDefaultCompetition();
  const player = await prisma.player.findUnique({
    where: { authSubject: user.id },
    include: {
      portfolios: {
        where: { competitionId: competition.id },
        take: 1,
        include: {
          positions: { orderBy: { symbol: "asc" } },
          executions: { orderBy: { executedAt: "desc" }, take: 12 },
        },
      },
    },
  });
  const portfolio = player?.portfolios[0] ?? null;
  if (!portfolio) {
    return <main className="dashboard-shell"><section className="hero-panel"><div><p className="eyebrow">TRADE</p><h1>Join a competition first.</h1><p>Your portfolio must exist before simulated orders can be placed.</p></div><Link className="primaryButton" href="/dashboard">Go to dashboard</Link></section></main>;
  }

  const cash = await getCashBalance(portfolio.id);
  const symbol = typeof params.symbol === "string" ? params.symbol.toUpperCase() : "AAPL";
  const error = typeof params.error === "string" ? params.error : null;
  const filled = params.filled === "1";
  const idempotencyKey = randomUUID();
  let quote: Awaited<ReturnType<ReturnType<typeof getMarketDataProvider>["getQuote"]>> | null = null;
  let quoteError: string | null = null;
  try {
    quote = await getMarketDataProvider().getQuote(symbol);
  } catch (e) {
    quoteError = e instanceof Error ? e.message : "Quote unavailable";
  }

  return (
    <main className="dashboard-shell">
      <header className="market-header">
        <div><p className="eyebrow">MARKETLAB · TRADE</p><h1>Simulated order ticket</h1></div>
        <nav className="inline-actions"><Link className="secondary" href="/markets">Markets</Link><Link className="secondary" href="/dashboard">Dashboard</Link></nav>
      </header>

      {filled ? <p className="success-banner">Order filled and written to the simulated execution ledger.</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      <section className="trade-layout">
        <article className="hero-panel trade-ticket">
          <div>
            <p className="eyebrow">{symbol}</p>
            <h2>{quote ? money(quote.price) : "Quote unavailable"}</h2>
            <p>{quote ? `${quote.delayed ? "Delayed" : "Live"} · ${quote.source} · ${new Date(quote.asOf).toLocaleString()}` : quoteError}</p>
          </div>
          <form action={placeMarketOrder} className="order-form">
            <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
            <label>Symbol<input name="symbol" defaultValue={symbol} required /></label>
            <label>Shares<input name="quantity" type="number" min="0.00000001" step="0.00000001" defaultValue="1" required /></label>
            <label>Side<select name="side" defaultValue="BUY"><option value="BUY">Buy</option><option value="SELL">Sell</option></select></label>
            <button className="primaryButton" type="submit" disabled={!quote}>Place simulated market order</button>
            <small>No real brokerage order is created. Price is fetched again server-side at execution time. Repeated submission of this same ticket reuses one order idempotency token.</small>
          </form>
        </article>

        <aside className="panel trade-summary">
          <p className="eyebrow">BUYING POWER</p>
          <strong className="summary-number">{money(cash.toString())}</strong>
          <p>Flat simulated fee: {money(competition.flatTradeFee.toString())}</p>
          <p>Slippage model: {competition.slippageBps.toString()} bps</p>
        </aside>
      </section>

      <section className="grid">
        <article className="panel">
          <p className="eyebrow">POSITIONS</p>
          <h2>Current holdings</h2>
          <div className="data-list">
            {portfolio.positions.length ? portfolio.positions.map((position) => (
              <div className="data-row" key={position.id}><strong>{position.symbol}</strong><span>{position.quantity.toString()} shares</span><span>Avg {money(position.averageCost.toString())}</span><span>Realized {money(position.realizedPnl.toString())}</span></div>
            )) : <p className="muted">No positions yet.</p>}
          </div>
        </article>
        <article className="panel">
          <p className="eyebrow">EXECUTION LEDGER</p>
          <h2>Recent fills</h2>
          <div className="data-list">
            {portfolio.executions.length ? portfolio.executions.map((execution) => (
              <div className="data-row" key={execution.id}><strong>{execution.side} {execution.symbol}</strong><span>{execution.quantity.toString()} @ {money(execution.executionPrice.toString())}</span><span>Fee {money(execution.feeAmount.toString())}</span><span>{new Date(execution.executedAt).toLocaleString()}</span></div>
            )) : <p className="muted">No executions yet.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}
