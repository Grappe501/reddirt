"use client";

import { useMemo, useState } from "react";
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { CalendarEventChip } from "./CalendarEventChip";
import { CalendarMonthNavigator } from "./calendar-ui/CalendarMonthNavigator";
import { cal } from "./calendar-ui/calendar-design-tokens";

export function WeekCalendarView() {
  const { rows, setReviewRecordId, focusYmd, setFocusYmd, nowMs } = useCampaignCalendar();
  const today = new Date(nowMs);
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

  const weekCount = useMemo(() => {
    const end = endOfWeek(weekStart);
    return rows.filter((r) => {
      const d = parseISO(r.dateYmd);
      return d >= weekStart && d <= end;
    }).length;
  }, [rows, weekStart]);

  return (
    <div className="space-y-4">
      <CalendarMonthNavigator
        label={`Week of ${format(weekStart, "MMM d, yyyy")}`}
        subtitle={`${weekCount} events this week`}
        onPrev={() => setWeekStart(addWeeks(weekStart, -1))}
        onNext={() => setWeekStart(addWeeks(weekStart, 1))}
      />

      <div className="grid gap-3 lg:grid-cols-7">
        {days.map((day) => {
          const ymd = format(day, "yyyy-MM-dd");
          const dayRows = byDay.get(ymd) ?? [];
          const isToday = isSameDay(day, today);
          return (
            <div
              key={ymd}
              className={`${cal.glass} min-h-[140px] p-2.5 ${isToday ? "ring-2 ring-kelly-gold/60" : ""}`}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between text-left font-body text-xs font-bold text-kelly-navy"
                onClick={() => setFocusYmd(ymd)}
              >
                <span>{format(day, "EEE")}</span>
                <span className={`tabular-nums ${isToday ? "text-kelly-gold" : "text-kelly-muted"}`}>{format(day, "d")}</span>
              </button>
              <div className="mt-2 space-y-2">
                {dayRows.map((r) => (
                  <div key={r.recordId}>
                    <CalendarEventChip row={r} compact onSelect={setReviewRecordId} />
                    <p className="mt-0.5 font-body text-[9px] text-kelly-subtle">
                      {r.lanes.sourceLabel} → {r.lanes.targetLabel}
                    </p>
                    {r.hasConflictWarning ? <p className="text-[9px] font-bold text-red-700">Conflict</p> : null}
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
