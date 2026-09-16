"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  daysInGregorianMonth,
  weekday0SundayYmd,
  ymdInTimeZone,
} from "@/lib/calendar/public-event-format";
import type { EventsMonthPin } from "@/lib/events/events-month-pins";

const TZ = "America/Chicago";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LAST_MONTH = { year: 2026, month: 11 };

type Month = { year: number; month: number };

function todayMonth(): Month {
  const ymd = ymdInTimeZone(new Date(), TZ);
  const [year, month] = ymd.split("-").map(Number);
  return { year, month };
}

function monthKey(m: Month): string {
  return `${m.year}-${String(m.month).padStart(2, "0")}`;
}

function isBefore(a: Month, b: Month): boolean {
  return a.year < b.year || (a.year === b.year && a.month < b.month);
}

function addMonth(m: Month, delta: number): Month {
  const date = new Date(Date.UTC(m.year, m.month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function monthLabel(m: Month): string {
  return new Date(Date.UTC(m.year, m.month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function EventsMonthCalendar({ pins }: { pins: EventsMonthPin[] }) {
  const floor = todayMonth();
  const [view, setView] = useState<Month>(floor);
  const todayYmd = ymdInTimeZone(new Date(), TZ);
  const canBack = isBefore(floor, view);
  const canForward = isBefore(view, LAST_MONTH);

  const cells = useMemo(() => {
    const firstYmd = `${monthKey(view)}-01`;
    const lead = weekday0SundayYmd(firstYmd, TZ);
    const days = daysInGregorianMonth(view.year, view.month);
    const byDay = new Map<string, EventsMonthPin[]>();
    const prefix = monthKey(view);
    for (const pin of pins) {
      if (!pin.ymd || !pin.ymd.startsWith(prefix)) continue;
      const list = byDay.get(pin.ymd) ?? [];
      list.push(pin);
      byDay.set(pin.ymd, list);
    }
    const out: Array<{ key: string; day: number | null; ymd: string | null; events: EventsMonthPin[] }> = [];
    for (let i = 0; i < lead; i += 1) out.push({ key: `pad-${i}`, day: null, ymd: null, events: [] });
    for (let day = 1; day <= days; day += 1) {
      const ymd = `${prefix}-${String(day).padStart(2, "0")}`;
      out.push({ key: ymd, day, ymd, events: byDay.get(ymd) ?? [] });
    }
    while (out.length < 42) {
      out.push({ key: `tail-${out.length}`, day: null, ymd: null, events: [] });
    }
    return out;
  }, [pins, view]);

  return (
    <div className="mx-auto w-full max-w-[min(36rem,calc(100vw-1.5rem),calc(100svh-8rem))]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-kelly-text">{monthLabel(view)}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canBack}
            onClick={() => setView((m) => addMonth(m, -1))}
            className="rounded-btn border-2 border-kelly-navy/25 px-3 py-1.5 font-body text-sm font-semibold text-kelly-text disabled:cursor-not-allowed disabled:opacity-35"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!canForward}
            onClick={() => setView((m) => addMonth(m, 1))}
            className="rounded-btn border-2 border-kelly-navy/25 px-3 py-1.5 font-body text-sm font-semibold text-kelly-text disabled:cursor-not-allowed disabled:opacity-35"
          >
            Next
          </button>
        </div>
      </div>
      <div
        className="aspect-square overflow-hidden rounded-card border border-kelly-navy/15 bg-white"
        role="grid"
        aria-label={`${monthLabel(view)} campaign calendar`}
      >
        <div className="grid h-full grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border-b border-kelly-navy/10 px-1 py-1 text-center font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted"
              role="columnheader"
            >
              {day}
            </div>
          ))}
          {cells.map((cell) => {
            const isToday = cell.ymd === todayYmd;
            return (
              <div
                key={cell.key}
                role="gridcell"
                className={`min-h-0 overflow-hidden border-b border-r border-kelly-navy/10 p-1 ${
                  cell.day == null ? "bg-kelly-navy/[0.03]" : isToday ? "bg-kelly-gold/15" : "bg-white"
                }`}
              >
                {cell.day != null && cell.ymd ? (
                  <div className="flex h-full min-h-0 flex-col gap-0.5">
                    <span
                      className={`font-body text-[11px] font-bold leading-none ${
                        isToday ? "text-kelly-navy" : "text-kelly-text/70"
                      }`}
                    >
                      {cell.day}
                    </span>
                    <ul className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
                      {cell.events.slice(0, 3).map((event) => (
                        <li key={event.slug} className="leading-tight">
                          <Link
                            href={event.href}
                            className="block truncate rounded-sm px-0.5 font-body text-[10px] font-semibold text-kelly-navy hover:bg-kelly-navy/10 hover:underline sm:text-[11px]"
                            title={event.location}
                          >
                            {event.location}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {cell.events.length > 3 ? (
                      <p className="font-body text-[9px] text-kelly-text/55">+{cell.events.length - 3} more</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
