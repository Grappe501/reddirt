import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import { CountyKpiCard } from "@/components/county/dashboard/countyDashboardFormat";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { PowerOf5PipelineVisualization } from "@/components/power-of-5/PowerOf5PipelineVisualization";
import type { PowerOf5OrganizingPipelineId } from "@/lib/power-of-5/pipelines";
import { cn } from "@/lib/utils";

type Props = {
  overline?: string;
  title?: string;
  /** Impact on roll-ups — public-safe framing. */
  impactExplanation?: string;
  intro?: string;
  items?: CountyDashboardKpiItem[];
  className?: string;
  kpiCompact?: boolean;
  showOrganizingPipelines?: boolean;
  activePipelineId?: PowerOf5OrganizingPipelineId;
  pipelineVariant?: "compact" | "full";
};

/**
 * Shared Power of 5 section: pipeline ladder + optional KPI grid.
 * Used by state OIS, region dashboards, and county v2 so ladder + card rhythm stay aligned.
 */
export function PowerOf5DashboardPanel({
  overline = "Relational engine",
  title = "Power of 5",
  impactExplanation,
  intro,
  items = [],
  className,
  kpiCompact = true,
  showOrganizingPipelines = true,
  activePipelineId,
  pipelineVariant = "compact",
}: Props) {
  const hasKpis = items.length > 0;

  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={undefined} />
      {impactExplanation ? (
        <p
          className={cn(
            "mt-2 rounded-lg border border-kelly-success/30 bg-kelly-success/[0.07] px-3 py-2.5 text-sm font-medium leading-relaxed text-kelly-text/90",
          )}
        >
          {impactExplanation}
        </p>
      ) : null}
      {intro ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/80">{intro}</p> : null}
      {showOrganizingPipelines ? (
        <PowerOf5PipelineVisualization className="mt-4" variant={pipelineVariant} activeId={activePipelineId} />
      ) : null}
      {hasKpis ? (
        <div
          className={cn(
            "mt-3 grid gap-2",
            kpiCompact ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {items.map((it) => (
            <CountyKpiCard
              key={it.label}
              label={it.label}
              metric={it.metric}
              actionHint={it.actionHint}
              compact={kpiCompact}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
