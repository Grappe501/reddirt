import type { CountyDashboardChartBundle } from "@/lib/campaign-engine/county-dashboards/types";
import { PowerOf5RelationalCharts } from "@/components/power-of-5/PowerOf5RelationalCharts";
import { countyDashboardCardClass } from "./countyDashboardClassNames";
import { CountySectionHeader } from "./CountySectionHeader";

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-kelly-text/80">
        <span>{label}</span>
        <span className="font-mono text-kelly-navy/90">{value}</span>
      </div>
      <div className="mt-0.5 h-2.5 w-full overflow-hidden rounded-full bg-kelly-text/10">
        <div className="h-full rounded-full bg-kelly-navy/75" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function LineBars({ title, points, max }: { title: string; points: { label: string; value: number }[]; max: number }) {
  return (
    <div className={countyDashboardCardClass}>
      <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">{title}</p>
      <div className="mt-3 flex h-40 min-h-[10rem] items-end gap-1 sm:h-36 sm:min-h-0">
        {points.map((p) => {
          const h = max > 0 ? (p.value / max) * 100 : 0;
          return (
            <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center justify-end">
              <div
                className="w-full max-w-[28px] rounded-t-md bg-kelly-slate/55"
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
  charts: CountyDashboardChartBundle;
  overline?: string;
  title?: string;
  description?: string;
  className?: string;
};

export function CountyChartPanel({
  charts,
  overline = "Signal board",
  title = "Trends & pipelines",
  description = "All illustrative time series below include demo/seed where noted — no individual voter or household points.",
  className,
}: Props) {
  const ch = charts;
  const chartMax = Math.max(...ch.turnoutTrend.map((x) => x.value), 1);
  const shareMax = Math.max(...ch.voteShareTrend.map((x) => x.value), 1);
  const teamMax = Math.max(...ch.powerTeamGrowth.map((x) => x.value), 1);
  const pipeMax = Math.max(
    ...ch.volunteerPipeline.map((x) => x.value),
    ...ch.candidatePipeline.map((x) => x.value),
    1,
  );
  const issueMax = Math.max(...ch.issueIntensity.map((x) => x.score), 1);

  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      {ch.relational ? (
        <PowerOf5RelationalCharts
          className="mt-4"
          data={ch.relational}
          description="Derived from the same Pope demo relational seed as volunteer pipeline bars — aggregate only."
        />
      ) : null}
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <LineBars title="Turnout trend (aggregate)" points={ch.turnoutTrend} max={chartMax} />
        <LineBars title="Vote share trend (demo + last point may reflect profile)" points={ch.voteShareTrend} max={shareMax} />
        <LineBars title="Power Team growth (demo months)" points={ch.powerTeamGrowth} max={teamMax} />
        <div className={countyDashboardCardClass}>
          <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">Coverage by city (demo split)</p>
          <div className="mt-3 space-y-2">
            {ch.coverageByCity.map((r) => (
              <BarRow key={r.label} label={r.label} value={r.value} max={100} />
            ))}
          </div>
        </div>
        <div className={countyDashboardCardClass}>
          <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">Volunteer pipeline (demo)</p>
          <div className="mt-3 space-y-2">
            {ch.volunteerPipeline.map((r) => (
              <BarRow key={r.label} label={r.label} value={r.value} max={pipeMax} />
            ))}
          </div>
        </div>
        <div className={countyDashboardCardClass}>
          <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">Candidate pipeline (demo)</p>
          <div className="mt-3 space-y-2">
            {ch.candidatePipeline.map((r) => (
              <BarRow key={r.label} label={r.label} value={r.value} max={pipeMax} />
            ))}
          </div>
        </div>
        <div className={countyDashboardCardClass}>
          <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">Issue intensity (planning, demo)</p>
          <div className="mt-3 space-y-2">
            {ch.issueIntensity.map((r) => (
              <BarRow key={r.issue} label={r.issue} value={r.score} max={issueMax} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
