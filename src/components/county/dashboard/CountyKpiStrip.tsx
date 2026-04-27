import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import { CountyKpiCard } from "./countyDashboardFormat";
import { CountySectionHeader } from "./CountySectionHeader";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  overline?: string;
  description?: string;
  items: CountyDashboardKpiItem[];
  className?: string;
  /** Smaller cards + multi-column grid for “command” density. */
  compact?: boolean;
};

export function CountyKpiStrip({ title, overline, description, items, className, compact }: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
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
            key={it.label}
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
