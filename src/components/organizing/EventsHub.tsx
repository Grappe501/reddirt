"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { EventItem } from "@/content/types";
import { EventCard } from "@/components/organizing/EventCard";
import { EventFilterBar, type EventFiltersState } from "@/components/organizing/EventFilterBar";
import type { EventType } from "@/content/types";
import { Button } from "@/components/ui/Button";
import { eventMatchesSchedulePreset } from "@/lib/format/event-schedule-in-zone";

const MovementFairsMap = dynamic(
  () => import("@/components/organizing/MovementFairsMap").then((m) => m.MovementFairsMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[280px] flex-col gap-3 sm:min-h-[320px]"
        role="status"
        aria-live="polite"
      >
        <div className="h-4 w-40 animate-pulse rounded bg-kelly-text/10" />
        <div className="flex flex-1 animate-pulse rounded-2xl bg-gradient-to-br from-kelly-text/[0.07] to-kelly-text/[0.12]" />
        <p className="font-body text-xs text-kelly-text/55">Loading Arkansas map…</p>
      </div>
    ),
  },
);

type EventsHubProps = {
  events: EventItem[];
  types: EventType[];
  regions: string[];
  audienceTags: string[];
  initialFilters?: Partial<EventFiltersState>;
};

export function EventsHub({ events, types, regions, audienceTags, initialFilters }: EventsHubProps) {
  const [filters, setFilters] = useState<EventFiltersState>({
    type: initialFilters?.type ?? "all",
    region: initialFilters?.region ?? "all",
    status: initialFilters?.status ?? "all",
    audience: initialFilters?.audience ?? "all",
    schedule: initialFilters?.schedule ?? "all",
    includeCalendar: initialFilters?.includeCalendar ?? true,
  });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (!filters.includeCalendar && e.eventSource === "calendar") return false;
      if (filters.type !== "all" && e.type !== filters.type) return false;
      if (filters.region !== "all" && e.region !== filters.region) return false;
      if (filters.status !== "all" && e.status !== filters.status) return false;
      if (filters.audience !== "all") {
        const tags = e.audienceTags ?? [];
        if (!tags.includes(filters.audience)) return false;
      }
      if (!eventMatchesSchedulePreset(e.startsAt, e.endsAt, filters.schedule)) return false;
      return true;
    });
  }, [events, filters]);

  useEffect(() => {
    if (selectedSlug && !filtered.some((e) => e.slug === selectedSlug)) {
      setSelectedSlug(null);
    }
  }, [filtered, selectedSlug]);

  const emptyByRegion =
    filters.region !== "all" && events.filter((e) => e.region === filters.region).length === 0;

  const unmappedUpcoming = useMemo(
    () =>
      filtered.filter(
        (e) => e.status === "upcoming" && !e.mapCoordinates,
      ),
    [filtered],
  );

  return (
    <div className="space-y-8 lg:space-y-10">
      <EventFilterBar
        types={types}
        regions={regions}
        audienceTags={audienceTags}
        value={filters}
        onChange={setFilters}
      />

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-1 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start xl:gap-12">
        <div className="order-1 min-w-0 xl:order-2 xl:max-w-none">
          {unmappedUpcoming.length > 0 ? (
            <div
              className="mb-4 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2 font-body text-xs text-amber-950/90"
              role="status"
            >
              <strong className="font-bold">{unmappedUpcoming.length}</strong> upcoming in this view have no map point
              yet—check the list for locations.
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <div
              role="status"
              className="rounded-card border border-dashed border-kelly-text/25 bg-kelly-text/[0.03] p-8 text-center md:p-10"
            >
              <h2 className="font-heading text-xl font-bold text-kelly-text md:text-2xl">No events match those filters</h2>
              <p className="mx-auto mt-3 max-w-prose font-body text-base text-kelly-text/75">
                {emptyByRegion
                  ? "We’re still scheduling gatherings in that region. Host something small—we’ll help you plan."
                  : "Try widening the filters, or host a gathering to create the next opening on the map."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      type: "all",
                      region: "all",
                      status: "all",
                      audience: "all",
                      schedule: "all",
                      includeCalendar: true,
                    })
                  }
                >
                  Reset filters
                </Button>
                <Button href="/host-a-gathering" variant="primary">
                  Host a gathering
                </Button>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {filtered.map((e) => (
                <li key={e.slug}>
                  <EventCard
                    event={e}
                    highlighted={selectedSlug === e.slug}
                    onActivate={() => setSelectedSlug(e.slug)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="order-2 xl:order-1">
          <div className="mb-2">
            <h3 className="font-heading text-lg font-bold text-kelly-text">Field map</h3>
            <p className="mt-1 font-body text-sm text-kelly-text/70">
              Click a pin or card to sync the view. Filters apply to both.
            </p>
          </div>
          <MovementFairsMap
            events={filtered}
            selectedSlug={selectedSlug}
            onSelectSlug={setSelectedSlug}
          />
          <div className="mt-4 rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] px-4 py-3 font-body text-sm text-kelly-text/80">
            <p className="font-semibold text-kelly-text">Request Kelly in your town</p>
            <p className="mt-1 text-kelly-text/75">
              Don’t see your county yet? Start a host conversation—we’ll help with format, timing, and follow-up.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button href="/host-a-gathering" variant="primary" className="text-sm">
                Host a gathering
              </Button>
              <Button href="/get-involved" variant="outline" className="text-sm">
                Stay connected
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
