import Link from "next/link";
import type { Phase15P0P1UpgradePassReport } from "@/lib/intelligence/v4/phase15Closure";

export function Phase15P0P1UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase15P0P1UpgradePassReport;
  compact?: boolean;
}) {
  const { p0, p1 } = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-indigo-400/80 bg-gradient-to-br from-indigo-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">Upgrade pass 15 · P0+P1</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-indigo-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            nav {p0.linkCount} links · home {p1.readinessPct}% ready
          </p>
        </div>
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Sections</dt>
          <dd className="font-bold text-kelly-navy">{p0.sectionCount}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Builder hidden</dt>
          <dd className={`font-bold ${p0.builderInfraHidden ? "text-emerald-700" : "text-rose-700"}`}>
            {p0.builderInfraHidden ? "Yes" : "No"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Safe lines</dt>
          <dd className="font-bold text-kelly-navy">{p1.safeLineCount}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Blocked lines</dt>
          <dd className="font-bold text-kelly-navy">{p1.blockedLineCount}</dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
      >
        Command home
      </Link>
    </section>
  );
}
