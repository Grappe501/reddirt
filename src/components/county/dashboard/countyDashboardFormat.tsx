import type { CountyDashboardLabeledMetric } from "@/lib/campaign-engine/county-dashboards/types";
import { cn } from "@/lib/utils";
import { countyDashboardCardClass, countyDashboardCardCompactClass } from "./countyDashboardClassNames";

export function formatCountyDashboardNumber(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

export function CountySourceBadge({ source, note }: { source: CountyDashboardLabeledMetric<unknown>["source"]; note?: string }) {
  const label = source === "db" ? "DB" : source === "derived" ? "Derived" : "Demo / seed";
  return (
    <span
      className={cn(
        "ml-0.5 inline-block rounded border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
        source === "demo"
          ? "border-amber-300/80 bg-amber-100/95 text-amber-950 ring-1 ring-amber-200/50"
          : "border-kelly-slate/20 bg-kelly-slate/8 text-kelly-text/75",
      )}
      title={note}
    >
      {label}
    </span>
  );
}

type CountyKpiCardProps = {
  label: string;
  metric: CountyDashboardLabeledMetric<number | null | string>;
  actionHint: string;
  /** Tighter card for high-density command strips. */
  compact?: boolean;
};

/**
 * One KPI: label, value with suffix heuristics from label, source badge, action line.
 */
function metricSuffixForLabel(label: string): string | null {
  const L = label.toLowerCase();
  if (L.includes("turnout")) return "%";
  if (L.includes("coverage")) return "%";
  if (L.includes("growth") && L.includes("%")) return "%";
  if (L.includes("kpi engine %")) return "%";
  if (L.includes("rate") && !L.includes("turnout")) return "%";
  if (L.includes("completion") && L.includes("%")) return "%";
  if (L.includes("readiness")) return "/100";
  if (L.includes("pipeline")) return "/100";
  return null;
}

export function CountyKpiCard({ label, metric, actionHint, compact }: CountyKpiCardProps) {
  const cardClass = compact ? countyDashboardCardCompactClass : countyDashboardCardClass;
  const suffix = metric.value != null && typeof metric.value === "number" ? metricSuffixForLabel(label) : null;
  return (
    <div className={cn(cardClass, "min-w-0 flex-1")}>
      <p
        className={cn(
          "font-bold uppercase text-kelly-text/55",
          compact ? "text-[9px] leading-tight tracking-wider" : "text-[10px] tracking-widest",
        )}
      >
        <span className="line-clamp-2">{label}</span> <CountySourceBadge source={metric.source} note={metric.note} />
      </p>
      <p
        className={cn(
          "mt-0.5 font-heading font-bold text-kelly-navy",
          compact ? "text-lg leading-tight sm:text-xl" : "text-2xl",
        )}
      >
        {typeof metric.value === "number" ? formatCountyDashboardNumber(metric.value) : metric.value}
        {suffix}
      </p>
      <p
        className={cn(
          "mt-0.5 leading-snug text-kelly-text/70",
          compact ? "text-[10px] sm:text-[11px]" : "text-xs",
        )}
      >
        <span className="font-semibold text-kelly-navy/90">Action:</span> {actionHint}
      </p>
      {metric.note ? (
        <p className={cn("mt-0.5 line-clamp-2 text-kelly-text/50", compact ? "text-[9px]" : "text-[11px]")}>
          {metric.note}
        </p>
      ) : null}
    </div>
  );
}
