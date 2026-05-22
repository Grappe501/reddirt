"use client";

import { useMemo, useState } from "react";
import { addWeeks, eachDayOfInterval, endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { CalendarEventChip } from "./CalendarEventChip";

export function WeekCalendarView() {
  const { rows, setReviewRecordId, focusYmd, setFocusYmd } = useCampaignCalendar();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(parseISO(focusYmd)));
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });

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
        <button type="button" className="rounded-full border px-3 py-1 text-sm font-bold" onClick={() => setWeekStart(addWeeks(weekStart, -1))}>
          ←
        </button>
        <h2 className="font-heading text-lg font-bold">
          Week of {format(weekStart, "MMM d, yyyy")}
        </h2>
        <button type="button" className="rounded-full border px-3 py-1 text-sm font-bold" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
          →
        </button>
      </div>
      <div className="grid gap-2 lg:grid-cols-7">
        {days.map((day) => {
          const ymd = format(day, "yyyy-MM-dd");
          const dayRows = byDay.get(ymd) ?? [];
          return (
            <div key={ymd} className="rounded-xl border border-kelly-text/10 bg-kelly-page p-2">
              <button type="button" className="w-full text-left font-body text-xs font-bold text-kelly-slate" onClick={() => setFocusYmd(ymd)}>
                {format(day, "EEE d")}
              </button>
              <div className="mt-2 space-y-2">
                {dayRows.map((r) => (
                  <div key={r.recordId}>
                    <CalendarEventChip row={r} compact onSelect={setReviewRecordId} />
                    <p className="mt-0.5 font-body text-[9px] text-kelly-subtle">
                      {r.lanes.sourceLabel} → {r.lanes.targetLabel}
                    </p>
                    {r.hasConflictWarning ? <p className="text-[9px] font-bold text-red-800">Conflict</p> : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
