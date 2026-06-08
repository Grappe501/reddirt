import Link from "next/link";
import type { Phase17UpgradePassReport } from "@/lib/intelligence/v4/phase17SearchAiPrepClosure";
import { SEARCH_AI_PREP_HUB_HREF } from "@/lib/intelligence/v4/phase17SearchAiPrepDepth";

export function Phase17UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase17UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-indigo-400/80 bg-gradient-to-br from-indigo-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">Upgrade pass 17 · Search + AI prep v4</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-indigo-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.checkpointsAtBar}/{p.checkpointTotal} checkpoints
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Corpus docs</dt>
          <dd className="font-bold text-kelly-navy">{p.corpusTotal.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">SRE indexed</dt>
          <dd className="font-bold text-kelly-navy">{p.rehearsalDocs}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Copilot tools</dt>
          <dd className="font-bold text-kelly-navy">{p.copilotDocs}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Quick tools</dt>
          <dd className="font-bold text-kelly-navy">{p.quickTools}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-1.5 text-sm">
        {report.checkpoints.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${c.atBar ? "bg-emerald-500" : "bg-amber-400"}`} />
            <span className="font-mono text-xs text-kelly-subtle">{c.id}</span>
          </li>
        ))}
      </ul>

      <Link
        href={SEARCH_AI_PREP_HUB_HREF}
        className="mt-4 inline-flex min-h-11 items-center rounded-full border border-indigo-400 bg-indigo-50 px-4 text-xs font-bold text-indigo-950"
      >
        Open search & AI prep hub →
      </Link>
    </section>
  );
}
