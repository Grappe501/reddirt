import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import type { PhaseAUpgradePassReport } from "@/lib/intelligence/v4/phaseAUpgradePass";

const STATUS_STYLE: Record<string, string> = {
  complete: "bg-emerald-100 text-emerald-900 border-emerald-200",
  in_progress: "bg-amber-100 text-amber-900 border-amber-200",
  open: "bg-rose-100 text-rose-900 border-rose-200",
  blocked: "bg-rose-200 text-rose-950 border-rose-300",
};

export function PhaseAUpgradePassPanel({
  report,
  compact,
}: {
  report: PhaseAUpgradePassReport;
  compact?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border-2 border-rose-300/80 bg-gradient-to-br from-rose-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-950">Upgrade pass 1</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-rose-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">pass complete</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <ul className={`mt-4 space-y-2 ${compact ? "text-xs" : "text-sm"}`}>
        {report.items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/10 bg-white px-3 py-2 transition hover:border-kelly-navy/30"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-kelly-navy">{item.label}</p>
                {!compact ? <p className="mt-0.5 text-xs text-kelly-muted">{item.description}</p> : null}
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLE[item.status] ?? STATUS_STYLE.open}`}
              >
                {item.statusLabel}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <IntelligenceNavLink
          href={report.diligenceHref}
          variant="chip"
          className="rounded-full border border-rose-300 bg-white px-3 py-1 text-[10px] font-bold text-rose-950"
        >
          Diligence hub →
        </IntelligenceNavLink>
        <IntelligenceNavLink
          href={report.fieldBookHref}
          variant="chip"
          className="rounded-full border border-kelly-gold/60 bg-white px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          The Field Book →
        </IntelligenceNavLink>
        <Link
          href="/admin/intelligence/field-book/phase/phase-a"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Phase A articles
        </Link>
      </div>
    </section>
  );
}
