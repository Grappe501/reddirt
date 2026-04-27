import Link from "next/link";
import type { RegionNextCountyBuildItem } from "@/lib/campaign-engine/regions/types";
import { CountySectionHeader } from "@/components/county/dashboard";
import { countyDashboardCardClass } from "@/components/county/dashboard";
import { cn, focusRing, tapMinSmCompact } from "@/lib/utils";

type Props = {
  overline: string;
  title: string;
  description: string;
  items: RegionNextCountyBuildItem[];
  className?: string;
};

/**
 * Roadmap: county intelligence v2 routes not live yet; county command is the safe public anchor.
 */
export function RegionNextCountiesToBuildPanel({ overline, title, description, items, className }: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.id}
            className={cn(
              countyDashboardCardClass,
              "border-l-4 border-dashed border-kelly-slate/35 bg-kelly-text/[0.02] p-3 sm:p-4",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-heading text-sm font-bold text-kelly-navy md:text-base">{it.displayName}</p>
              <span className="rounded-full border border-amber-200/90 bg-amber-50/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-950">
                Planned
              </span>
            </div>
            <p className="mt-1 text-xs font-bold text-kelly-slate/90">{it.targetLabel}</p>
            <p className="mt-1 text-sm leading-snug text-kelly-text/70">{it.note}</p>
            <p className="mt-2 text-xs text-kelly-text/65">Today: public county command and aggregate goals only (no v2 yet).</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
              <Link
                href={it.hrefCommand}
                className={cn(
                  focusRing,
                  tapMinSmCompact,
                  "inline-flex rounded-sm text-sm font-bold text-kelly-navy underline decoration-kelly-navy/35 hover:text-kelly-blue sm:min-h-0",
                )}
              >
                County command →
              </Link>
              {it.hrefOrganizingIntelligence ? (
                <Link
                  href={it.hrefOrganizingIntelligence}
                  className={cn(
                    focusRing,
                    tapMinSmCompact,
                    "inline-flex rounded-sm text-sm font-semibold text-kelly-navy underline decoration-dotted hover:text-kelly-blue sm:min-h-0",
                  )}
                >
                  OIS county placeholder →
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
