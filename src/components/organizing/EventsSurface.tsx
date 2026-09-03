"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventItem } from "@/content/types";
import { EventStopCard } from "@/components/organizing/EventStopCard";
import { publicEventConflictSlugs } from "@/lib/events/public-event-conflicts";
import { Button } from "@/components/ui/Button";
import {
  compareEventsForHub,
  eventCalendarDayKey,
  resolveEventStatus,
} from "@/lib/format/eventDisplay";
import { eventMatchesSchedulePreset } from "@/lib/format/event-schedule-in-zone";
import { publicLaneForMovementType, type PublicEventLane } from "@/lib/events/public-event-kind";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const MovementFairsMap = dynamic(
  () => import("@/components/organizing/MovementFairsMap").then((m) => m.MovementFairsMap),
  { ssr: false },
);

export type EventsSurfaceView = "upcoming" | "calendar" | "map" | "past";
type LaneChip = "all" | "this_week" | PublicEventLane;

const VIEWS: Array<{ id: EventsSurfaceView; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "calendar", label: "Calendar" },
  { id: "map", label: "Map" },
  { id: "past", label: "Past Stops" },
];

const LANES: Array<{ id: LaneChip; label: string }> = [
  { id: "all", label: "All" },
  { id: "this_week", label: "This Week" },
  { id: "community", label: "Community" },
  { id: "civic", label: "Civic" },
  { id: "campaign", label: "Campaign" },
];

function applyLane(events: EventItem[], lane: LaneChip): EventItem[] {
  if (lane === "all") return events;
  if (lane === "this_week") {
    return events.filter((e) => eventMatchesSchedulePreset(e.startsAt, e.endsAt, "this_week"));
  }
  return events.filter((e) => publicLaneForMovementType(e.type) === lane);
}

