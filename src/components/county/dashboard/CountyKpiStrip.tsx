import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import { CountyKpiCard } from "./countyDashboardFormat";
import { CountySectionHeader } from "./CountySectionHeader";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  overline?: string;
  description?: string;
  /** Stable id for `section`/`h2` linkage (one per page section). */
  sectionHeadingId?: string;
  items: CountyDashboardKpiItem[];
  className?: string;
  /** Smaller cards + multi-column grid for “command” density. */
  compact?: boolean;
};

export function CountyKpiStrip({ title, overline, description, sectionHeadingId, items, className, compact }: Props) {
  return (
    <section
      className={className}
      {...(sectionHeadingId
        ? { "aria-labelledby": sectionHeadingId }
        : {
            "aria-label": [overline, title].filter(Boolean).join(" — ") || "County KPI metrics",
          })}
    >
      <CountySectionHeader titleId={sectionHeadingId} overline={overline} title={title} description={description} />
      <div
        className={cn(
          "mt-3 gap-2",
          compact
            ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5"
            : "flex flex-wrap gap-3",
        )}
      >
        {items.map((it) => (
          <CountyKpiCard
            key={it.metricKey ?? it.label}
            label={it.label}
            metric={it.metric}
            actionHint={it.actionHint}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}
