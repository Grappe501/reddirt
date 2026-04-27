import Link from "next/link";
import type { RegionDashboardHighlightCard } from "@/lib/campaign-engine/regions/types";
import { CountySourceBadge, countyDashboardCardClass } from "@/components/county/dashboard";
import { CountySectionHeader } from "@/components/county/dashboard";
import { cn, focusRing, tapMinSmCompact } from "@/lib/utils";

type Props = {
  overline: string;
  title: string;
  description: string;
  cards: RegionDashboardHighlightCard[];
  className?: string;
};

/**
 * 2–3 card comparison row (Benton / Washington + optional Pope OIS sample).
 * Values are demo/seed; never PII.
 */
export function RegionPrimaryComparisonCards({ overline, title, description, cards, className }: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.fips + c.countySlug}
            className={cn(
              countyDashboardCardClass,
              "border-t-2 border-t-kelly-navy/30 p-3 sm:p-4",
            )}
          >
            <p className="text-xs font-extrabold uppercase tracking-widest text-kelly-slate/80">{c.roleLabel}</p>
            <p className="mt-0.5 font-heading text-base font-bold text-kelly-navy md:text-lg">{c.displayName}</p>
            <p className="mt-0.5 font-mono text-[10px] text-kelly-text/45">FIPS {c.fips}</p>
            <ul className="mt-2 space-y-1 text-sm text-kelly-text/85">
              <li>
                Teams (demo): {c.teamScaleDemo.value} <CountySourceBadge source={c.teamScaleDemo.source} note={c.teamScaleDemo.note} />
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
              {c.countySlug ? (
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
