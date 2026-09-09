import Link from "next/link";
import { loadVotes, summarizeVotes } from "../../src/lib/vote-ledger";

export default function DashboardPage() {
  const votes = loadVotes();
  const summary = summarizeVotes(votes);
  const byYear = [...new Set(votes.map((vote) => vote.date.slice(0, 4)))].sort().reverse().map((year) => {
    const rows = votes.filter((vote) => vote.date.startsWith(year));
    return {
      year,
      total: rows.length,
      breaks: rows.filter((vote) => vote.partyBreak).length,
      partisanAlign: rows.filter((vote) => vote.highlyPartisanGopAlignment).length,
      trumpBreaks: rows.filter((vote) => vote.trumpBreak).length,
      trumpAlign: rows.filter((vote) => vote.trumpAligned === true).length,
    };
  });

  return (
    <main>
      <p className="eyebrow">Analytical dashboard</p>
      <h1>Voting Record Dashboard</h1>
      <p className="lede">A summary view of French Hill&apos;s House voting record using the same source-backed classifications that power the public ledger.</p>

      <section className="stats" aria-label="Vote summary">
        <article className="stat"><strong>{summary.total.toLocaleString()}</strong><span>Votes reviewed</span></article>
        <article className="stat"><strong>{summary.partyBreaks.toLocaleString()}</strong><span>GOP breaks</span></article>
        <article className="stat"><strong>{summary.highlyPartisanGopAlignments.toLocaleString()}</strong><span>Highly partisan GOP alignments</span></article>
        <article className="stat"><strong>{summary.trumpBreaks.toLocaleString()}</strong><span>Trump breaks</span></article>
      </section>

      <section className="panel"><div><p className="eyebrow">Quick views</p><h2>Explore the record</h2></div><div className="quick-links"><Link href="/votes?filter=gop-break">GOP breaks</Link><Link href="/votes?filter=high-partisan-gop">Highly partisan GOP alignments</Link><Link href="/votes?filter=trump-break">Trump breaks</Link><Link href="/votes?filter=trump-align">Trump alignments</Link></div></section>

      <section className="year-table-wrap">
        <p className="eyebrow">Year-by-year</p>
        <div className="year-table" role="table" aria-label="Vote summary by year">
          <div className="year-row year-head" role="row"><span>Year</span><span>Total</span><span>GOP breaks</span><span>Partisan GOP aligns</span><span>Trump breaks</span><span>Trump aligns</span></div>
          {byYear.map((row) => <div className="year-row" role="row" key={row.year}><Link href={`/votes?year=${row.year}`}>{row.year}</Link><span>{row.total}</span><span>{row.breaks}</span><span>{row.partisanAlign}</span><span>{row.trumpBreaks}</span><span>{row.trumpAlign}</span></div>)}
          {!byYear.length && <div className="empty-state">No generated House data yet. Run the ingestion pipeline to populate the dashboard.</div>}
        </div>
      </section>
    </main>
  );
}
