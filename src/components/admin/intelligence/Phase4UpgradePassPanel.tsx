import Link from "next/link";
import type { Phase4UpgradePassReport } from "@/lib/intelligence/v4/phase4CanonLoop";

export function Phase4UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase4UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-950">Upgrade pass 4</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-emerald-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.bindingCount} bindings · {p.strategyRoutes} strategy routes
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Canon bindings</dt>
          <dd className="font-bold text-kelly-navy">
            {p.bindingsAtBar}/{p.bindingCount} at bar
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Phase D articles</dt>
          <dd className="font-bold text-kelly-navy">
            {p.phaseDArticlesAtBar}/{p.phaseDArticleTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Strategy bridge</dt>
          <dd className="font-bold text-kelly-navy">{p.strategyCoveragePct}%</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Claims gates</dt>
          <dd className="font-bold text-kelly-navy">{p.routesWithClaimsGate} routes</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={report.canonHubHref}
          className="rounded-full border border-emerald-400 bg-white px-3 py-1 text-[10px] font-bold text-emerald-950"
        >
          Canon loop hub →
        </Link>
        <Link
          href="/admin/intelligence/phase-4-upgrade"
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Phase 4 upgrade →
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Strategy alignment →
        </Link>
      </div>
    </section>
  );
}
