import Link from "next/link";
import type { Phase11P6UpgradePassReport } from "@/lib/intelligence/v4/phase11P6Closure";

export function Phase11P6UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase11P6UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-purple-300/80 bg-gradient-to-br from-purple-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-purple-950">Upgrade pass 11 · P6</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-purple-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.lanesAtBar}/{p.laneTotal} lanes · {p.totalMatchingChunks.toLocaleString()} chunks
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Preview lanes</dt>
          <dd className="font-bold text-kelly-navy">
            {p.lanesAtBar}/{p.laneTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Matching chunks</dt>
          <dd className="font-bold text-kelly-navy">{p.totalMatchingChunks.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">P5 gate</dt>
          <dd className={`font-bold ${p.p5PromotionGateOpen ? "text-emerald-700" : "text-purple-800"}`}>
            {p.p5PromotionGateOpen ? "Open" : "Locked"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Canon</dt>
          <dd className="font-bold text-kelly-navy">{p.canonReady ? "Bound" : "Open"}</dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
      >
        Chunk preview hub
      </Link>
    </section>
  );
}
