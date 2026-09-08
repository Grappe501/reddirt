import Link from "next/link";
import { requireMarketLabUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultCompetition, DEFAULT_COMPETITION_SLUG } from "@/lib/competition/ensureDefaultCompetition";
import { getCashBalance } from "@/lib/ledger/getCashBalance";
import { signOut } from "@/app/login/actions";
import { joinDefaultCompetition } from "./actions";

function money(value: number | string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
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
  const cashBalance = portfolio ? await getCashBalance(portfolio.id) : null;

  return (
    <main className="dashboard-shell">
      <header className="market-header">
        <div><p className="eyebrow">MARKETLAB</p><h1>Your trading lab</h1></div>
        <div className="headerActions">
          <Link className="secondary buttonLink" href="/markets">Markets</Link>
          <form action={signOut}><button className="secondary">Sign out</button></form>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="eyebrow">{competition.name}</p>
          <h2>{portfolio ? "You are in." : "Your first $1,000 is ready."}</h2>
          <p>{portfolio ? "Your simulated cash is derived directly from the immutable ledger below." : "Join the default challenge to create your player portfolio and opening ledger entry."}</p>
        </div>
        {!portfolio ? <form action={joinDefaultCompetition}><button>Join Six-Week Classic</button></form> : <Link className="primaryButton buttonLink" href="/markets">Search the market</Link>}
      </section>

      <section className="metric-grid">
        <article><span>Portfolio value</span><strong>{portfolio ? money(cashBalance ?? 0) : "—"}</strong><small>No positions yet</small></article>
        <article><span>Cash</span><strong>{portfolio ? money(cashBalance ?? 0) : "—"}</strong><small>Ledger-derived</small></article>
        <article><span>Starting capital</span><strong>{money(competition.startingCash.toString())}</strong><small>Competition rule</small></article>
        <article><span>Competition</span><strong>{competition.status}</strong><small>{DEFAULT_COMPETITION_SLUG}</small></article>
      </section>

      <section className="truth-panel">
        <div><p className="eyebrow">FINANCIAL TRUTH</p><h2>Balances are results. Ledgers are truth.</h2></div>
        <p>{portfolio ? `Portfolio ${portfolio.id} has an auditable simulated cash balance of ${money(cashBalance ?? 0)}.` : "No portfolio exists for this player yet, so no opening cash has been created."}</p>
      </section>
    </main>
  );
}
