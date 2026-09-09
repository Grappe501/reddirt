import Link from "next/link";
import { loadVotes, summarizeVotes } from "../src/lib/vote-ledger";

export default function HomePage() {
  const votes = loadVotes();
  const summary = summarizeVotes(votes);
  const summaryCards = [
    { label: "Recorded votes reviewed", value: summary.total },
    { label: "GOP breaks", value: summary.partyBreaks },
    { label: "Highly partisan GOP alignments", value: summary.highlyPartisanGopAlignments },
    { label: "Trump breaks", value: summary.trumpBreaks },
  ];

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Public-record research project</p>
        <h1>French Hill Vote Tracker</h1>
        <p className="lede">A source-first database of Rep. French Hill&apos;s U.S. House voting record: where he broke with the Republican majority or a documented Trump position, and where he aligned with them on the most partisan votes.</p>
        <div className="hero-actions"><Link className="button-link" href="/votes">Explore the vote ledger</Link></div>
      </section>

      <section className="stats" aria-label="Research status">
        {summaryCards.map((card) => <article className="stat" key={card.label}><strong>{card.value.toLocaleString()}</strong><span>{card.label}</span></article>)}
      </section>

      <section className="panel">
        <div><p className="eyebrow">Methodology</p><h2>Separate evidence from interpretation.</h2></div>
        <p>Party alignment is calculated from the recorded House Republican split. A vote is classified as highly partisan only when at least 90% of voting Republicans are on one side and at least 90% of voting Democrats are on the other. Trump alignment is tracked independently and requires documented evidence of Trump&apos;s position.</p>
      </section>

      <section className="panel muted">
        <div><p className="eyebrow">Traceable records</p><h2>Every classification points back to the roll call.</h2></div>
        <p>The ledger preserves Congress, roll-call number, date, measure, Hill&apos;s vote, Republican and Democratic vote splits, partisan score, Trump evidence status, and primary-source links. The goal is an auditable record rather than a subjective scorecard.</p>
      </section>
    </main>
  );
}
