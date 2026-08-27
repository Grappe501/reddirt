import Link from "next/link";
import type { CommunicationsIntelligenceContext } from "@/lib/communications/communications-intelligence-engine";

export function CommunicationsIntelligencePanel({ ctx }: { ctx: CommunicationsIntelligenceContext }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 font-body text-kelly-text">
      <header className="border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Kelly Campaign OS · Oscar Comms V3</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Communications intelligence</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          Oscar turns relationship, county, event, cadence, and workflow signals into a ranked human-review action brief.
        </p>
        <p className="mt-1 text-xs font-bold text-amber-900">
          Mass email: {ctx.massEmailStatus} · Human approval remains required for outbound political communications
        </p>
      </header>

      <section className="rounded-2xl border-2 border-kelly-navy/20 bg-kelly-page p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-subtle">Oscar decision brief · v{ctx.oscar.version}</p>
            <h2 className="mt-1 text-lg font-bold text-kelly-navy">{ctx.oscar.headline}</h2>
          </div>
          <div className="rounded-xl border bg-white px-4 py-2 text-right">
            <p className="text-[10px] font-bold uppercase text-kelly-muted">Operational readiness</p>
            <p className="text-2xl font-bold text-kelly-navy">{ctx.oscar.readinessScore}%</p>
            <p className="text-[10px] uppercase text-kelly-muted">{ctx.oscar.posture}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ctx.oscar.actions.map((action) => (
            <article key={action.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                  {action.priority} · {action.lane}
                </span>
                <span className="text-[10px] font-bold uppercase text-kelly-subtle">{action.confidence} confidence</span>
              </div>
              <h3 className="mt-1 text-sm font-bold text-kelly-navy">{action.title}</h3>
              <p className="mt-2 text-xs text-kelly-muted">{action.why}</p>
              <p className="mt-2 text-xs"><strong>Next:</strong> {action.nextStep}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-kelly-page p-4">
          <p className="text-xs font-bold text-kelly-muted">Relationship health</p>
          <p className="text-sm font-bold text-kelly-navy">{ctx.relationshipHealth.headline}</p>
        </div>
        <div className="rounded-xl border bg-kelly-page p-4">
          <p className="text-xs font-bold text-kelly-muted">Volunteer engagement</p>
          <p className="text-sm">{ctx.volunteerEngagement.active} active · {ctx.volunteerEngagement.atRisk} at risk</p>
        </div>
        <div className="rounded-xl border bg-kelly-page p-4">
          <p className="text-xs font-bold text-kelly-muted">County gaps</p>
          <p className="text-sm font-bold text-kelly-navy">{ctx.countyGaps.length} surfaced</p>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Oscar toolkit</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {ctx.oscar.capabilities.map((capability) => (
            <span key={capability} className="rounded-full border px-3 py-1 text-[11px] text-kelly-muted">{capability}</span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">County communications gaps</h2>
        <ul className="mt-2 space-y-2 text-xs">
          {ctx.countyGaps.map((c) => (
            <li key={c.countySlug} className="rounded-lg border px-3 py-2">
              <strong>{c.countyName}</strong> — {c.messagingAngle.slice(0, 120)}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Evidence limits & safety</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {ctx.oscar.evidenceWarnings.map((warning) => <li key={warning}>{warning}</li>)}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">System bottlenecks</h2>
        <ul className="mt-2 list-inside list-disc text-xs">
          {ctx.bottlenecks.map((b) => <li key={b}>{b}</li>)}
        </ul>
      </section>

      <p className="text-xs text-kelly-muted">
        <Link href="/admin/communications/studio" className="font-bold text-kelly-navy underline">Open Message Studio</Link>
        {" · "}
        <Link href="/admin/communications" className="underline">Communications center</Link>
        {" · "}
        <Link href="/admin/ai-command-center/copilots" className="underline">Oscar copilots</Link>
        {" · "}
        <Link href="/admin/workbench/email-command-center" className="underline">Governed send path</Link>
      </p>
    </div>
  );
}
