"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArkansasCountyMap } from "@/components/organizing/events-map/ArkansasCountyMap";
import { CountyTooltip, MapLegend } from "@/components/organizing/events-map/MapLegend";
import type { CountyMapFeature } from "@/components/organizing/events-map/county-map-types";

export function CampaignJourneyMap({ features }: { features: CountyMapFeature[] }) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const selected = useMemo(
    () => features.find((f) => f.key === selectedKey) ?? null,
    [features, selectedKey],
  );

  const onActivate = (feature: CountyMapFeature) => {
    setSelectedKey(feature.key);
    if (!coarse && feature.href) {
      router.push(feature.href);
    }
  };

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-kelly-text/10 bg-white p-3 shadow-[var(--shadow-soft)] sm:p-4">
        <ArkansasCountyMap
          features={features}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onActivate={onActivate}
        />
        <div className="mt-3 hidden md:block">
          {selected ? <CountyTooltip feature={selected} /> : (
            <p className="font-body text-xs text-kelly-text/60">Hover or focus a county for details.</p>
          )}
        </div>
        <MapLegend />
      </div>

      {selected ? (
        <div className="mt-4 rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.04] p-4 md:hidden">
          <p className="font-heading text-base font-bold text-kelly-text">{selected.name} County</p>
          <p className="mt-1 font-body text-sm text-kelly-text/80">{selected.visitedLabel}</p>
          {selected.upcomingLines.length ? (
            <ul className="mt-3 space-y-2">
              {selected.upcomingLines.map((line) => (
                <li key={line.href}>
                  <Link href={line.href} className="font-body text-sm font-semibold text-kelly-navy underline-offset-4 hover:underline">
                    {line.text}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 font-body text-sm text-kelly-text/70">No upcoming public stop listed yet.</p>
          )}
        </div>
      ) : (
        <p className="mt-3 font-body text-sm text-kelly-text/65 md:hidden">Tap a county to see visit status and any upcoming stop.</p>
      )}
    </div>
  );
}
