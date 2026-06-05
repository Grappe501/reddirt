"use client";

import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { NAV_PROFILE_LABELS, resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";
import { THREE_LANE_NAV, type ThreeLaneId } from "@/lib/intelligence/v4/threeLaneNav";

const LANES: ThreeLaneId[] = ["phase_a", "kelly", "clerks", "staff"];

export function ThreeLaneNavLegend({ compact }: { compact?: boolean }) {
  const profile = resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());

  return (
    <div
      className={`rounded-xl border border-kelly-text/10 bg-white ${compact ? "mb-4 p-3 text-[10px]" : "mb-6 p-4 text-xs"}`}
    >
      <p className="font-bold uppercase tracking-wider text-kelly-navy">Three-lane navigation · Phase D</p>
      <p className="mt-1 text-kelly-muted">{NAV_PROFILE_LABELS[profile]}</p>
      <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-2" : "md:grid-cols-4"}`}>
        {LANES.map((lane) => {
          const meta = THREE_LANE_NAV[lane];
          if (profile === "CANDIDATE" && lane === "staff") return null;
          return (
            <div key={lane} className={`rounded-lg border p-2 ${meta.chipClass}`}>
              <p className="font-bold">{meta.shortLabel}</p>
              {!compact ? <p className="mt-1 leading-snug opacity-90">{meta.description}</p> : null}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-teal-800">
        Teal highlight = new route this deploy — fades after first visit.
      </p>
    </div>
  );
}
