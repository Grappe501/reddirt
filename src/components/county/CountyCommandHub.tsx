"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ARKANSAS_COMMAND_REGIONS,
  getRegistryCountyBySlug,
  type ArCommandRegionId,
} from "@/lib/county/arkansas-county-registry";
import {
  getCountyIntelligenceEntryForSlug,
  type CountyDashboardTier,
} from "@/lib/county/county-intelligence-catalog";
import type { CountyRosterListItem } from "@/lib/county/get-county-command-data";
import { cn } from "@/lib/utils";

type Props = {
  /** All 75 rows (merged) */
  counties: CountyRosterListItem[];
  /** "public" = /counties/[slug] only; "admin" = add CMS edit + status */
  mode?: "public" | "admin";
  className?: string;
};

function regionAnchorId(region: ArCommandRegionId): string {
  return `county-region-${region}`;
}

type RegionBuckets = ReadonlyMap<ArCommandRegionId, CountyRosterListItem[]>;

type TierFilter = "all" | CountyDashboardTier;

function publicCountyPlanningCopy(tier: CountyDashboardTier): {
  badge: string;
  briefing: string;
  community: string;
  next: string;
} {
  switch (tier) {
    case "prototype":
      return {
        badge: "Sample briefing",
        briefing: "A published example voters can explore",
        community: "Kelly’s team labels what’s illustrative so neighbors know what they’re seeing.",
        next: "Open the sample briefing or jump to your county page.",
      };
    case "next_build":
      return {
        badge: "Coming next",
        briefing: "County briefing in development",
        community: "Northwest Arkansas counties are next for fuller public pages.",
        next: "Start with the county overview—more depth will roll out over time.",
      };
    default:
      return {
        badge: "County page",
        briefing: "Overview and trusted links",
        community: "Working with communities across Arkansas as local pages deepen.",
        next: "Meet your county page and read Kelly’s statewide priorities.",
      };
  }
}

function bucketByRegion(list: CountyRosterListItem[]): RegionBuckets {
  const m = new Map<ArCommandRegionId, CountyRosterListItem[]>();
  for (const r of ARKANSAS_COMMAND_REGIONS) m.set(r.id, []);
  for (const c of list) {
    const reg = getRegistryCountyBySlug(c.slug);
    const rid = reg?.regionId ?? "central";
    m.get(rid)?.push(c);
  }
  for (const [_k, arr] of m) {
    arr.sort((a, b) => a.fips.localeCompare(b.fips));
  }
  return m;
}

