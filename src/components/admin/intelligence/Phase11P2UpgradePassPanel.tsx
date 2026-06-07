import Link from "next/link";
import type { Phase11P2UpgradePassReport } from "@/lib/intelligence/v4/phase11P2Closure";

export function Phase11P2UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase11P2UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">Upgrade pass 11 · P2</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-indigo-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.movementDocsAtBar}/{p.movementDocTotal} docs · {p.staffSurfacesAtBar}/{p.staffSurfaceTotal} staff
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Philosophy docs</dt>
          <dd className="font-bold text-kelly-navy">
            {p.movementDocsAtBar}/{p.movementDocTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Staff surfaces</dt>
          <dd className="font-bold text-kelly-navy">
            {p.staffSurfacesAtBar}/{p.staffSurfaceTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Migration</dt>
          <dd className="font-bold text-kelly-navy">{p.strategyMigrationRoutes} routes</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Unbound</dt>
          <dd className="font-bold text-kelly-navy">{p.migrationCoverageUnbound.length}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={report.movementHubHref}
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Movement philosophy
        </Link>
        <Link
          href={report.staffHubHref}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Staff strategy command
        </Link>
      </div>
    </section>
  );
}
