"use client";

import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, parseISO, startOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { CalendarEventChip } from "./CalendarEventChip";
import { CalendarMonthNavigator } from "./calendar-ui/CalendarMonthNavigator";
import { cal } from "./calendar-ui/calendar-design-tokens";

export function MonthCalendarView() {
  const { rows, setReviewRecordId, electionDayYmd, nowMs } = useCampaignCalendar();
  const today = new Date(nowMs);
  const electionDay = parseISO(electionDayYmd);
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

  const monthEventCount = useMemo(() => {
    const prefix = format(cursor, "yyyy-MM");
    return rows.filter((r) => r.dateYmd.startsWith(prefix)).length;
  }, [rows, cursor]);

  return (
    <div className="space-y-4">
      <CalendarMonthNavigator
        label={format(cursor, "MMMM yyyy")}
        subtitle={`${monthEventCount} events this month`}
        onPrev={() => setCursor(addMonths(cursor, -1))}
        onNext={() => setCursor(addMonths(cursor, 1))}
      />

      <div className="grid grid-cols-7 gap-1.5 text-center font-body text-[10px] font-bold uppercase tracking-wider text-kelly-copper md:gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {days.map((day) => {
          const ymd = format(day, "yyyy-MM-dd");
          const dayRows = byDay.get(ymd) ?? [];
          const inMonth = day.getMonth() === cursor.getMonth();
          const isToday = isSameDay(day, today);
          const isElection = isSameDay(day, electionDay);

          let cellClass = inMonth ? cal.monthCellIn : cal.monthCellOut;
          if (isToday && inMonth) cellClass += ` ${cal.monthCellToday}`;
          if (isElection && inMonth) cellClass += ` ${cal.monthCellElection}`;

          return (
            <div key={ymd} className={`${cal.monthCell} ${cellClass}`}>
              <div className="flex items-center justify-between">
                <p
                  className={`font-body text-[11px] font-bold tabular-nums ${isToday ? "text-kelly-gold" : isElection ? "text-kelly-navy" : "text-kelly-subtle"}`}
                >
                  {format(day, "d")}
                </p>
                {dayRows.length > 0 ? (
                  <span className="rounded-full bg-kelly-navy/10 px-1.5 py-0.5 font-body text-[9px] font-bold text-kelly-navy">
                    {dayRows.length}
                  </span>
                ) : null}
              </div>
              {isElection && inMonth ? (
                <p className="mt-0.5 font-body text-[8px] font-bold uppercase tracking-wide text-kelly-gold">Election</p>
              ) : null}
              <div className="mt-1.5 space-y-1">
                {dayRows.slice(0, 3).map((r) => (
                  <CalendarEventChip key={r.recordId} row={r} compact onSelect={setReviewRecordId} />
                ))}
                {dayRows.length > 3 ? (
                  <p className="font-body text-[9px] font-semibold text-kelly-copper">+{dayRows.length - 3} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
