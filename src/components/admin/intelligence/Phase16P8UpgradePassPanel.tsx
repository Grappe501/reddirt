import Link from "next/link";
import type { Phase16P8UpgradePassReport } from "@/lib/intelligence/v4/phase16P8Closure";

export function Phase16P8UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase16P8UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-orange-400/80 bg-gradient-to-br from-orange-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-950">Upgrade pass 16 · P8</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-orange-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.fieldsAtBar}/{p.fieldTotal} fields
          </p>
        </div>
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Fields</dt>
          <dd className={`font-bold ${p.fieldsAtBar >= p.fieldTotal ? "text-emerald-700" : "text-rose-700"}`}>
            {p.fieldsAtBar}/{p.fieldTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Day-of plan</dt>
          <dd className={`font-bold ${p.dayOfPlanSafe ? "text-emerald-700" : "text-rose-700"}`}>
            {p.dayOfPlanSafe ? "Safe" : "Open"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Home nav</dt>
          <dd className={`font-bold ${p.hubInCandidateNav ? "text-emerald-700" : "text-rose-700"}`}>
            {p.hubInCandidateNav ? "Wired" : "Missing"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Live detect</dt>
          <dd className={`font-bold ${p.liveModeDetectWired ? "text-emerald-700" : "text-rose-700"}`}>
            {p.liveModeDetectWired ? "Env" : "Missing"}
          </dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
      >
        Live event hub
      </Link>
    </section>
  );
}
