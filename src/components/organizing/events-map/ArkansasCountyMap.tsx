"use client";

import type { KeyboardEvent } from "react";
import { ARKANSAS_COUNTY_SVG_VIEWBOX } from "@/data/kelly-county-visits/arkansas-county-svg-paths";
import type { CountyMapFeature } from "@/components/organizing/events-map/county-map-types";

const FILL: Record<CountyMapFeature["publicState"], string> = {
  visited: "var(--kelly-official-navy)",
  confirmed_upcoming: "var(--kelly-official-gold)",
  tentative_upcoming: "var(--kelly-official-sky)",
  neutral: "#eef1f4",
};

function strokeFor(feature: CountyMapFeature, active: boolean): { stroke: string; width: number; dash?: string } {
  if (active) return { stroke: "var(--kelly-official-gold)", width: 2.6 };
  if (feature.upcomingIndicator === "confirmed") {
    return { stroke: "var(--kelly-official-gold)", width: feature.visited ? 2.4 : 1.4 };
  }
  if (feature.upcomingIndicator === "tentative") {
    return { stroke: "#4f86b8", width: feature.visited ? 2.2 : 1.4, dash: "4 2.5" };
  }
  return { stroke: "#c5ced8", width: 0.8 };
}

export function ArkansasCountyMap({
  features,
  selectedKey,
  onSelect,
  onActivate,
}: {
  features: CountyMapFeature[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onActivate: (feature: CountyMapFeature) => void;
}) {
  const onKeyDown = (event: KeyboardEvent<SVGPathElement>, feature: CountyMapFeature) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate(feature);
    }
  };

  return (
    <svg
      viewBox={ARKANSAS_COUNTY_SVG_VIEWBOX}
      role="img"
      aria-label="Arkansas counties by Kelly Grappe campaign visit status"
      className="h-auto w-full max-w-full"
    >
      {features.map((feature) => {
        const active = selectedKey === feature.key;
        const stroke = strokeFor(feature, active);
        const actionable = Boolean(feature.href);
        return (
          <path
            key={feature.key}
            d={feature.d}
            fill={FILL[feature.publicState]}
            stroke={stroke.stroke}
            strokeWidth={stroke.width}
            strokeDasharray={stroke.dash}
            strokeLinejoin="round"
            tabIndex={actionable ? 0 : undefined}
            aria-label={feature.ariaLabel}
            role={actionable ? "link" : undefined}
            className="cursor-pointer outline-none transition-[filter] duration-150 hover:brightness-110 focus-visible:brightness-110"
            style={{
              outline: active ? "2px solid var(--kelly-official-gold)" : undefined,
              outlineOffset: 2,
            }}
            onMouseEnter={() => onSelect(feature.key)}
            onFocus={() => onSelect(feature.key)}
            onClick={() => onActivate(feature)}
            onKeyDown={(e) => onKeyDown(e, feature)}
          />
        );
      })}
    </svg>
  );
}
