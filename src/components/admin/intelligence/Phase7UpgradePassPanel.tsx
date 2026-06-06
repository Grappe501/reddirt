import Link from "next/link";
import type { Phase7UpgradePassReport } from "@/lib/intelligence/v4/phase7DossierDiligenceClosure";
import { PHASE7_PROMOTED_KH_MODULE_IDS } from "@/lib/intelligence/kimHammerV4ModuleRegistry";

export function Phase7UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase7UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-sky-300/80 bg-gradient-to-br from-sky-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-950">Upgrade pass 7</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-sky-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            dossier {p.dossierOverallPct}% · runbook {p.diligenceRunbookPct}%
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Dossier briefing</dt>
          <dd className="font-bold text-kelly-navy">
            K {p.kellyPct}% · H {p.hammerPct}% · P {p.pakkoPct}%
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Diligence runbook</dt>
          <dd className="font-bold text-kelly-navy">{p.diligenceRunbookPct}%</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">KH wave 2</dt>
          <dd className="font-bold text-kelly-navy">
            {p.khWave2Promoted}/10 · {p.khTotalPromoted} total
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Election funding</dt>
          <dd className="font-bold text-kelly-navy">
            {p.electionFundingAtBar}/{p.electionFundingTotal} at bar
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={report.hubHref}
          className="rounded-full border border-sky-400 bg-white px-3 py-1 text-[10px] font-bold text-sky-950"
        >
          Phase 7 hub →
        </Link>
        <Link
          href={report.diligenceHubHref}
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Diligence hub →
        </Link>
        <Link
          href="/admin/intelligence/candidate-dossiers"
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Dossier briefing book →
        </Link>
      </div>

      {!compact ? (
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Wave 2 KH modules: {PHASE7_PROMOTED_KH_MODULE_IDS.slice(0, 5).join(", ")}…
        </p>
      ) : null}
    </section>
  );
}
