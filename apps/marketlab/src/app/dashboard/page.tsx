import Link from "next/link";
import { requireMarketLabUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultCompetition, DEFAULT_COMPETITION_SLUG } from "@/lib/competition/ensureDefaultCompetition";
import { getPortfolioValuation } from "@/lib/portfolio/valuation";
import { getCompetitionLeaderboard } from "@/lib/competition/leaderboard";
import { signOut } from "@/app/login/actions";
import { joinDefaultCompetition } from "./actions";

function money(value: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

function pct(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export default async function DashboardPage() {
  const user = await requireMarketLabUser();
  const competition = await ensureDefaultCompetition();
  const player = await prisma.player.findUnique({
    where: { authSubject: user.id },
    include: {
      portfolios: {
        where: { competitionId: competition.id },
        take: 1,
      },
    },
  });

  const portfolio = player?.portfolios[0] ?? null;
  const valuation = portfolio ? await getPortfolioValuation(portfolio.id) : null;
  const leaderboard = portfolio ? await getCompetitionLeaderboard(competition.id) : [];
  const myRank = player ? leaderboard.find((row) => row.playerId === player.id)?.rank ?? null : null;

  return (
    <main className="dashboard-shell">
      <header className="market-header">
        <div><p className="eyebrow">MARKETLAB</p><h1>Your trading lab</h1></div>
        <div className="headerActions">
          <Link className="secondary buttonLink" href="/markets">Markets</Link>
          <Link className="secondary buttonLink" href="/leaderboard">Leaderboard</Link>
          <form action={signOut}><button className="secondary">Sign out</button></form>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="eyebrow">{competition.name}</p>
          <h2>{valuation ? money(valuation.totalValue) : "Your first $1,000 is ready."}</h2>
          <p>{valuation ? `${pct(valuation.totalReturnPct)} total return · ${money(valuation.unrealizedPnL)} unrealized P/L` : "Join the default challenge to create your player portfolio and opening ledger entry."}</p>
        </div>
        {!portfolio ? <form action={joinDefaultCompetition}><button>Join Six-Week Classic</button></form> : <Link className="primaryButton buttonLink" href="/markets">Search the market</Link>}
      </section>

      <section className="metric-grid">
        <article><span>Portfolio value</span><strong>{valuation ? money(valuation.totalValue) : "—"}</strong><small>Cash + marked positions</small></article>
        <article><span>Cash</span><strong>{valuation ? money(valuation.cash) : "—"}</strong><small>Ledger-derived</small></article>
        <article><span>Unrealized P/L</span><strong>{valuation ? money(valuation.unrealizedPnL) : "—"}</strong><small>Live mark-to-market</small></article>
        <article><span>League rank</span><strong>{myRank ? `#${myRank}` : "—"}</strong><small>{leaderboard.length ? `${leaderboard.length} competitors` : DEFAULT_COMPETITION_SLUG}</small></article>
      </section>

      {valuation?.positions.length ? (
        <section className="truth-panel">
          <div><p className="eyebrow">OPEN POSITIONS</p><h2>Marked to current market data</h2></div>
          <div className="positionGrid">
            {valuation.positions.map((position) => (
              <article className="positionCard" key={position.symbol}>
                <strong>{position.symbol}</strong>
                <span>{position.quantity.toFixed(4)} shares</span>
                <span>{money(position.marketValue)} market value</span>
                <span>{money(position.unrealizedPnL)} unrealized P/L</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="truth-panel">
        <div><p className="eyebrow">FINANCIAL TRUTH</p><h2>Balances are results. Ledgers are truth.</h2></div>
        <p>{valuation ? `Portfolio ${valuation.portfolioId} is currently marked at ${money(valuation.totalValue)} from ${money(valuation.cash)} cash plus ${money(valuation.positionsValue)} in positions.` : "No portfolio exists for this player yet, so no opening cash has been created."}</p>
      </section>
    </main>
  );
}
