"use client";

import { useMemo, useState } from "react";

import type { ElectionPlanCounty } from "@/lib/election-plan/types";
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
          const open = expanded === c.county;
          return (
            <div key={c.county} className="ep-card ep-county-card">
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
                  <span className={guardrailClass(c.guardrailStatus)}>{c.guardrailStatus}</span>
                  <span>{c.coveragePct}% covered</span>
                </div>
              </button>

              {open ? (
                <div className="mt-4 space-y-2 border-t border-[var(--ep-border)] pt-3 text-sm">
                  <Row label="VCI" value={formatVotes(c.vci)} />
                  <Row label="Primary mission" value={c.primaryMission} />
                  <Row label="Secondary" value={c.secondaryMission} />
                  <Row label="Lane 2 @ 50%" value={formatVotes(c.lane2Recovery50)} />
                  <Row label="Registration goal" value={formatVotes(c.registrationGoal)} />
                  <Row label="GOP conversion" value={formatVotes(c.gopConversionPotential)} />
                  <Row label="Coverage" value={`${c.coverageCompleted}/${c.coveragePlanned}`} />
                  <p className="mt-2 text-xs font-medium text-[var(--ep-navy)]">{c.recommendedAction}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--ep-navy-muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
