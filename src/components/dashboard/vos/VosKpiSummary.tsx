import Link from "next/link";

import type { Kpi } from "@/types/dashboard";

function KpiBar({ kpi }: { kpi: Kpi }) {
  const pct =
    kpi.target != null && kpi.target > 0 ? Math.min(100, Math.round((kpi.value / kpi.target) * 100)) : null;
  return (
    <div className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-body text-xs font-semibold text-kelly-deep">{kpi.label}</p>
        <p className="font-mono text-xs text-kelly-text/70">
          {kpi.value}
          {kpi.target != null ? ` / ${kpi.target}` : ""}
        </p>
      </div>
      {pct != null ? (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-kelly-text/10">
          <div className="h-full rounded-full bg-kelly-gold/90" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      <p className="mt-1 font-body text-[10px] uppercase tracking-wide text-kelly-text/45">{kpi.period}</p>
    </div>
  );
}

export function VosKpiSummary({
  title,
  kpis,
  titleHref,
  cardHref,
}: {
  title: string;
  kpis: Kpi[];
  /** When set, shows a drill-down link to full metrics / breakdown. Ignored if `cardHref` is set. */
  titleHref?: string;
  /** Whole card links to full metrics (keyboard-friendly drill-down). */
  cardHref?: string;
}) {
  const shellClass =
    "rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-kelly-gold/80";

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <h3 className="font-heading text-lg font-bold text-kelly-navy">{title}</h3>
      {cardHref ? (
        <span className="font-body text-xs font-semibold text-kelly-blue group-hover:text-kelly-navy">Full breakdown →</span>
      ) : titleHref ? (
        <Link href={titleHref} className="font-body text-xs font-semibold text-kelly-blue underline hover:text-kelly-navy">
          Full breakdown →
        </Link>
      ) : null}
    </div>
  );

  const body = (
    <>
      {header}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {kpis.map((k) => (
          <KpiBar key={k.id} kpi={k} />
        ))}
      </div>
    </>
  );

  if (cardHref) {
    return (
      <Link href={cardHref} className={`${shellClass} group block hover:border-kelly-navy/25`} title="Open full KPI breakdown">
        {body}
      </Link>
    );
  }

  return <section className={shellClass}>{body}</section>;
}

export function VosKpiMiniGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {kpis.map((k) => (
        <KpiBar key={k.id} kpi={k} />
      ))}
    </div>
  );
}
