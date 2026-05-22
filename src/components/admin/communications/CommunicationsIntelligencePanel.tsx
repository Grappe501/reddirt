import Link from "next/link";
import type { CommunicationsIntelligenceContext } from "@/lib/communications/communications-intelligence-engine";

export function CommunicationsIntelligencePanel({ ctx }: { ctx: CommunicationsIntelligenceContext }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 font-body text-kelly-text">
      <header className="border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Kelly Campaign OS · Comms V2</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Communications intelligence</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          Relationship graph, engagement scoring, sequences, and writing orchestration — human-gated sends only.
        </p>
        <p className="mt-1 text-xs font-bold text-amber-900">
          Mass email: {ctx.massEmailStatus} · No autonomous political outreach
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-kelly-page p-4">
          <p className="text-xs font-bold text-kelly-muted">Relationship health</p>
          <p className="text-sm font-bold text-kelly-navy">{ctx.relationshipHealth.headline}</p>
        </div>
        <div className="rounded-xl border bg-kelly-page p-4">
          <p className="text-xs font-bold text-kelly-muted">Volunteer engagement</p>
          <p className="text-sm">
            {ctx.volunteerEngagement.active} active · {ctx.volunteerEngagement.atRisk} at risk
          </p>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Top communications priorities</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {ctx.topPriorities.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">County communications gaps</h2>
        <ul className="mt-2 space-y-2 text-xs">
          {ctx.countyGaps.map((c) => (
            <li key={c.countySlug} className="rounded-lg border px-3 py-2">
              <strong>{c.countyName}</strong> — {c.messagingAngle.slice(0, 100)}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Fatigue & retention warnings</h2>
        <ul className="mt-2 text-xs text-kelly-muted">
          {ctx.fatigueWarnings.slice(0, 6).map((w) => (
            <li key={w}>{w}</li>
          ))}
          {ctx.retentionRisks.map((r) => (
            <li key={r}>Retention risk: {r}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Bottlenecks</h2>
        <ul className="mt-2 list-inside list-disc text-xs">
          {ctx.bottlenecks.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-kelly-muted">
        <Link href="/admin/communications/studio" className="underline">
          Message Studio
        </Link>
        {" · "}
        <Link href="/admin/communications" className="underline">
          Communications center
        </Link>
        {" · "}
        <Link href="/admin/ai-command-center/copilots" className="underline">
          Copilots
        </Link>
      </p>
    </div>
  );
}
