"use client";

import Link from "next/link";
import { ArkansasCountyMap } from "@/components/organizing/events-map/ArkansasCountyMap";
import { MapLegend } from "@/components/organizing/events-map/MapLegend";
import type { CountyMapFeature } from "@/components/organizing/events-map/county-map-types";
import {
  CAMPAIGN_STOP_MILESTONE,
  formatCampaignStopAsOfDate,
} from "@/content/events/campaign-stop-milestone";
import type { CountyVisitLedger } from "@/lib/events/county-visit-ledger";

type Props = {
  features: CountyMapFeature[];
  ledger: CountyVisitLedger;
};

/**
 * Compact homepage teaser — same county data as /events, but the whole surface links to the full map.
 */
export function CampaignJourneyMapTeaser({ features, ledger }: Props) {
  const asOfDate = formatCampaignStopAsOfDate();
  const visitedCount = ledger.visited.length;

  return (
    <Link
      href="/events"
      className="group block rounded-2xl border border-kelly-navy/15 bg-white p-4 shadow-[var(--shadow-soft)] transition hover:border-kelly-gold/45 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy sm:p-5"
      aria-label="Open the full campaign trail map on the Events page"
    >
      <div className="pointer-events-none">
        <div className="max-h-[min(52vw,14rem)] overflow-hidden sm:max-h-[min(40vw,16rem)] md:max-h-[18rem]">
          <ArkansasCountyMap
            features={features}
            selectedKey={null}
            onSelect={() => {}}
            onActivate={() => {}}
          />
        </div>
        <MapLegend />
        <p className="mt-3 font-body text-xs text-kelly-text/70">
          Blue counties are places Kelly has already been. Gold outline marks a confirmed upcoming stop.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-kelly-navy/10 bg-kelly-navy/[0.04] px-4 py-3">
            <p className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">{CAMPAIGN_STOP_MILESTONE.count}</p>
            <p className="mt-1 font-body text-xs font-semibold text-kelly-text">Scheduled campaign stops</p>
            <p className="mt-0.5 font-body text-[11px] text-kelly-text/65">
              As of {asOfDate} — {CAMPAIGN_STOP_MILESTONE.asOfEventTitle}
            </p>
          </div>
          <div className="rounded-lg border border-kelly-navy/10 bg-kelly-navy/[0.04] px-4 py-3">
            <p className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
              {visitedCount} of {ledger.totalCounties}
            </p>
            <p className="mt-1 font-body text-xs font-semibold text-kelly-text">Arkansas counties visited</p>
          </div>
        </div>
      </div>
      <p className="mt-4 font-body text-sm font-bold text-kelly-navy group-hover:underline">
        See the full map and calendar →
      </p>
    </Link>
  );
}
