import Link from "next/link";
import type { Phase16P5UpgradePassReport } from "@/lib/intelligence/v4/phase16P5Closure";

export function Phase16P5UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase16P5UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-cyan-400/80 bg-gradient-to-br from-cyan-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-950">Upgrade pass 16 · P5</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-cyan-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.controlsAtBar}/{p.controlTotal} controls
          </p>
        </div>
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Controls</dt>
          <dd className={`font-bold ${p.controlsAtBar >= p.controlTotal ? "text-emerald-700" : "text-rose-700"}`}>
            {p.controlsAtBar}/{p.controlTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">iPad shell</dt>
          <dd className={`font-bold ${p.shellDrillNavWired ? "text-emerald-700" : "text-rose-700"}`}>
            {p.shellDrillNavWired ? "Wired" : "Missing"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Rehearse nav</dt>
          <dd className={`font-bold ${p.hubInCandidateNav ? "text-emerald-700" : "text-rose-700"}`}>
            {p.hubInCandidateNav ? "Wired" : "Missing"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">820px column</dt>
          <dd className="font-bold text-emerald-700">Preserved</dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-cyan-400 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-950"
      >
        iPad drill player
      </Link>
    </section>
  );
}
