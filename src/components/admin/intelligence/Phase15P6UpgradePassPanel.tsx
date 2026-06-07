import Link from "next/link";
import type { Phase15P6UpgradePassReport } from "@/lib/intelligence/v4/phase15P6Closure";
import { DEMO_MODE_DEPLOY_HINT } from "@/lib/intelligence/v4/intelligenceDemoMode";

export function Phase15P6UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase15P6UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-teal-400/80 bg-gradient-to-br from-teal-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-950">Upgrade pass 15 · P6</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-teal-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.stepsAtBar}/{p.stepTotal} steps · {p.scriptMinutes} min script
          </p>
        </div>
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Script steps</dt>
          <dd className="font-bold text-kelly-navy">
            {p.stepsAtBar}/{p.stepTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Candidate nav</dt>
          <dd className={`font-bold ${p.hubInCandidateNav ? "text-emerald-700" : "text-rose-700"}`}>
            {p.hubInCandidateNav ? "Wired" : "Missing"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Command home</dt>
          <dd className={`font-bold ${p.commandHomeWired ? "text-emerald-700" : "text-rose-700"}`}>
            {p.commandHomeWired ? "Strip live" : "Open"}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Deploy hint</dt>
          <dd className="font-bold text-teal-900">{p.demoEnvDocumented ? "Documented" : "Open"}</dd>
        </div>
      </dl>

      {!compact ? (
        <p className="mt-3 text-[10px] text-kelly-muted">{DEMO_MODE_DEPLOY_HINT}</p>
      ) : null}

      <Link
        href={report.hubHref}
        className="mt-4 inline-block rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
      >
        Demo mode hub
      </Link>
    </section>
  );
}
