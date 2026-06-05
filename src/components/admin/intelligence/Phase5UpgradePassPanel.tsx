import Link from "next/link";
import type { Phase5UpgradePassReport } from "@/lib/intelligence/v4/phase5GlossaryConnectivity";

export function Phase5UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase5UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">Upgrade pass 5</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-indigo-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.glossaryTermsAtBar} glossary · {p.hubRoutesBound} hubs bound
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
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Glossary terms</dt>
          <dd className="font-bold text-kelly-navy">
            {p.glossaryTermsAtBar}/{p.glossaryTermCount}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Phase B/C articles</dt>
          <dd className="font-bold text-kelly-navy">
            {p.phaseBcArticlesAtBar}/{p.phaseBcArticleTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Hub bindings</dt>
          <dd className="font-bold text-kelly-navy">
            {p.hubRoutesBound}/{p.hubRoutesTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Strategy routes</dt>
          <dd className="font-bold text-kelly-navy">{p.strategyRouteCount}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={report.glossaryHubHref}
          className="rounded-full border border-indigo-400 bg-white px-3 py-1 text-[10px] font-bold text-indigo-950"
        >
          Debate glossary →
        </Link>
        <Link
          href="/admin/intelligence/phase-5-upgrade"
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Phase 5 upgrade →
        </Link>
        <Link
          href="/admin/intelligence/field-book/phase/phase-b"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Field Book Phase B →
        </Link>
      </div>
    </section>
  );
}
