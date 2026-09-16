"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventsMonthCalendar } from "@/components/organizing/EventsMonthCalendar";
import { ymdInTimeZone } from "@/lib/calendar/public-event-format";
import type { EventsMonthPin } from "@/lib/events/events-month-pins";

const TZ = "America/Chicago";
const ELECTION_YMD = "2026-11-03";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarView = "month" | "week" | "day" | "election";

const VIEWS: Array<{ id: CalendarView; label: string }> = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "election", label: "Election" },
];

function todayYmd(): string {
  return ymdInTimeZone(new Date(), TZ);
}

function startOfWeekSunday(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  dt.setUTCDate(dt.getUTCDate() - dow);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function longDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function pinsOn(pins: EventsMonthPin[], ymd: string): EventsMonthPin[] {
  return pins.filter((pin) => pin.ymd === ymd);
}

function PinList({ pins }: { pins: EventsMonthPin[] }) {
  if (!pins.length) {
    return <p className="font-body text-sm text-kelly-text/65">No public stops on this day.</p>;
  }
  return (
    <ul className="space-y-2">
      {pins.map((pin) => (
        <li key={pin.slug}>
          <Link
            href={pin.href}
            className="block rounded-md border border-kelly-navy/15 bg-white px-3 py-2 hover:border-kelly-navy/40"
          >
            <p className="font-heading text-sm font-bold text-kelly-text">{pin.location}</p>
            <p className="font-body text-xs text-kelly-navy">Open event</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function WeekBoard({ pins, weekStart }: { pins: EventsMonthPin[]; weekStart: string }) {
  const today = todayYmd();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((ymd, i) => {
        const dayPins = pinsOn(pins, ymd);
        return (
          <div
            key={ymd}
            className={`min-h-[8rem] rounded-card border p-2 ${
              ymd === today ? "border-kelly-gold bg-kelly-gold/15" : "border-kelly-navy/15 bg-white"
            }`}
          >
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">{WEEKDAYS[i]}</p>
            <p className="font-heading text-sm font-bold text-kelly-text">{ymd.slice(8)}</p>
            <ul className="mt-1 space-y-0.5">
              {dayPins.slice(0, 4).map((pin) => (
                <li key={pin.slug}>
                  <Link href={pin.href} className="block truncate font-body text-[11px] font-semibold text-kelly-navy hover:underline">
                    {pin.location}
                  </Link>
                </li>
              ))}
            </ul>
            {dayPins.length > 4 ? (
              <p className="mt-1 font-body text-[10px] text-kelly-text/55">+{dayPins.length - 4} more</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ElectionBoard({ pins }: { pins: EventsMonthPin[] }) {
  const start = todayYmd();
  const remaining = pins
    .filter((pin) => pin.ymd >= start && pin.ymd <= ELECTION_YMD)
    .sort((a, b) => a.ymd.localeCompare(b.ymd) || a.location.localeCompare(b.location));
  const byDay = new Map<string, EventsMonthPin[]>();
  for (const pin of remaining) {
    const list = byDay.get(pin.ymd) ?? [];
    list.push(pin);
    byDay.set(pin.ymd, list);
  }
  const days = Array.from(byDay.keys());
  if (!days.length) {
    return <p className="font-body text-sm text-kelly-text/65">No remaining public stops on the election calendar yet.</p>;
  }
  return (
    <ol className="space-y-4">
      {days.map((ymd) => (
        <li key={ymd}>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{longDate(ymd)}</p>
          <div className="mt-2">
            <PinList pins={byDay.get(ymd) ?? []} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function EventsCalendarViews({ pins }: { pins: EventsMonthPin[] }) {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(todayYmd);

  const weekStart = useMemo(() => startOfWeekSunday(cursor), [cursor]);
  const heading =
    view === "week"
      ? `Week of ${longDate(weekStart)}`
      : view === "day"
        ? longDate(cursor)
        : view === "election"
          ? "Today through Election Day · November 3, 2026"
          : null;

  function shift(delta: -1 | 1) {
    if (view === "week") setCursor((ymd) => addDays(startOfWeekSunday(ymd), delta * 7));
    if (view === "day") setCursor((ymd) => addDays(ymd, delta));
  }

  return (
    <div>
      <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Campaign calendar</p>
      <p className="mt-1 font-body text-sm text-kelly-text/70">
        Month, week, day, and the remaining election calendar. Tap a town to open that stop.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Calendar views">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={view === item.id}
            onClick={() => setView(item.id)}
            className={`rounded-full border px-4 py-2 font-body text-sm font-semibold ${
              view === item.id
                ? "border-kelly-navy bg-kelly-navy text-kelly-page"
                : "border-kelly-navy/20 bg-white text-kelly-text hover:border-kelly-navy/40"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {heading ? <h3 className="mt-5 font-heading text-lg font-bold text-kelly-text">{heading}</h3> : null}
      {view === "week" || view === "day" ? (
        <div className="mt-3 flex flex-wrap gap-3 font-body text-sm font-semibold">
          <button type="button" onClick={() => shift(-1)} className="text-kelly-navy underline-offset-4 hover:underline">
            Previous
          </button>
          <button type="button" onClick={() => setCursor(todayYmd())} className="text-kelly-navy underline-offset-4 hover:underline">
            Today
          </button>
          <button type="button" onClick={() => shift(1)} className="text-kelly-navy underline-offset-4 hover:underline">
            Next
          </button>
        </div>
      ) : null}
      <div className="mt-4">
        {view === "month" ? <EventsMonthCalendar pins={pins} /> : null}
        {view === "week" ? <WeekBoard pins={pins} weekStart={weekStart} /> : null}
        {view === "day" ? <PinList pins={pinsOn(pins, cursor)} /> : null}
        {view === "election" ? <ElectionBoard pins={pins} /> : null}
      </div>
    </div>
  );
}
