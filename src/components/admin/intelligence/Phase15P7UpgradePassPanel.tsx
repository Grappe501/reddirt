import Link from "next/link";
import type { Phase15P7UpgradePassReport } from "@/lib/intelligence/v4/phase15P7Closure";
import { CANDIDATE_IPAD_DEPLOY_HINT } from "@/lib/intelligence/candidateIpadMode";

export function Phase15P7UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase15P7UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-sky-400/80 bg-gradient-to-br from-sky-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-950">Upgrade pass 15 · P7</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-sky-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.sectionsAtBar}/{p.sectionTotal} sections · {p.bottomNavTabs} tabs
          </p>
        </div>
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Bottom nav</dt>
          <dd className={`font-bold ${p.shellUsesFiveSections ? "text-emerald-700" : "text-rose-700"}`}>
            {p.bottomNavTabs} tabs
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Candidate nav</dt>
          <dd className={`font-bold ${p.hubInCandidateNav ? "text-emerald-700" : "text-rose-700"}`}>
            {p.hubInCandidateNav ? "Wired" : "Missing"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Section sheets</dt>
          <dd className="font-bold text-kelly-navy">{p.sectionsAtBar}/{p.sectionTotal}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Deploy hint</dt>
          <dd className="font-bold text-sky-900">{p.ipadEnvDocumented ? "Documented" : "Open"}</dd>
        </div>
      </dl>

      {!compact ? <p className="mt-3 text-[10px] text-kelly-muted">{CANDIDATE_IPAD_DEPLOY_HINT}</p> : null}

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-sky-400 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
      >
        iPad polish hub
      </Link>
    </section>
  );
}
