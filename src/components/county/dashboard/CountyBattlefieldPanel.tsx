"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CountyDashboardVisualLabels } from "@/lib/campaign-engine/county-dashboards/types";

const tabs = [
  { id: "county", label: "County map" },
  { id: "city", label: "City map" },
  { id: "precinct", label: "Precinct map" },
  { id: "teams", label: "Power Team density" },
  { id: "gaps", label: "Coverage gaps" },
  { id: "growth", label: "Growth" },
] as const;

export type CountyBattlefieldPanelProps = {
  labels: CountyDashboardVisualLabels;
  /** Shown in county placeholder SVG and tab copy. */
  countyNameHint?: string;
  /** Shown in city grid placeholder. */
  primaryCityLabel?: string;
};

export function CountyBattlefieldPanel({
  labels,
  countyNameHint = "County",
  primaryCityLabel = "Largest city",
}: CountyBattlefieldPanelProps) {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("county");

  const body: Record<string, { title: string; blurb: string; svg: ReactNode }> = {
    county: {
      title: labels.countyMap,
      blurb: "Placeholder: state + county highlight. No tile server — plug GeoJSON or static SVG when available.",
      svg: <CountyOutlinePlaceholder countyName={countyNameHint} />,
    },
    city: {
      title: labels.cityMap,
      blurb: "Placeholder: municipal anchors. Future: bivariate city boundary + team dots.",
      svg: <GridCityPlaceholder primaryCity={primaryCityLabel} />,
    },
    precinct: {
      title: labels.precinctMap,
      blurb: "List-first until precinct geometry. Future choropleth uses aggregates only in public view.",
      svg: <PrecinctBlocksPlaceholder />,
    },
    teams: {
      title: labels.teamDensity,
      blurb: "Dot-density / heat bucket — demo grid. Never shows household or voter points on public pages.",
      svg: <HeatDotsPlaceholder />,
    },
    gaps: {
      title: labels.coverageGaps,
      blurb: "Where modeled coverage is below target — drives organizer assignments, not a shame score.",
      svg: <GapStripesPlaceholder />,
    },
    growth: {
      title: labels.growth,
      blurb: "Sparkline area — time series will bind to the same rollups you see in the charts below.",
      svg: <GrowthAreaPlaceholder />,
    },
  };

  const cur = body[active];

  return (
    <div>
      <div className="border-b border-kelly-navy/15 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-slate/75">Situational awareness</p>
        <h2 className="font-heading text-xl font-bold tracking-tight text-kelly-navy md:text-2xl">Main visual battlefield</h2>
        <p className="mt-1.5 text-sm text-kelly-text/70">
          Map slots are non-destructive placeholders — swap in tiles later without re-layout.
        </p>
      </div>
      <div className="mt-3">
        <div>
          <div className="flex flex-wrap gap-1 border-b border-kelly-text/10 pb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                  active === t.id
                    ? "bg-kelly-navy text-white"
                    : "bg-kelly-text/5 text-kelly-text/70 hover:bg-kelly-text/10",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-kelly-text/10 bg-gradient-to-br from-kelly-navy/5 to-kelly-page p-4">
            <p className="text-xs font-bold text-kelly-navy/90">{cur.title}</p>
            <p className="mt-1 text-sm text-kelly-text/75">{cur.blurb}</p>
            <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-kelly-slate/30 bg-kelly-page/80 p-3">
              {cur.svg}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CountyOutlinePlaceholder({ countyName }: { countyName: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full max-h-[220px] w-full" aria-hidden>
      <rect width="320" height="200" className="fill-kelly-slate/5" />
      <path
        d="M 40 100 L 80 40 L 200 20 L 280 60 L 300 120 L 240 180 L 100 190 Z"
        className="fill-kelly-navy/15 stroke-kelly-navy/40"
        strokeWidth="2"
      />
      <circle cx="170" cy="100" r="6" className="fill-amber-500/90" />
      <text x="180" y="95" className="fill-kelly-navy/80 text-[10px] font-bold">
        {countyName}
      </text>
    </svg>
  );
}

function GridCityPlaceholder({ primaryCity }: { primaryCity: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full max-h-[220px] w-full" aria-hidden>
      <rect width="320" height="200" className="fill-kelly-slate/5" />
      <g className="stroke-kelly-text/15" strokeWidth="0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={"v" + i} x1={40 + i * 32} y1="20" x2={40 + i * 32} y2="180" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={"h" + i} x1="20" y1={30 + i * 28} x2="300" y2={30 + i * 28} />
        ))}
      </g>
      <circle cx="200" cy="80" r="8" className="fill-kelly-slate/40" />
      <text x="130" y="100" className="fill-kelly-navy/90 text-xs font-bold">
        {primaryCity}
      </text>
    </svg>
  );
}

function PrecinctBlocksPlaceholder() {
  return (
    <svg viewBox="0 0 320 200" className="h-full max-h-[220px] w-full" aria-hidden>
      <rect width="320" height="200" className="fill-kelly-slate/5" />
      {["#94a3b8", "#64748b", "#cbd5e1", "#334155", "#94a3b8", "#64748b"].map((c, i) => (
        <rect
          key={i}
          x={30 + (i % 3) * 90}
          y={40 + Math.floor(i / 3) * 70}
          width="80"
          height="55"
          fill={c}
          opacity="0.35"
          rx="4"
        />
      ))}
    </svg>
  );
}

function HeatDotsPlaceholder() {
  const seeds = [12, 44, 88, 120, 160, 200, 90, 150, 70, 30, 250, 180];
  return (
    <svg viewBox="0 0 320 200" className="h-full max-h-[220px] w-full" aria-hidden>
      <rect width="320" height="200" className="fill-kelly-slate/5" />
      {seeds.map((x, i) => (
        <circle key={i} cx={x} cy={30 + (i * 13) % 150} r={4 + (i % 3)} className="fill-kelly-slate/50" />
      ))}
    </svg>
  );
}

function GapStripesPlaceholder() {
  return (
    <svg viewBox="0 0 320 200" className="h-full max-h-[220px] w-full" aria-hidden>
      <rect width="320" height="200" className="fill-amber-50/50" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={-40 + i * 36} y="0" width="20" height="200" className="fill-amber-200/40" />
      ))}
    </svg>
  );
}

function GrowthAreaPlaceholder() {
  return (
    <svg viewBox="0 0 320 200" className="h-full max-h-[220px] w-full" aria-hidden>
      <rect width="320" height="200" className="fill-kelly-slate/5" />
      <path
        d="M 20 160 L 60 120 L 100 130 L 140 80 L 180 100 L 220 50 L 260 40 L 300 20 L 300 200 L 20 200 Z"
        className="fill-kelly-slate/20 stroke-kelly-navy/30"
        strokeWidth="2"
      />
    </svg>
  );
}
