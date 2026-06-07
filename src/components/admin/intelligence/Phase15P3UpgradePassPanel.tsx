import Link from "next/link";
import type { Phase15P3UpgradePassReport } from "@/lib/intelligence/v4/phase15P3Closure";

export function Phase15P3UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase15P3UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-rose-400/80 bg-gradient-to-br from-rose-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-950">Upgrade pass 15 · P3</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-rose-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.surfacesAtBar}/{p.surfaceTotal} surfaces · {p.candidateBlockedCount} gated
          </p>
        </div>
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Trap lanes gated</dt>
          <dd className="font-bold text-kelly-navy">
            {p.trapLanesGated}/{p.trapLaneTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">SOS questions gated</dt>
          <dd className="font-bold text-kelly-navy">
            {p.sosQuestionsGated}/{p.sosQuestionTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Candidate nav</dt>
          <dd className={`font-bold ${p.hubInCandidateNav ? "text-emerald-700" : "text-rose-700"}`}>
            {p.hubInCandidateNav ? "Wired" : "Missing"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Filter profile</dt>
          <dd className={`font-bold ${p.filterWiredForCandidateProfile ? "text-emerald-700" : "text-rose-700"}`}>
            {p.filterWiredForCandidateProfile ? "Active" : "Open"}
          </dd>
        </div>
      </dl>

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-rose-400 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
      >
        Stage-safe filter hub
      </Link>
    </section>
  );
}
