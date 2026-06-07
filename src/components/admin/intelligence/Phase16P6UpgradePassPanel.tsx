import Link from "next/link";
import type { Phase16P6UpgradePassReport } from "@/lib/intelligence/v4/phase16P6Closure";

export function Phase16P6UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase16P6UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-sky-400/80 bg-gradient-to-br from-sky-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-950">Upgrade pass 16 · P6</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-sky-950">{report.completionPct}%</p>
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
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Persistence</dt>
          <dd className={`font-bold ${p.persistenceWired ? "text-emerald-700" : "text-rose-700"}`}>
            {p.persistenceWired ? "JSON" : "Open"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Home nav</dt>
          <dd className={`font-bold ${p.hubInCandidateNav ? "text-emerald-700" : "text-rose-700"}`}>
            {p.hubInCandidateNav ? "Wired" : "Missing"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Staff reset</dt>
          <dd className={`font-bold ${p.clearApiWired ? "text-emerald-700" : "text-rose-700"}`}>
            {p.clearApiWired ? "API" : "Missing"}
          </dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-sky-400 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
      >
        Rehearsal history hub
      </Link>
    </section>
  );
}
