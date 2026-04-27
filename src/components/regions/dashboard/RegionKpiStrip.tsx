import type { RegionDashboardKpiItem } from "@/lib/campaign-engine/regions/types";
import { CountyKpiCard, CountySectionHeader } from "@/components/county/dashboard";
import { cn } from "@/lib/utils";

type Props = {
  overline?: string;
  title?: string;
  description?: string;
  items: RegionDashboardKpiItem[];
  className?: string;
  /** Compact cards for high density. */
  compact?: boolean;
};

export function RegionKpiStrip({
  overline = "Executive strip",
  title = "Regional KPIs",
  description,
  items,
  className,
  compact = true,
}: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div
        className={cn(
          "mt-4",
          compact
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5"
            : "flex flex-wrap gap-3",
        )}
      >
        {items.map((it) => (
          <CountyKpiCard key={it.label} label={it.label} metric={it.metric} actionHint={it.actionHint} compact={compact} />
        ))}
      </div>
    </section>
  );
}
