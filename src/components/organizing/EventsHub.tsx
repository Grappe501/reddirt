"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/content/types";
import { EventCard } from "@/components/organizing/EventCard";
import { EventFilterBar, type EventFiltersState } from "@/components/organizing/EventFilterBar";
import type { EventType } from "@/content/types";
import { Button } from "@/components/ui/Button";
import { MovementFairsMap } from "@/components/organizing/MovementFairsMap";

type EventsHubProps = {
  events: EventItem[];
  types: EventType[];
  regions: string[];
  audienceTags: string[];
  initialFilters?: Partial<EventFiltersState>;
  /** Google Maps key (server can pass `GOOGLE_MAPS_API_KEY` or `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`). */
  mapsApiKey?: string | null;
};

export function EventsHub({ events, types, regions, audienceTags, initialFilters, mapsApiKey = null }: EventsHubProps) {
  const [filters, setFilters] = useState<EventFiltersState>({
    type: initialFilters?.type ?? "all",
    region: initialFilters?.region ?? "all",
    status: initialFilters?.status ?? "all",
    audience: initialFilters?.audience ?? "all",
  });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.type !== "all" && e.type !== filters.type) return false;
      if (filters.region !== "all" && e.region !== filters.region) return false;
      if (filters.status !== "all" && e.status !== filters.status) return false;
      if (filters.audience !== "all") {
        const tags = e.audienceTags ?? [];
        if (!tags.includes(filters.audience)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const emptyByRegion =
    filters.region !== "all" && events.filter((e) => e.region === filters.region).length === 0;

  return (
    <div className="space-y-10">
      <EventFilterBar
        types={types}
        regions={regions}
        audienceTags={audienceTags}
        value={filters}
        onChange={setFilters}
      />

      <MovementFairsMap apiKey={mapsApiKey} events={filtered} />

      {filtered.length === 0 ? (
        <div
          role="status"
          className="rounded-card border border-dashed border-deep-soil/25 bg-deep-soil/[0.03] p-10 text-center"
        >
          <h2 className="font-heading text-2xl font-bold text-deep-soil">No events match those filters</h2>
          <p className="mx-auto mt-3 max-w-prose font-body text-base text-deep-soil/75">
            {emptyByRegion
              ? "We’re still scheduling gatherings in that region. Host something small—we’ll help you plan."
              : "Try widening the filters, or host a gathering to create the next opening on the map."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="outline" onClick={() => setFilters({ type: "all", region: "all", status: "all", audience: "all" })}>
              Reset filters
            </Button>
            <Button href="/host-a-gathering" variant="primary">
              Host a gathering
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <li key={e.slug}>
              <EventCard event={e} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
