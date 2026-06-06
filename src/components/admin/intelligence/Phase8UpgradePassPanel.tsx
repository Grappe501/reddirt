import Link from "next/link";
import type { Phase8UpgradePassReport } from "@/lib/intelligence/v4/phase8DossierResearchAccaClosure";
import { PHASE8_PROMOTED_KH_MODULE_IDS } from "@/lib/intelligence/kimHammerV4ModuleRegistry";

export function Phase8UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase8UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-violet-300/80 bg-gradient-to-br from-violet-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-950">Upgrade pass 8</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-violet-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            research {p.dossierResearchPct}% · ACCA {p.accaSectionsAtBar}/{p.accaSectionTotal}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Dossier research</dt>
          <dd className="font-bold text-kelly-navy">
            K {p.kellySectionsAtResearchBar}/{p.kellySectionTotal} · H {p.hammerSectionsAtResearchBar}/
            {p.hammerSectionTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Pakko sections</dt>
          <dd className="font-bold text-kelly-navy">
            {p.pakkoSectionsAtResearchBar}/{p.pakkoSectionTotal} at bar
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">ACCA panel</dt>
          <dd className="font-bold text-kelly-navy">
            {p.accaSectionsAtBar}/{p.accaSectionTotal} sections
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">KH wave 3</dt>
          <dd className="font-bold text-kelly-navy">
            {p.khWave3Promoted}/10 · {p.khTotalPromoted} total
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={report.hubHref}
          className="rounded-full border border-violet-400 bg-white px-3 py-1 text-[10px] font-bold text-violet-950"
        >
          Phase 8 hub →
        </Link>
        <Link
          href={report.accaHubHref}
          className="rounded-full border border-amber-400 px-3 py-1 text-[10px] font-bold text-amber-950"
        >
          ACCA panel prep →
        </Link>
        <Link
          href="/admin/intelligence/candidate-dossiers"
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Dossier research corpus →
        </Link>
      </div>

      {!compact ? (
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Wave 3 KH modules: {PHASE8_PROMOTED_KH_MODULE_IDS.slice(0, 5).join(", ")}…
        </p>
      ) : null}
    </section>
  );
}
