import Link from "next/link";
import {
  computeCitationAging,
  computeDebateThemeRecurrence,
  computeDoctrineDrift,
  computeExportFatigue,
  computeMessagingDrift,
  computeMediaCyclePatterns,
  computeNarrativeEvolution,
  computeCountyNarrativeShift,
  loadIntelligenceMemoryRegistry,
  summarizeLongitudinalIntelligence,
} from "@/lib/intelligence/intelligenceMemoryEngine";

export const dynamic = "force-dynamic";

function SignalList({ items }: { items: Array<{ signal: string; entityLabel: string; reason: string }> }) {
  if (items.length === 0) return <p className="text-xs text-kelly-subtle">None flagged.</p>;
  return (
    <ul className="list-inside list-disc text-xs text-kelly-muted">
      {items.map((row) => (
        <li key={`${row.signal}-${row.entityLabel}`}>
          <span className="font-semibold text-kelly-navy">{row.signal}</span> — {row.entityLabel}: {row.reason.slice(0, 120)}
        </li>
      ))}
    </ul>
  );
}

export default async function IntelligenceMemoryPage() {
  const registry = loadIntelligenceMemoryRegistry();
  const summary = summarizeLongitudinalIntelligence();
  const evolution = computeNarrativeEvolution();
  const messaging = computeMessagingDrift();
  const debate = computeDebateThemeRecurrence();
  const citations = computeCitationAging();
  const counties = computeCountyNarrativeShift();
  const doctrine = computeDoctrineDrift();
  const media = computeMediaCyclePatterns();
  const exportFatigue = computeExportFatigue();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">NSI-13 · Intelligence Memory</p>
        <h1 className="font-heading text-2xl font-bold">Longitudinal Political Memory</h1>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
          Historically-aware strategic intelligence — read-only synthesis. INTERNAL · NON_PUBLISHABLE ·
          HUMAN_REVIEW_REQUIRED. No autonomous publishing, strategy mutation, or doctrine updates.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
          <Link href="/admin/intelligence/kim-hammer/evidence-command" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Evidence Command
          </Link>
          <Link href="/admin/intelligence/ai-tools" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            AI tools
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        Registry: {registry.narrativeMemory.length} narrative · {registry.opponentMessagingMemory.length} messaging ·{" "}
        {registry.debateMemory.length} debate · {registry.citationMemory.length} citation ·{" "}
        {registry.countyNarrativeMemory.length} county memory entities.
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Trend summaries</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {summary.topTrendSummaries.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-rose-200/50 bg-rose-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-950">Drift & fatigue warnings</h2>
          <SignalList items={[...summary.weakeningNarratives, ...summary.exportFatigueWarnings].slice(0, 6)} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Narrative evolution</h2>
        <ul className="mt-2 space-y-2 text-xs">
          {evolution.slice(0, 8).map((row) => (
            <li key={row.narrativeId} className="rounded border border-kelly-text/10 p-2">
              <span className="font-semibold">{row.title}</span> — {row.primarySignal}
              <p className="mt-1 text-kelly-muted">{row.reasons[0]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Opponent messaging drift</h2>
          <SignalList items={messaging.slice(0, 6)} />
        </div>
        <div className="rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">Debate memory</h2>
          <SignalList items={debate.slice(0, 6)} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-orange-200/50 bg-orange-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-orange-950">Citation aging</h2>
          <SignalList items={citations.slice(0, 6)} />
        </div>
        <div className="rounded-xl border border-teal-200/50 bg-teal-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">County narrative shifts</h2>
          <SignalList items={counties.slice(0, 6)} />
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-sky-200/50 bg-sky-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-950">Export fatigue</h2>
          <SignalList items={exportFatigue} />
        </div>
        <div className="rounded-xl border border-purple-200/50 bg-purple-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-950">Doctrine drift</h2>
          <SignalList items={doctrine.slice(0, 6)} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Media cycle trends</h2>
        <SignalList items={media.slice(0, 8)} />
      </section>
    </div>
  );
}
