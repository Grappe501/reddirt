import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import {
  EP_DEBATE_PREP_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epOpponentBioHref,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";
import { loadOppositionResearchCandidateBrief } from "@/lib/election-plan/load-opposition-research-candidate-brief";
import {
  OPPOSITION_RESEARCH_RELEASE_LABEL,
  OPPOSITION_RESEARCH_RELEASE_VERSION,
} from "@/lib/election-plan/opposition-research-release";

export function ElectionPlanOppositionDebateNightPanel() {
  const brief = loadOppositionResearchCandidateBrief();

  return (
    <section>
      <Link
        href={EP_OPPOSITION_RESEARCH_HREF}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← Opposition research hub
      </Link>

      <header className="mb-6 mt-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-800">Kelly · debate night card</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">Five minutes before you walk on stage</h1>
        <p className="mt-3 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
          Export-ready Hammer lines, top rebuttals, Pakko respect pivots, and do-not-say guardrails — nothing else unless
          staff cleared it this week.
        </p>
      </header>

      <KellyPageSummary summary={brief.kellyOneLiner} label="Kelly read · one breath" />

      <article className="ep-card mb-6 border-l-4 border-violet-400 bg-violet-50/30 p-5 text-sm">
        <p className="text-[10px] font-bold uppercase text-violet-900">Three-way geometry</p>
        <p className="mt-2 leading-relaxed text-[var(--ep-navy)]">{brief.threeWayGeometry}</p>
      </article>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <div className="ep-stat">
          <div className="ep-stat-value">{brief.stats.exportReadyClaimCount}</div>
          <div className="ep-stat-label">Export-ready Hammer claims</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{brief.topHammerRebuttals.length}</div>
          <div className="ep-stat-label">Rebuttals on this card</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{brief.stats.pakkoQuoteCount}</div>
          <div className="ep-stat-label">Pakko sourced quotes</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-amber-800">{brief.stats.reviewNeededClaimCount}</div>
          <div className="ep-stat-label">Staff review queue</div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Stage-safe Hammer lines</h2>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Tier 1 · cited · low legal risk — verified export filter</p>
        <ol className="mt-4 space-y-3">
          {brief.exportReadyLines.map((line, idx) => (
            <li key={line.id} className="ep-card border-emerald-200 bg-emerald-50/20 p-4 text-sm">
              <p className="text-[10px] font-bold uppercase text-emerald-900">
                {idx + 1}. {line.topic}
              </p>
              <p className="mt-2 font-semibold text-[var(--ep-navy)]">{line.claim}</p>
              <p className="mt-2 text-[var(--ep-navy-muted)]">
                <span className="font-bold text-[var(--ep-navy)]">Kelly use:</span> {line.kellyUse}
              </p>
            </li>
          ))}
        </ol>
        {brief.exportReadyLines.length === 0 ? (
          <p className="ep-card mt-3 p-4 text-sm text-amber-900">No export-ready claims — staff must verify before stage.</p>
        ) : null}
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Top Hammer rebuttals</h2>
        <div className="mt-4 space-y-4">
          {brief.topHammerRebuttals.slice(0, 3).map((r) => (
            <article key={r.topic} className="ep-card p-5 text-sm">
              <p className="text-xs font-bold uppercase text-rose-800">{r.topic}</p>
              <dl className="mt-3 space-y-2">
                <div>
                  <dt className="font-bold text-rose-900">If Hammer says</dt>
                  <dd className="text-[var(--ep-navy-muted)]">{r.likelyHammerArgument}</dd>
                </div>
                <div>
                  <dt className="font-bold text-emerald-900">Kelly frame</dt>
                  <dd className="text-[var(--ep-navy)]">{r.kellyResponseFrame}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[var(--ep-navy)]">Bridge (say aloud)</dt>
                  <dd className="italic text-[var(--ep-navy)]">&ldquo;{r.bridgeLine}&rdquo;</dd>
                </div>
                <div>
                  <dt className="font-bold text-amber-900">Avoid</dt>
                  <dd className="text-[var(--ep-navy-muted)]">{r.avoid}</dd>
                </div>
              </dl>
              <Link
                href={epOppositionResearchModuleHref("debate-profile")}
                className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] hover:underline"
              >
                Full debate profile →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Pakko — respect + pivot</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{brief.pakkoExecutiveSummary}</p>
        <ul className="mt-4 space-y-3">
          {brief.pakkoRespectLines.slice(0, 3).map((q) => (
            <li key={q.id} className="ep-card border-indigo-200 bg-indigo-50/20 p-4 text-sm">
              <p className="text-[10px] font-bold uppercase text-indigo-900">{q.topic}</p>
              <p className="mt-2 italic text-[var(--ep-navy-muted)]">&ldquo;{q.quoteText}&rdquo;</p>
              <p className="mt-2 text-[var(--ep-navy)]">
                <span className="font-bold">Kelly:</span> {q.kellyResponseFrame}
              </p>
              {q.doNotMisquote ? (
                <p className="mt-2 text-xs font-bold text-amber-900">Do not misquote: {q.doNotMisquote}</p>
              ) : null}
            </li>
          ))}
        </ul>
        <Link href={epOpponentBioHref("michael-packo")} className="mt-3 inline-block text-xs font-bold underline">
          Full Pakko biography →
        </Link>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <article className="ep-card border-amber-200 bg-amber-50/30 p-5 text-sm">
          <h3 className="font-heading font-bold text-amber-950">Do not say — Hammer</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {brief.hammerDoNotSay.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </article>
        <article className="ep-card border-indigo-200 bg-indigo-50/30 p-5 text-sm">
          <h3 className="font-heading font-bold text-indigo-950">Do not say — Pakko</h3>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {brief.pakkoDoNotSay.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Memory lines — lock before sim</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="ep-card p-4 text-sm">
            <p className="text-xs font-bold uppercase text-rose-800">Hammer</p>
            <ul className="mt-2 space-y-2">
              {brief.hammerMemoryLines.slice(0, 3).map((line) => (
                <li key={line.slice(0, 48)} className="border-l-2 border-rose-300 pl-3 italic text-[var(--ep-navy)]">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="ep-card p-4 text-sm">
            <p className="text-xs font-bold uppercase text-indigo-800">Pakko</p>
            <ul className="mt-2 space-y-2">
              {brief.pakkoMemoryLines.slice(0, 3).map((line) => (
                <li key={line.slice(0, 48)} className="border-l-2 border-indigo-300 pl-3 italic text-[var(--ep-navy)]">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <nav className="flex flex-wrap gap-3 text-sm font-bold">
        <Link href={EP_DEBATE_PREP_HREF} className="rounded-full bg-[var(--ep-navy)] px-5 py-2 text-white">
          Debate prep hub →
        </Link>
        <Link href={EP_OPPONENT_BIOS_HREF} className="rounded-full border border-[var(--ep-navy)] px-5 py-2">
          Opponent bios →
        </Link>
        <Link href={epOppositionResearchModuleHref("debate-profile")} className="rounded-full border border-rose-300 px-5 py-2">
          Hammer rebuttal bank →
        </Link>
      </nav>

      <p className="mt-6 text-[10px] font-mono text-[var(--ep-navy-muted)]">
        {OPPOSITION_RESEARCH_RELEASE_VERSION} · {OPPOSITION_RESEARCH_RELEASE_LABEL}
      </p>
    </section>
  );
}
