import Link from "next/link";
import { Phase15P3UpgradePassPanel } from "@/components/admin/intelligence/Phase15P3UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  computePhase15P3UpgradePass,
  listStageSafeFilterSurfaces,
} from "@/lib/intelligence/v4/phase15P3Closure";

export const dynamic = "force-dynamic";

export default function StageSafeFilterHubPage() {
  const report = computePhase15P3UpgradePass();
  const surfaces = listStageSafeFilterSurfaces();
  const traps = surfaces.filter((s) => s.kind === "trap-lane");
  const sos = surfaces.filter((s) => s.kind === "sos-question");
  const coaching = surfaces.filter((s) => s.kind === "coaching-script");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P3"
        title="Stage-safe filter"
        description="Candidate and clerk-week profiles redact NEEDS_REVIEW rehearse lines on trap lanes, SOS questions, and coaching scripts — staff-verify fallback with research-question framing."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-rose-400 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Claims ledger
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P3UpgradePassPanel report={report} compact />

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-rose-100 bg-white p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-rose-950">Trap lanes</p>
          <p className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{traps.length}</p>
          <p className="mt-1 text-xs text-kelly-muted">
            {traps.filter((t) => t.candidateBlocked).length} gated for candidate profile
          </p>
        </article>
        <article className="rounded-xl border border-rose-100 bg-white p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-rose-950">SOS questions</p>
          <p className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{sos.length}</p>
          <p className="mt-1 text-xs text-kelly-muted">
            {sos.filter((t) => t.candidateBlocked).length} gated for candidate profile
          </p>
        </article>
        <article className="rounded-xl border border-rose-100 bg-white p-4 text-sm">
          <p className="text-[10px] font-bold uppercase text-rose-950">Coaching scripts</p>
          <p className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{coaching.length}</p>
          <p className="mt-1 text-xs text-kelly-muted">Opening and closing rehearse cards</p>
        </article>
      </section>

      <section className="space-y-6">
        {(
          [
            ["Trap lanes", traps],
            ["SOS debate questions", sos],
            ["Coaching scripts", coaching],
          ] as const
        ).map(([title, rows]) => (
          <div key={title}>
            <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">{title}</h2>
            <div className="space-y-2">
              {rows.map((row) => (
                <article key={row.surfaceId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={row.href} className="font-bold text-kelly-navy underline">
                      {row.title}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        row.candidateBlocked ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {row.candidateBlocked ? "Candidate gated" : "Clear for rehearsal"}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-amber-950">{row.claimsGate}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
