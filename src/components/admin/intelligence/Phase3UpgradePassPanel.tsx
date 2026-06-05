import Link from "next/link";
import type { Phase3UpgradePassReport } from "@/lib/intelligence/v4/phase3DebateSpineDepth";

const WAVE_STYLE: Record<string, string> = {
  "w1-command": "border-indigo-300 bg-indigo-50/40",
  "w2-candidate-opponents": "border-emerald-300 bg-emerald-50/40",
  "w3-debate-spine": "border-violet-300 bg-violet-50/40",
  "w4-county-clerk": "border-sky-300 bg-sky-50/40",
  "w5-hammer-stack": "border-amber-300 bg-amber-50/40",
  "w6-staff": "border-slate-300 bg-slate-50/40",
};

export function Phase3UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase3UpgradePassReport;
  compact?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border-2 border-violet-300/80 bg-gradient-to-br from-violet-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-950">Upgrade pass 3</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-violet-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            W3 debate spine {report.w3DebateSpinePct}%
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <ul className={`mt-4 grid gap-2 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"} text-xs`}>
        {report.waves.map((wave) => (
          <li key={wave.id}>
            <Link
              href={wave.hubHref}
              className={`block rounded-lg border p-3 transition hover:shadow-sm ${WAVE_STYLE[wave.id] ?? "border-kelly-text/10 bg-white"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-kelly-navy">{wave.shortLabel}</p>
                <span className="font-heading text-lg font-bold text-violet-950">{wave.pct}%</span>
              </div>
              {!compact ? <p className="mt-1 text-kelly-muted">{wave.description}</p> : null}
              <p className="mt-2 text-[10px] font-bold text-kelly-subtle">
                {wave.atBar}/{wave.total} at five-layer bar
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/intelligence/phase-3-upgrade"
          className="rounded-full border border-violet-400 bg-white px-3 py-1 text-[10px] font-bold text-violet-950"
        >
          Phase 3 hub →
        </Link>
        <Link
          href="/admin/intelligence/trap-lanes"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Trap lanes
        </Link>
        <Link
          href="/admin/intelligence/sos-debate-questions"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          SOS questions
        </Link>
      </div>
    </section>
  );
}
