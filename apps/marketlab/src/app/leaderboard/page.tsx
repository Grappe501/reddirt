import Link from "next/link";
import { requireMarketLabUser } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultCompetition } from "@/lib/competition/ensureDefaultCompetition";
import { getCompetitionLeaderboard } from "@/lib/competition/leaderboard";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function pct(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export default async function LeaderboardPage() {
  const user = await requireMarketLabUser();
  const competition = await ensureDefaultCompetition();
  const player = await prisma.player.findUnique({ where: { authSubject: user.id } });
  const rows = await getCompetitionLeaderboard(competition.id);
  const me = player ? rows.find((row) => row.playerId === player.id) : null;

  return (
    <main className="dashboard-shell">
      <header className="market-header compactTopbar">
        <div>
          <p className="eyebrow">{competition.name}</p>
          <h1 className="pageTitle">Leaderboard</h1>
          <p className="muted">Ranked by current marked-to-market portfolio value.</p>
        </div>
        <div className="headerActions">
          <Link className="secondary buttonLink" href="/dashboard">Dashboard</Link>
          <Link className="secondary buttonLink" href="/markets">Markets</Link>
        </div>
      </header>

      {me ? (
        <section className="hero-panel">
          <div>
            <p className="eyebrow">YOUR RANK</p>
            <h2>#{me.rank}</h2>
            <p>{money(me.totalValue)} · {pct(me.totalReturnPct)} total return</p>
          </div>
        </section>
      ) : null}

      <section className="leaderboardTable" aria-label="Competition leaderboard">
        <div className="leaderboardHead">
          <span>Rank</span><span>Player</span><span>Portfolio</span><span>Return</span>
        </div>
        {rows.map((row) => {
          const isMe = player?.id === row.playerId;
          return (
            <div className={`leaderboardRow${isMe ? " isMe" : ""}`} key={row.portfolioId}>
              <strong>#{row.rank}</strong>
              <div><strong>{row.displayName}</strong>{isMe ? <small>You</small> : null}</div>
              <div><strong>{money(row.totalValue)}</strong><small>{money(row.cash)} cash</small></div>
              <div><strong>{pct(row.totalReturnPct)}</strong><small>{money(row.totalReturn)}</small></div>
            </div>
          );
        })}
        {!rows.length ? <p className="muted">No competitors have joined yet.</p> : null}
      </section>
    </main>
  );
}
