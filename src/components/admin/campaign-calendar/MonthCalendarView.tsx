"use client";

import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { CalendarEventChip } from "./CalendarEventChip";

export function MonthCalendarView() {
  const { rows, setReviewRecordId } = useCampaignCalendar();
  const [cursor, setCursor] = useState(() => parseISO(rows[0]?.dateYmd ?? "2026-03-01"));

  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(cursor));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const byDay = useMemo(() => {
    const m = new Map<string, typeof rows>();
    for (const r of rows) {
      const list = m.get(r.dateYmd) ?? [];
      list.push(r);
      m.set(r.dateYmd, list);
    }
    return m;
  }, [rows]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-full border px-3 py-1 text-sm font-bold" onClick={() => setCursor(addMonths(cursor, -1))}>
          ←
        </button>
        <h2 className="font-heading text-xl font-bold">{format(cursor, "MMMM yyyy")}</h2>
        <button type="button" className="rounded-full border px-3 py-1 text-sm font-bold" onClick={() => setCursor(addMonths(cursor, 1))}>
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-body text-[10px] font-bold uppercase text-kelly-slate">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const ymd = format(day, "yyyy-MM-dd");
          const dayRows = byDay.get(ymd) ?? [];
          const inMonth = day.getMonth() === cursor.getMonth();
          return (
            <div
              key={ymd}
              className={`min-h-[88px] rounded-lg border p-1 ${inMonth ? "border-kelly-text/10 bg-kelly-page" : "border-transparent bg-kelly-wash/50 opacity-50"}`}
            >
              <p className="text-right font-body text-[10px] font-bold text-kelly-subtle">{format(day, "d")}</p>
              <div className="mt-1 space-y-1">
                {dayRows.slice(0, 2).map((r) => (
                  <CalendarEventChip key={r.recordId} row={r} compact onSelect={setReviewRecordId} />
                ))}
                {dayRows.length > 2 ? <p className="text-[9px] text-kelly-subtle">+{dayRows.length - 2} more</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
