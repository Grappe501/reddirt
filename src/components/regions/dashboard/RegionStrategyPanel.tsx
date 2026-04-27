import type { RegionStrategyBlock } from "@/lib/campaign-engine/regions/types";
import { CountySectionHeader, countyDashboardCardClass } from "@/components/county/dashboard";
import { cn } from "@/lib/utils";

const field = "text-[10px] font-bold uppercase tracking-wider text-kelly-text/45";

type Props = {
  strategy: RegionStrategyBlock;
  className?: string;
};

export function RegionStrategyPanel({ strategy, className }: Props) {
  return (
    <section className={className}>
      <CountySectionHeader
        overline={strategy.overline ?? "Strategy"}
        title={strategy.title ?? "What this region moves"}
        description={
          strategy.panelDescription ??
          "Plain-language: numbers roll up; tactics sharpen in county and town views."
        }
      />
      <div className={cn(countyDashboardCardClass, "mt-3 space-y-3 p-4")}>
        <div>
          <p className={field}>What this means</p>
          <p className="mt-1 text-sm leading-relaxed text-kelly-text/88">{strategy.whatThisMeans}</p>
        </div>
        <div>
          <p className={field}>Where to press</p>
          <p className="mt-1 text-sm leading-relaxed text-kelly-text/88">{strategy.whereToPress}</p>
        </div>
        <div>
          <p className={field}>Where to backfill</p>
          <p className="mt-1 text-sm leading-relaxed text-kelly-text/88">{strategy.whereToBackfill}</p>
        </div>
        <div>
          <p className={field}>What to do next</p>
          <p className="mt-1 rounded-md border border-kelly-navy/10 bg-kelly-navy/[0.04] px-3 py-2 text-sm font-medium text-kelly-navy/95">
            {strategy.whatToDoNext}
          </p>
        </div>
      </div>
    </section>
  );
}
