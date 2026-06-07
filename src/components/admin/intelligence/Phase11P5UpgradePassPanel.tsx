import Link from "next/link";
import type { Phase11P5UpgradePassReport } from "@/lib/intelligence/v4/phase11P5Closure";
import { PHASE11_P5_INTELLIGENCE_GATE_PCT } from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";

export function Phase11P5UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase11P5UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-950">Upgrade pass 11 · P5</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-amber-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.totalChunks.toLocaleString()} chunks · {p.batchesAtBar}/{p.batchTotal} batches
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Chunks</dt>
          <dd className="font-bold text-kelly-navy">
            {p.totalChunks.toLocaleString()}/{p.targetChunkTotal.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Kelly · CSM</dt>
          <dd className="font-bold text-kelly-navy">
            {p.strategicPlanChunks.toLocaleString()} · {p.campaignSystemChunks.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Phase 11 stack</dt>
          <dd className="font-bold text-kelly-navy">{p.phase11StackReadinessPct}%</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Promotion gate</dt>
          <dd className={`font-bold ${p.promotionGateOpen ? "text-emerald-700" : "text-amber-800"}`}>
            {p.promotionGateOpen ? "Open" : `Locked · ${PHASE11_P5_INTELLIGENCE_GATE_PCT}%`}
          </dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
      >
        Chunk promotion hub
      </Link>
    </section>
  );
}
