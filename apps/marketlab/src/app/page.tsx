const metrics = [
  ["Portfolio Value", "$1,000.00"],
  ["Today", "$0.00"],
  ["Total Return", "0.00%"],
  ["League Rank", "—"],
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MARKETLAB</p>
          <h1>Learn the market by playing it.</h1>
          <p className="lede">
            A competitive stock-market simulation built to measure decisions, risk, discipline,
            and learning—not just who got lucky.
          </p>
        </div>
        <div className="marketStatus" aria-label="Simulation status">
          <span className="statusDot" /> SIMULATION MODE
        </div>
      </header>

      <section className="heroCard">
        <div>
          <p className="label">Your Portfolio</p>
          <p className="portfolioValue">$1,000.00</p>
          <p className="muted">Starting balance · no positions yet</p>
        </div>
        <button type="button" className="primaryButton">Start Your First Challenge</button>
      </section>

      <section className="metrics" aria-label="Portfolio metrics">
        {metrics.map(([label, value]) => (
          <article className="metricCard" key={label}>
            <p className="label">{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="grid">
        <article className="panel">
          <p className="eyebrow">BUILD 1</p>
          <h2>Playable foundation</h2>
          <p>
            The first vertical slice will let a player join a competition, receive simulated cash,
            search a real security, place a simulated trade, and watch the portfolio and leaderboard update.
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">THE DIFFERENCE</p>
          <h2>Outcome is not the same as skill.</h2>
          <p>
            MarketLab will eventually compare your decisions with benchmarks, strategy ghosts,
            a point-in-time Shadow AI, and a hindsight opportunity ceiling.
          </p>
        </article>
      </section>

      <footer className="footer">
        Educational simulation only. MarketLab does not place real-money trades.
      </footer>
    </main>
  );
}
