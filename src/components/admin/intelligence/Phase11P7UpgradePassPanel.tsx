import Link from "next/link";
import type { Phase11P7UpgradePassReport } from "@/lib/intelligence/v4/phase11P7Closure";

export function Phase11P7UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase11P7UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-teal-300/80 bg-gradient-to-br from-teal-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-950">Upgrade pass 11 · P7</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-teal-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.lanesAtBar}/{p.laneTotal} lanes · {p.totalAttachableChunks.toLocaleString()} attachable
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Attach lanes</dt>
          <dd className="font-bold text-kelly-navy">
            {p.lanesAtBar}/{p.laneTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Attachable chunks</dt>
          <dd className="font-bold text-kelly-navy">{p.totalAttachableChunks.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">P6 preview</dt>
          <dd className="font-bold text-kelly-navy">{p.p6PreviewLanesAtBar}/8</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Canon</dt>
          <dd className="font-bold text-kelly-navy">{p.canonReady ? "Bound" : "Open"}</dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
      >
        Chunk attach hub
      </Link>
    </section>
  );
}
