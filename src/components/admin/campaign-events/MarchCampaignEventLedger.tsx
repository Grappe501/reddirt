"use client";

import type { PersistedMarchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import { CampaignEventCard } from "./CampaignEventFactCard";

export function MarchCampaignEventLedger({ days }: { days: Array<{ ymd: string; heading: string; events: PersistedMarchEventRow[] }> }) {
  return (
    <div className="flex flex-col gap-8">
      {days.map((day) => (
        <section key={day.ymd} className="flex flex-col gap-3">
          <header className="sticky top-0 z-10 rounded-xl border border-kelly-text/10 bg-kelly-wash/95 px-4 py-3 backdrop-blur-sm">
            <h2 className="font-heading text-xl font-bold text-kelly-text">{day.heading}</h2>
            <p className="font-body text-xs text-kelly-muted">
              {day.events.length} event{day.events.length === 1 ? "" : "s"}
            </p>
          </header>
          <div className="grid gap-3">
            {day.events.map((row) => (
              <CampaignEventCard key={row.calendar.id} row={row} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