export function CountyCommandHub({ counties, mode = "public", className }: Props) {
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");

  const searchFiltered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    if (!nq) return counties;
    return counties.filter(
      (c) =>
        c.displayName.toLowerCase().includes(nq) ||
        c.slug.replace(/-/g, " ").includes(nq) ||
        (c.regionLabel?.toLowerCase().includes(nq) ?? false) ||
        c.fips.includes(nq),
    );
  }, [counties, q]);

  const filtered = useMemo(() => {
    if (tierFilter === "all") return searchFiltered;
    return searchFiltered.filter((c) => {
      const entry = getCountyIntelligenceEntryForSlug(c.slug);
      return entry?.dashboardTier === tierFilter;
    });
  }, [searchFiltered, tierFilter]);

  const byRegion = useMemo(() => bucketByRegion(filtered), [filtered]);

  return (
    <div className={cn("space-y-10", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <label htmlFor="county-cmd-search" className="block font-body text-xs font-bold uppercase tracking-[0.18em] text-kelly-navy/80">
            Search all 75 counties
          </label>
          <input
            id="county-cmd-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="County name, region, or FIPS…"
            className="mt-2 w-full rounded-btn border border-kelly-text/15 bg-white px-4 py-2.5 font-body text-kelly-text shadow-sm placeholder:text-kelly-text/45 focus:border-kelly-navy/40 focus:outline-none focus:ring-2 focus:ring-kelly-gold/30"
            autoComplete="off"
          />
        </div>
        {mode === "public" ? (
          <div className="w-full lg:max-w-xl">
            <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-kelly-navy/80">
              {mode === "public" ? "County briefing status" : "Dashboard tier"}
            </p>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="group"
              aria-label={mode === "public" ? "Filter by briefing status" : "Filter by dashboard tier"}
            >
              {(
                [
                  { id: "all" as const, label: "All counties", publicLabel: "All counties" },
                  { id: "prototype" as const, label: "Prototype", publicLabel: "Sample briefing" },
                  { id: "next_build" as const, label: "Next build", publicLabel: "Coming next" },
                  { id: "command_scaffold" as const, label: "Standard", publicLabel: "County pages" },
                ] satisfies { id: TierFilter; label: string; publicLabel: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTierFilter(opt.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/40",
                    tierFilter === opt.id
                      ? "border-kelly-navy bg-kelly-navy text-white"
                      : "border-kelly-text/20 bg-white text-kelly-text/80 hover:border-kelly-navy/30",
                  )}
                >
                  {mode === "public" ? opt.publicLabel : opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <p className="font-body text-sm text-kelly-text/60 lg:text-right">
          Showing <strong className="text-kelly-text">{filtered.length}</strong> of {counties.length}
        </p>
      </div>

      <div>
        <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/75">Jump to region</p>
        <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
          {ARKANSAS_COMMAND_REGIONS.map((r) => (
            <a
              key={r.id}
              href={`#${regionAnchorId(r.id)}`}
              className="inline-flex min-h-[44px] min-w-[min(100%,12rem)] flex-1 items-center justify-center rounded-btn border border-kelly-navy/20 bg-kelly-navy/[0.06] px-4 py-3 text-center font-heading text-sm font-bold text-kelly-navy transition hover:border-kelly-gold/50 hover:bg-kelly-gold/15 focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/40 sm:min-w-[10.5rem] sm:text-base"
            >
              {r.shortLabel}
            </a>
          ))}
        </div>
        <p className="mt-2 max-w-3xl font-body text-xs text-kelly-text/55">
          Large buttons scroll to a <strong>region</strong> section.
          {mode === "public" ? (
            <>
              {" "}
              Each card shows <strong>region</strong>, <strong>briefing status</strong>, and a friendly <strong>next step</strong>—written for
              voters, not internal planners.
            </>
          ) : (
            <>
              {" "}
              Each county card shows <strong>region</strong>, <strong>dashboard status</strong>, <strong>organizing status</strong>, and a suggested{" "}
              <strong>next action</strong> — without building 75 bespoke dashboards.
            </>
          )}
        </p>
      </div>

      <div className="space-y-12">
        {ARKANSAS_COMMAND_REGIONS.map((r) => {
          const list = byRegion.get(r.id) ?? [];
          if (list.length === 0) return null;
          return (
            <section
              key={r.id}
              id={regionAnchorId(r.id)}
              className="scroll-mt-28 border-t border-kelly-text/10 pt-8 first:scroll-mt-24 first:border-t-0 first:pt-0"
            >
              <div className="mb-4">
                <h2 className="font-heading text-lg font-bold text-kelly-text sm:text-xl">{r.label}</h2>
                <p className="mt-1 font-body text-sm text-kelly-text/65">
                  {list.length} count{list.length === 1 ? "y" : "ies"}
                </p>
              </div>
              {mode === "public" ? (
                <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3" role="list">
                  {list.map((c) => {
                    const shortName = c.displayName.replace(/\s+County$/i, "");
                    const entry = getCountyIntelligenceEntryForSlug(c.slug);
                    if (!entry) return null;
                    const tier = entry.dashboardTier;
                    const pub = publicCountyPlanningCopy(tier);
                    const tierBadge = pub.badge;
                    return (
                      <li
                        key={c.slug}
                        className={cn(
                          "flex flex-col rounded-2xl border bg-white/90 p-4 shadow-sm transition",
                          tier === "prototype" &&
                            "ring-2 ring-kelly-gold/55 border-kelly-gold/35 bg-gradient-to-br from-kelly-gold/[0.12] to-white",
                          tier === "next_build" && "border-l-[5px] border-l-amber-500/90 border-kelly-text/12",
                          tier === "command_scaffold" && "border-kelly-text/12",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-heading text-base font-bold text-kelly-navy">{shortName}</p>
                            <p className="font-mono text-[10px] text-kelly-text/45">FIPS {c.fips}</p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
                              tier === "prototype" && "bg-kelly-navy text-kelly-gold",
                              tier === "next_build" && "bg-amber-100 text-amber-950",
                              tier === "command_scaffold" && "bg-kelly-text/10 text-kelly-text/70",
                            )}
                          >
                            {tierBadge}
                          </span>
                        </div>
                        <dl className="mt-3 space-y-2 border-t border-kelly-text/10 pt-3 font-body text-xs text-kelly-text/85">
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-kelly-text/50">Region</dt>
                            <dd className="mt-0.5">{entry.regionShortLabel}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-kelly-text/50">Briefing</dt>
                            <dd className="mt-0.5 leading-snug">{pub.briefing}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-kelly-text/50">Community</dt>
                            <dd className="mt-0.5 leading-snug">{pub.community}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-kelly-text/50">Next step</dt>
                            <dd className="mt-0.5 leading-snug">{pub.next}</dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex flex-col gap-2 border-t border-kelly-text/10 pt-3">
                          {c.hasPublicPage ? (
                            <Link
                              href={entry.commandHref}
                              className="inline-flex justify-center rounded-lg bg-kelly-navy px-3 py-2 text-center text-xs font-bold text-white hover:bg-kelly-navy/90"
                            >
                              County page →
                            </Link>
                          ) : (
                            <span
                              className="inline-flex justify-center rounded-lg border border-dashed border-kelly-text/25 px-3 py-2 text-center text-xs font-semibold text-kelly-text/50"
                              title="County public page is in draft"
                            >
                              County page (soon)
                            </span>
                          )}
                          {entry.countyDashboardV2Href ? (
                            <Link
                              href={entry.countyDashboardV2Href}
                              className="inline-flex justify-center rounded-lg border border-kelly-gold/40 bg-kelly-gold/15 px-3 py-2 text-center text-xs font-bold text-kelly-navy hover:bg-kelly-gold/25"
                            >
                              County briefing →
                            </Link>
                          ) : (
                            <Link
                              href="/county-briefings"
                              className="inline-flex justify-center rounded-lg border border-kelly-text/15 bg-kelly-page/80 px-3 py-2 text-center text-xs font-semibold text-kelly-navy hover:border-kelly-navy/25"
                            >
                              County briefings hub →
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0" role="list">
                  {list.map((c) => {
                    const shortName = c.displayName.replace(/\s+County$/i, "");
                    const inDb = !c.id.startsWith("registry:");
                    return (
                      <li
                        key={c.slug}
                        className="flex flex-wrap items-center gap-2 border-b border-kelly-text/[0.06] py-1.5 last:border-b-0 sm:gap-3"
                      >
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
                          <span className="min-w-0 shrink font-body text-sm font-medium text-kelly-text sm:w-32">{shortName}</span>
                          <code className="hidden font-mono text-[10px] text-kelly-text/45 sm:inline">{c.fips}</code>
                          {c.hasPublicPage ? (
                            <Link
                              href={`/counties/${c.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-kelly-navy/25 px-2 py-1 text-xs font-semibold text-kelly-navy hover:bg-kelly-navy/5"
                            >
                              Public
                            </Link>
                          ) : (
                            <span className="text-xs text-kelly-text/40">— public</span>
                          )}
                          {inDb ? (
                            <Link
                              href={`/admin/counties/${c.slug}`}
                              className="rounded-md border border-kelly-text/20 bg-kelly-text/[0.04] px-2 py-1 text-xs font-semibold text-kelly-text hover:border-kelly-navy/30"
                            >
                              CMS
                            </Link>
                          ) : (
                            <span className="text-xs text-amber-800/80" title="Run seed or create County row in Prisma to edit">
                              no DB row
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
