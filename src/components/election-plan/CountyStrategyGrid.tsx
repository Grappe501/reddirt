"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ElectionPlanCounty } from "@/lib/election-plan/types";
import { countyWorkbenchHref } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

type Props = {
  counties: ElectionPlanCounty[];
};

function tierClass(tier: string) {
  if (tier === "A") return "ep-tier-a";
  if (tier === "B") return "ep-tier-b";
  if (tier === "C") return "ep-tier-c";
  return "ep-tier-d";
}

function guardrailClass(status: string) {
  if (status === "violation") return "ep-guardrail-violation";
  if (status === "warning") return "ep-guardrail-warning";
  return "ep-guardrail-ok";
}

export function CountyStrategyGrid({ counties }: Props) {
  const [tierFilter, setTierFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (tierFilter === "all") return counties;
    return counties.filter((c) => c.tier === tierFilter);
  }, [counties, tierFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all", "A", "B", "C", "D"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTierFilter(t)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              tierFilter === t
                ? "bg-[var(--ep-navy)] text-white"
                : "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] hover:bg-[var(--ep-gold-soft)]",
            )}
          >
            {t === "all" ? "All 75" : `Tier ${t}`}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const href = countyWorkbenchHref(c.county, c.slug);
          return (
            <Link
              key={c.county}
              href={href}
              className="ep-card ep-county-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-heading text-lg font-bold">{c.county}</div>
                  <div className="text-xs text-[var(--ep-navy-muted)]">{c.strategicRole}</div>
                </div>
                <div className="text-right">
                  <span className={tierClass(c.tier)}>Tier {c.tier}</span>
                  <div className="text-xs text-[var(--ep-navy-muted)]">VCI #{c.vciRank}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={guardrailClass(c.guardrailStatus)}>{c.guardrailStatus}</span>
                <span>{c.coveragePct}% covered</span>
              </div>
              <p className="mt-3 line-clamp-2 text-xs text-[var(--ep-navy-muted)]">{c.recommendedAction}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
                Open county workbench →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