function EventsMonthGrid({ events }: { events: EventItem[] }) {
  const tz = "America/Chicago";
  const y = Number(new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: tz }).format(new Date()));
  const m = Number(new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: tz }).format(new Date()));
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: tz }).format(
    new Date(),
  );
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const weekday = new Date(y, m - 1, 1).getDay();
  const byDay = new Map<string, EventItem[]>();
  for (const e of events) {
    const key = eventCalendarDayKey(e);
    const list = byDay.get(key) ?? [];
    list.push(e);
    byDay.set(key, list);
  }

  const cells: Array<{ d: number | null; key: string | null }> = [];
  for (let i = 0; i < weekday; i += 1) cells.push({ d: null, key: null });
  for (let d = 1; d <= daysInMonth; d += 1) {
    const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ d, key });
  }

  return (
    <div>
      <h3 className="font-heading text-lg font-bold text-kelly-text">{monthLabel}</h3>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center font-body text-[11px] font-bold uppercase text-kelly-text/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const hits = cell.key ? (byDay.get(cell.key) ?? []) : [];
          return (
            <div
              key={cell.key ?? `pad-${i}`}
              className={cn(
                "min-h-[4.5rem] rounded-md border p-1.5 text-left",
                cell.d ? "border-kelly-text/10 bg-white" : "border-transparent",
                hits.length ? "border-kelly-navy/25 bg-kelly-navy/[0.04]" : null,
              )}
            >
              {cell.d ? <p className="font-body text-xs font-semibold text-kelly-text/70">{cell.d}</p> : null}
              {hits.slice(0, 2).map((e) => (
                <Link
                  key={e.slug}
                  href={e.detailHref ?? `/events/${e.slug}`}
                  className="mt-0.5 block truncate font-body text-[11px] font-semibold text-kelly-navy"
                >
                  {e.title}
                </Link>
              ))}
              {hits.length > 2 ? (
                <p className="mt-0.5 font-body text-[10px] text-kelly-text/55">+{hits.length - 2} more</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function syncViewQuery(next: EventsSurfaceView) {
  if (typeof window === "undefined") return;
  const u = new URL(window.location.href);
  if (next === "upcoming") u.searchParams.delete("view");
  else u.searchParams.set("view", next);
  window.history.replaceState(null, "", `${u.pathname}${u.search}`);
}

export function EventsSurface({
  events,
  initialView = "upcoming",
}: {
  events: EventItem[];
  initialView?: EventsSurfaceView;
}) {
  const [view, setView] = useState<EventsSurfaceView>(initialView);
  const [lane, setLane] = useState<LaneChip>("all");
  const [mapMode, setMapMode] = useState<"upcoming" | "past">(initialView === "past" ? "past" : "upcoming");

  const now = useMemo(() => new Date(), []);
  const upcomingAll = useMemo(
    () => events.filter((e) => resolveEventStatus(e, now) === "upcoming").sort((a, b) => compareEventsForHub(a, b, now)),
    [events, now],
  );
  const pastAll = useMemo(
    () => events.filter((e) => resolveEventStatus(e, now) === "past").sort((a, b) => compareEventsForHub(a, b, now)),
    [events, now],
  );
  const upcoming = useMemo(() => applyLane(upcomingAll, lane), [upcomingAll, lane]);
  const past = useMemo(() => applyLane(pastAll, lane === "this_week" ? "all" : lane), [pastAll, lane]);

  const mapEvents = mapMode === "upcoming" ? upcomingAll : pastAll;
  const next = upcoming[0];
  const rest = upcoming.slice(1);
  const conflictSlugs = useMemo(() => publicEventConflictSlugs(upcomingAll, now), [upcomingAll, now]);
  const pastWithCounty = pastAll.filter((e) => e.countySlug);
  const countyCount = new Set(pastWithCounty.map((e) => e.countySlug)).size;

  function selectView(nextView: EventsSurfaceView) {
    setView(nextView);
    syncViewQuery(nextView);
    if (nextView === "map") return;
    if (nextView === "past") setMapMode("past");
    if (nextView === "upcoming") setMapMode("upcoming");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Events views">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            className={cn(
              "rounded-full border px-4 py-2 font-body text-sm font-semibold",
              view === v.id
                ? "border-kelly-navy bg-kelly-navy text-kelly-page"
                : "border-kelly-text/15 bg-white text-kelly-text hover:border-kelly-navy/30",
            )}
            onClick={() => selectView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "upcoming" || view === "past" ? (
        <div className="flex flex-wrap gap-2" aria-label="Lightweight filters">
          {LANES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={cn(
                "rounded-full border px-3 py-1.5 font-body text-xs font-semibold",
                lane === l.id
                  ? "border-kelly-success/40 bg-kelly-success/12 text-kelly-text"
                  : "border-kelly-text/15 bg-kelly-text/[0.04] text-kelly-text/80",
              )}
              onClick={() => setLane(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      ) : null}

      {view === "upcoming" ? (
        <div className="space-y-8">
          {next ? (
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Next stop</p>
              <div className="mt-3">
                <EventStopCard event={next} scheduleConflict={conflictSlugs.has(next.slug)} />
              </div>
            </div>
          ) : (
            <p className="rounded-card border border-dashed border-kelly-text/20 px-4 py-6 font-body text-sm text-kelly-text/75">
              No confirmed upcoming stops in this view. Invite Kelly or host a gathering.
            </p>
          )}
          {rest.length ? (
            <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
              {rest.map((e) => (
                <li key={e.slug}>
                  <EventStopCard event={e} scheduleConflict={conflictSlugs.has(e.slug)} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {view === "past" ? (
        <div className="space-y-6">
          <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
            {past.length ? (
              past.map((e) => (
                <li key={e.slug}>
                  <EventStopCard event={e} scheduleConflict={conflictSlugs.has(e.slug)} />
                </li>
              ))
            ) : (
              <li className="font-body text-sm text-kelly-text/75">No past stops in this view yet.</li>
            )}
          </ul>
          <p className="font-body text-sm text-kelly-text/70">
            Recaps land on{" "}
            <Link href="/from-the-road" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              From the Road
            </Link>{" "}
            when a stop has photos or a write-up.
          </p>
        </div>
      ) : null}

      {view === "calendar" ? <EventsMonthGrid events={[...upcomingAll, ...pastAll]} /> : null}

      {view === "map" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(
                "rounded-full border px-4 py-2 font-body text-sm font-semibold",
                mapMode === "upcoming" ? "border-kelly-navy bg-kelly-navy text-kelly-page" : "border-kelly-text/15 bg-white",
              )}
              onClick={() => setMapMode("upcoming")}
            >
              Coming Up
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full border px-4 py-2 font-body text-sm font-semibold",
                mapMode === "past" ? "border-kelly-navy bg-kelly-navy text-kelly-page" : "border-kelly-text/15 bg-white",
              )}
              onClick={() => setMapMode("past")}
            >
              Where We’ve Been
            </button>
          </div>
          {mapMode === "past" ? (
            <div>
              <h3 className="font-heading text-xl font-bold text-kelly-text">Showing up matters.</h3>
              <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
                Kelly has traveled Arkansas listening to the people who actually live here.
              </p>
              {countyCount > 0 && pastAll.length > 0 ? (
                <p className="mt-2 font-body text-sm font-semibold text-kelly-text">
                  {countyCount} {countyCount === 1 ? "county" : "counties"} · {pastAll.length}{" "}
                  {pastAll.length === 1 ? "stop" : "stops"}
                </p>
              ) : null}
            </div>
          ) : null}
          <MovementFairsMap events={mapEvents} />
          <Button href="/events/request" variant="outline">
            Invite Kelly
          </Button>
        </div>
      ) : null}
    </div>
  );
}
