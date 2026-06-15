"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ElectionPlanCounty } from "@/lib/election-plan/types";
import {
  COUNTY_COVERAGE_EXPLAINER,
  countyPlaybookHref,
  countyPlaybookOpensInNewTab,
} from "@/lib/election-plan/location-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
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
  const [expanded, setExpanded] = useState<string | null>(null);

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
          const href = countyPlaybookHref(c.county, c.slug);
          const external = countyPlaybookOpensInNewTab(c.county);
          const open = expanded === c.county;
          return (
            <div key={c.county} className="ep-card ep-county-card flex flex-col">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpanded(open ? null : c.county)}
                aria-expanded={open}
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
                  <span className={guardrailClass(c.guardrailStatus)} title="Visit cadence guardrail">
                    {c.guardrailStatus}
                  </span>
                  <span title={COUNTY_COVERAGE_EXPLAINER}>
                    Visits {c.coverageCompleted}/{c.coveragePlanned}
                  </span>
                </div>
              </button>

              {open ? (
                <div className="mt-3 space-y-2 border-t border-[var(--ep-border)] pt-3 text-sm">
                  <Row label="VCI" value={formatVotes(c.vci)} />
                  <Row label="Primary mission" value={c.primaryMission} />
                  <Row label="Lane 2 @ 50%" value={formatVotes(c.lane2Recovery50)} />
                  <Row label="Registration goal" value={formatVotes(c.registrationGoal)} />
                  <p className="text-xs text-[var(--ep-navy-muted)]">{c.recommendedAction}</p>
                </div>
              ) : null}

              <div className="mt-auto border-t border-[var(--ep-border)] pt-3">
                {external ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ep-chapter-link block text-center text-sm font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open county playbook ↗
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="ep-chapter-link block text-center text-sm font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open county playbook →
                  </Link>
                )}
                <p className="mt-1 text-center text-[10px] text-[var(--ep-navy-muted)]">
                  Events · calendar · leaders · tasks · goals
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-[var(--ep-navy-muted)]">{label}</span>
      <span className="text-right font-medium text-[var(--ep-navy)]">{value}</span>
    </div>
  );
}
