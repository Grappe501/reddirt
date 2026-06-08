import Link from "next/link";
import type { Phase18UpgradePassReport } from "@/lib/intelligence/v4/phase18SearchAiProfessorClosure";
import { SEARCH_AI_PREP_HUB_HREF } from "@/lib/intelligence/v4/phase18SearchAiProfessorClosure";

export function Phase18UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase18UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-violet-400/80 bg-gradient-to-br from-violet-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-950">Upgrade pass 18 · Professor depth</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-violet-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.checkpointsAtBar}/{p.checkpointTotal} checkpoints
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Corpus docs</dt>
          <dd className="font-bold text-kelly-navy">{p.corpusTotal.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Professor modes</dt>
          <dd className="font-bold text-kelly-navy">{p.professorModes}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Search v5</dt>
          <dd className="font-bold text-kelly-navy">{p.searchV5Ready ? "Ready" : "Open"}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Tutor v2</dt>
          <dd className="font-bold text-kelly-navy">{p.tutorV2Ready ? "Ready" : "Open"}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-1.5 text-sm">
        {report.checkpoints.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <span className={c.atBar ? "text-emerald-600" : "text-rose-600"}>{c.atBar ? "✓" : "✗"}</span>
            <span className="text-kelly-muted">{c.id}</span>
          </li>
        ))}
      </ul>

      {!compact ? (
        <Link
          href={SEARCH_AI_PREP_HUB_HREF}
          className="mt-4 inline-flex rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Search & AI prep hub →
        </Link>
      ) : null}
    </section>
  );
}
