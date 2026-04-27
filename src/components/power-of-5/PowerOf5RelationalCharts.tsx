import type { PowerOf5RelationalChartBundle } from "@/lib/campaign-engine/county-dashboards/types";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-kelly-text/80">
        <span>{label}</span>
        <span className="font-mono text-kelly-navy/90">{value.toLocaleString("en-US")}</span>
      </div>
      <div className="mt-0.5 h-2.5 w-full overflow-hidden rounded-full bg-kelly-text/10">
        <div className="h-full rounded-full bg-kelly-slate/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ColumnBars({ title, points, max }: { title: string; points: { label: string; value: number }[]; max: number }) {
  return (
    <div className={countyDashboardCardClass}>
      <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">{title}</p>
      <div className="mt-3 flex h-40 min-h-[10rem] items-end gap-1 sm:h-36 sm:min-h-0">
        {points.map((p) => {
          const h = max > 0 ? (p.value / max) * 100 : 0;
          return (
            <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center justify-end">
              <div
                className="w-full max-w-[36px] rounded-t-md bg-kelly-navy/55"
                style={{ height: `${Math.max(8, h)}%` }}
                title={`${p.label}: ${p.value}`}
                role="presentation"
              />
              <span className="mt-1.5 line-clamp-2 text-center text-[10px] font-bold leading-tight text-kelly-text/70 sm:text-[11px]">
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  data: PowerOf5RelationalChartBundle;
  className?: string;
  overline?: string;
  title?: string;
  description?: string;
};

/**
 * Shared relational chart row — invite/activate funnel, conversation cadence, follow-up buckets.
 * Consumes the same `PowerOf5RelationalChartBundle` shape as county v2 (optional on chart bundle).
 */
export function PowerOf5RelationalCharts({
  data,
  className,
  overline = "Relational signals",
  title = "Power of 5 — charts (aggregate demo)",
  description = "Bars use the same demo numerators as the KPI strip — not individual voter or household records.",
}: Props) {
  const convMax = Math.max(...data.conversationsTrend.map((x) => x.value), 1);
  const funnelMax = Math.max(...data.inviteActivateFunnel.map((x) => x.value), 1);
  const follow = data.followUpCadence;
  const followMax = follow && follow.length ? Math.max(...follow.map((x) => x.value), 1) : 1;

  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ColumnBars title="Conversations trend (demo weeks)" points={data.conversationsTrend} max={convMax} />
        <ColumnBars title="Invite → activate funnel (demo)" points={data.inviteActivateFunnel} max={funnelMax} />
        {follow && follow.length ? (
          <div className={countyDashboardCardClass}>
            <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">Follow-up cadence (demo buckets)</p>
            <div className="mt-3 space-y-2">
              {follow.map((r) => (
                <BarRow key={r.label} label={r.label} value={r.value} max={followMax} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
