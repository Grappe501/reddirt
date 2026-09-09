import { notFound } from "next/navigation";
import { loadVotes, voteKey } from "../../../src/lib/vote-ledger";

export function generateStaticParams() {
  return loadVotes().map((vote) => ({ vote: voteKey(vote) }));
}

export default async function VoteDetailPage({ params }: { params: Promise<{ vote: string }> }) {
  const { vote: key } = await params;
  const vote = loadVotes().find((item) => voteKey(item) === key);
  if (!vote) notFound();

  const gopTotal = vote.republicanYea + vote.republicanNay;
  const demTotal = vote.democratYea + vote.democratNay;
  const gopYeaPct = gopTotal ? Math.round((vote.republicanYea / gopTotal) * 1000) / 10 : null;
  const gopNayPct = gopTotal ? Math.round((vote.republicanNay / gopTotal) * 1000) / 10 : null;
  const demYeaPct = demTotal ? Math.round((vote.democratYea / demTotal) * 1000) / 10 : null;
  const demNayPct = demTotal ? Math.round((vote.democratNay / demTotal) * 1000) / 10 : null;

  return (
    <main>
      <p className="eyebrow">Vote evidence page</p>
      <h1>{vote.measure || `Roll Call ${vote.rollCall}`}</h1>
      <p className="lede">Congress {vote.congress} · Roll Call {vote.rollCall} · {vote.date}</p>

      <section className="evidence-grid">
        <article className="evidence-card"><span>French Hill</span><strong>{vote.hillVote}</strong></article>
        <article className="evidence-card"><span>GOP status</span><strong>{vote.partyBreak ? "Broke with GOP majority" : vote.hillAlignedWithGop ? "Aligned with GOP majority" : "Unclassified"}</strong></article>
        <article className="evidence-card"><span>Partisanship</span><strong>{vote.highPartisanship ? "Highly partisan" : "Not highly partisan"}</strong><small>{vote.partisanshipScore ?? "—"}/100</small></article>
        <article className="evidence-card"><span>Trump status</span><strong>{vote.trumpPosition}</strong></article>
      </section>

      {vote.question && <section className="panel"><div><p className="eyebrow">Question before the House</p><h2>{vote.question}</h2></div><p>This text is preserved from the House roll-call record and should be read alongside the official source below.</p></section>}

      <section className="split-grid">
        <article className="split-card"><p className="eyebrow">Republicans</p><h2>{vote.republicanYea} Yea / {vote.republicanNay} Nay</h2><p>{gopYeaPct ?? "—"}% Yea · {gopNayPct ?? "—"}% Nay</p></article>
        <article className="split-card"><p className="eyebrow">Democrats</p><h2>{vote.democratYea} Yea / {vote.democratNay} Nay</h2><p>{demYeaPct ?? "—"}% Yea · {demNayPct ?? "—"}% Nay</p></article>
      </section>

      <section className="panel muted"><div><p className="eyebrow">Classification</p><h2>Why this vote is labeled this way</h2></div><p>{vote.partyBreak ? "Hill voted opposite the majority of voting House Republicans on this roll call." : vote.highlyPartisanGopAlignment ? "Hill voted with the Republican majority on a vote where at least 90% of voting Republicans opposed at least 90% of voting Democrats." : "This vote does not currently meet a break or highly partisan GOP-alignment classification."} Trump alignment remains separate and is only assigned when a documented Trump position is available.</p></section>

      <section className="sources"><p className="eyebrow">Primary sources</p><h2>Evidence</h2>{vote.sources?.map((source) => <a className="source-link" href={source.url} key={`${source.url}-${source.label}`}>{source.label}{source.primary ? " · Primary" : ""}</a>)}</section>
    </main>
  );
}
