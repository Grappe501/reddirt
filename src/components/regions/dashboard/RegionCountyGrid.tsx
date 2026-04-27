import Link from "next/link";
import type { RegionDashboardCountyCard } from "@/lib/campaign-engine/regions/types";
import { CountySectionHeader } from "@/components/county/dashboard";
import { CountySourceBadge } from "@/components/county/dashboard";
import { countyDashboardCardClass } from "@/components/county/dashboard";
import { cn, focusRing, tapMinSmCompact } from "@/lib/utils";

type Props = {
  overline?: string;
  title?: string;
  description?: string;
  counties: RegionDashboardCountyCard[];
  className?: string;
};

/**
 * In-region county tiles — drill to `/counties/[slug]`, optional v2/briefing link.
 */
export function RegionCountyGrid({
  overline = "Drill down",
  title = "Counties in this region",
  description = "Path: region → county command; county dashboards when published. All per-county team/coverage figures below are demo/seed until hydrated.",
  counties,
  className,
}: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counties.map((c) => (
          <div
            key={c.fips + c.countySlug}
            className={cn(countyDashboardCardClass, "border-l-4 border-l-kelly-navy/30 p-3 sm:p-4")}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">{c.displayName}</p>
              {c.isAnchorCounty ? (
                <span className="rounded-full border border-kelly-navy/30 bg-kelly-navy/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-kelly-navy">
                  Anchor
                </span>
              ) : null}
              {c.isPlanningScaffold ? (
                <span className="rounded-full border border-amber-200/80 bg-amber-50/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-950">
                  Demo scaffold
                </span>
              ) : null}
              {c.isPrimaryNwa ? (
                <span className="rounded-full border border-kelly-slate/25 bg-kelly-slate/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-kelly-navy/90">
                  Primary
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-kelly-text/40">FIPS {c.fips}</p>
            <ul className="mt-2 space-y-1 text-sm text-kelly-text/85">
              <li>
                Teams (demo): {c.teamScaleDemo.value}{" "}
                <CountySourceBadge source={c.teamScaleDemo.source} note={c.teamScaleDemo.note} />
              </li>
              <li>
                Coverage (demo): {c.coverageDemo.value}%{" "}
                <CountySourceBadge source={c.coverageDemo.source} note={c.coverageDemo.note} />
              </li>
            </ul>
            {c.cardNote ? <p className="mt-2 text-xs leading-snug text-kelly-text/60">{c.cardNote}</p> : null}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={c.href}
                className={cn(
                  focusRing,
                  tapMinSmCompact,
                  "inline-flex rounded-lg bg-kelly-navy px-4 text-xs font-bold text-white hover:bg-kelly-navy/90 sm:px-3 sm:py-1.5",
                )}
              >
                County command →
              </Link>
              {c.countySlug && c.countySlug !== "—" ? (
                <Link
                  href={`/organizing-intelligence/counties/${c.countySlug}`}
                  className={cn(
                    focusRing,
                    tapMinSmCompact,
                    "inline-flex rounded-lg border border-kelly-navy/20 bg-kelly-page px-4 text-xs font-bold text-kelly-navy hover:border-kelly-navy/35 sm:px-3 sm:py-1.5",
                  )}
                >
                  OIS county →
                </Link>
              ) : null}
              {c.secondaryHref ? (
                <Link
                  href={c.secondaryHref}
                  className={cn(
                    focusRing,
                    tapMinSmCompact,
                    "inline-flex rounded-sm text-xs font-semibold text-kelly-navy underline decoration-kelly-navy/35 sm:min-h-0 sm:px-0",
                  )}
                >
                  {c.secondaryLabel ?? "County dashboard"}
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
