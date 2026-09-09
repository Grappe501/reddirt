const summaryCards = [
  { label: "Recorded votes reviewed", value: "0" },
  { label: "Party breaks", value: "0" },
  { label: "Trump breaks", value: "0" },
  { label: "Double breaks", value: "0" }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Public-record research project</p>
        <h1>French Hill Vote Tracker</h1>
        <p className="lede">
          A source-first database of Rep. French Hill&apos;s U.S. House voting record,
          including votes where he diverged from the majority of House Republicans
          and/or a clearly documented position taken by Donald Trump.
        </p>
      </section>

      <section className="stats" aria-label="Research status">
        {summaryCards.map((card) => (
          <article className="stat" key={card.label}>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </article>
        ))}
      </section>

      <section className="panel">
        <div>
          <p className="eyebrow">Methodology</p>
          <h2>Separate the evidence from the interpretation.</h2>
        </div>
        <p>
          Party alignment and Trump alignment are tracked independently. A vote is
          classified as a party break only when Hill voted opposite the majority of
          voting House Republicans on that roll call. A Trump break requires a
          documented Trump position tied to the vote or issue; it is never inferred
          from party behavior alone.
        </p>
      </section>

      <section className="panel muted">
        <p className="eyebrow">Dataset coming next</p>
        <h2>Every classification will be traceable.</h2>
        <p>
          Vote records will include the Congress, roll-call number, date, measure,
          Hill&apos;s vote, Republican vote split, Trump position, source links,
          classification confidence, and a plain-language explanation of what the
          vote did.
        </p>
      </section>
    </main>
  );
}
