import Link from "next/link";
import type { Phase6UpgradePassReport } from "@/lib/intelligence/v4/phase6DebateReadyGovernance";
import { PHASE6_PROMOTED_KH_MODULE_IDS } from "@/lib/intelligence/kimHammerV4ModuleRegistry";

export function Phase6UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase6UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-rose-300/80 bg-gradient-to-br from-rose-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-950">Upgrade pass 6</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-rose-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            prep {p.prepSectionsAtBar}/{p.prepSectionTotal} · traps {p.trapLanesAtBar}/{p.trapLaneTotal}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Prep sections</dt>
          <dd className="font-bold text-kelly-navy">
            {p.prepSectionsAtBar}/{p.prepSectionTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Trap lanes</dt>
          <dd className="font-bold text-kelly-navy">
            {p.trapLanesAtBar}/{p.trapLaneTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">KH promoted</dt>
          <dd className="font-bold text-kelly-navy">
            {p.khModulesPromoted}/{p.khModulesPromotedTarget}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Claims review</dt>
          <dd className="font-bold text-kelly-navy">{p.claimsNeedsReview} NEEDS_REVIEW</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={report.hubHref}
          className="rounded-full border border-rose-400 bg-white px-3 py-1 text-[10px] font-bold text-rose-950"
        >
          Phase 6 hub →
        </Link>
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Debate prep →
        </Link>
        <Link
          href="/admin/intelligence/trap-lanes"
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Trap lanes →
        </Link>
      </div>

      {!compact ? (
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Priority KH modules: {PHASE6_PROMOTED_KH_MODULE_IDS.slice(0, 5).join(", ")}…
        </p>
      ) : null}
    </section>
  );
}
