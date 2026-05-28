import Link from "next/link";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-700";
  if (score >= 70) return "text-amber-700";
  return "text-rose-700";
}

export default async function DebateCommandCenterPage() {
  const state = buildDebateCommandCenterState();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-subtle">Executive Debate Command Center</p>
        <h1 className="font-heading text-3xl font-bold">Arkansas Campaign War Room OS</h1>
        <p className="mt-2 max-w-4xl font-body text-sm text-kelly-muted">
          Live candidate prep center: what matters today, where confidence is weak, what the opponent is signaling, and what to drill next.
        </p>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-kelly-navy">A) Today's Priorities</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {state.todayPriorities.map((item) => (
            <article key={item.title} className={card}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{item.title}</p>
              <p className="mt-1 font-heading text-lg font-bold">{item.value}</p>
              <p className="mt-1 text-xs text-kelly-muted">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-kelly-navy">B) Candidate Readiness Scoreboard</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {state.readinessScores.map((score) => (
            <article key={score.id} className={card}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{score.label}</p>
              <p className={`mt-1 font-heading text-2xl font-bold ${scoreTone(score.score)}`}>{score.score}</p>
              <p className="mt-1 text-xs text-kelly-muted">Trend: {score.trend}</p>
              <p className="mt-1 text-xs text-kelly-muted">Weak area: {score.weakAreas[0] ?? "None flagged"}</p>
              <p className="mt-1 text-xs font-semibold text-kelly-navy">Next module: {score.nextModule}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <article className={`${card} lg:col-span-1`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">C) Three Core Message Pillars</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {state.messagePillars.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </article>

        <article className={`${card} lg:col-span-2`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">D) Today's Opponent Intelligence</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            Latest messaging and narrative shifts feeding live debate prep.
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Repeated phrases</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                {state.opponentIntelligence.repeatedPhrases.map((phrase) => (
                  <li key={phrase}>{phrase}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Newest bill anchors</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                {state.opponentIntelligence.newestResearch.slice(0, 4).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">E) Today's Drill</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            One-click launch for moderator + reporter + hostile follow-up + rebuttal pivots.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded border border-kelly-navy/30 bg-kelly-navy px-3 py-1 text-xs font-bold text-white">
              Start today's debate drill
            </Link>
            <Link href="/admin/intelligence/kim-hammer/research-gaps" className="rounded border px-3 py-1 text-xs font-semibold text-kelly-navy">
              View intelligence gaps
            </Link>
          </div>
        </article>

        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Training Academy Architecture</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {state.academyTracks.map((track) => (
              <li key={track}>{track}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Film Room + Simulation Loop</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs text-kelly-muted">
          <div>
            <p className="font-semibold text-kelly-navy">Mock moderator</p>
            <p>Question, follow-up, hostile follow-up, rapid-fire variant.</p>
          </div>
          <div>
            <p className="font-semibold text-kelly-navy">Scorecards</p>
            <p>Clarity, trust, calmness, warmth, discipline, voter connection, authenticity.</p>
          </div>
          <div>
            <p className="font-semibold text-kelly-navy">Vulnerability scan</p>
            <p>Unsupported claims, emotional drift, missed pivots, over-explaining.</p>
          </div>
          <div>
            <p className="font-semibold text-kelly-navy">Daily coaching</p>
            <p>What to study, what to drill, what to avoid, what to reinforce.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

