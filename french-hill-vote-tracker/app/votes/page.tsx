import { loadVotes } from "../../src/lib/vote-ledger";

export const dynamic = "force-static";

export default function VotesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <VoteLedger searchParams={searchParams} />;
}

async function VoteLedger({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const votes = loadVotes();
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const year = typeof params.year === "string" ? params.year : "all";
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";

  const filtered = votes.filter((vote) => {
    if (year !== "all" && !vote.date.startsWith(year)) return false;
    if (filter === "gop-break" && !vote.partyBreak) return false;
    if (filter === "high-partisan-gop" && !vote.highlyPartisanGopAlignment) return false;
    if (filter === "trump-break" && !vote.trumpBreak) return false;
    if (filter === "trump-align" && vote.trumpAligned !== true) return false;
    if (query && !`${vote.measure} ${vote.question ?? ""}`.toLowerCase().includes(query)) return false;
    return true;
  });

  const years = [...new Set(votes.map((vote) => vote.date.slice(0, 4)))].sort().reverse();

  return (
    <main>
      <p className="eyebrow">Public vote ledger</p>
      <h1>Recorded Votes</h1>
      <p className="lede">Search and filter the official roll-call record. Classifications are calculated from recorded party splits; Trump classifications require separate documented evidence.</p>

      <form className="filters">
        <input name="q" defaultValue={query} placeholder="Search measure or question" aria-label="Search votes" />
        <select name="filter" defaultValue={filter} aria-label="Classification">
          <option value="all">All votes</option>
          <option value="gop-break">GOP breaks</option>
          <option value="high-partisan-gop">Highly partisan GOP alignments</option>
          <option value="trump-break">Trump breaks</option>
          <option value="trump-align">Trump alignments</option>
        </select>
        <select name="year" defaultValue={year} aria-label="Year">
          <option value="all">All years</option>
          {years.map((item) => <option key={item}>{item}</option>)}
        </select>
        <button type="submit">Apply</button>
      </form>

      <p className="result-count">{filtered.length.toLocaleString()} vote{filtered.length === 1 ? "" : "s"}</p>
      <section className="ledger" aria-label="Vote results">
        {filtered.map((vote) => (
          <article className="vote-row" key={`${vote.congress}-${vote.rollCall}`}>
            <div>
              <p className="vote-meta">{vote.date} · Congress {vote.congress} · Roll {vote.rollCall}</p>
              <h2>{vote.measure || "House roll-call vote"}</h2>
              {vote.question && <p>{vote.question}</p>}
            </div>
            <div className="vote-facts">
              <strong>Hill: {vote.hillVote}</strong>
              <span>GOP {vote.republicanYea}–{vote.republicanNay}</span>
              <span>Dem {vote.democratYea}–{vote.democratNay}</span>
              {vote.partyBreak && <span className="tag">GOP break</span>}
              {vote.highlyPartisanGopAlignment && <span className="tag">Highly partisan GOP alignment</span>}
              {vote.trumpBreak && <span className="tag">Trump break</span>}
              {vote.trumpAligned === true && <span className="tag">Trump alignment</span>}
              {vote.sources?.[0] && <a href={vote.sources[0].url}>Official roll call</a>}
            </div>
          </article>
        ))}
        {!filtered.length && <div className="empty-state">No records match this view yet. Run the House ingestion pipeline to populate official votes.</div>}
      </section>
    </main>
  );
}
