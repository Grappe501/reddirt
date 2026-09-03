import Link from "next/link";
import {
  addYmd,
  calendarHeading,
  eachYmd,
  formatSchedulerClock,
  formatYmdLong,
  formatYmdMedium,
  monthEndYmd,
  monthStartYmd,
  shiftCalendarDate,
  startOfWeekSunday,
  type SchedulerCalendarView,
} from "@/lib/scheduler/calendar-range";
import { groupSchedulerRowsByYmd } from "@/lib/scheduler/load-calendar";
import type { SchedulerQueueRow } from "@/lib/scheduler/load-queue";

const VIEWS: { id: SchedulerCalendarView; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "campaign", label: "Campaign remaining" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function hrefFor(view: SchedulerCalendarView, dateYmd: string): string {
  if (view === "campaign") return "/scheduler/calendar?view=campaign";
  return `/scheduler/calendar?view=${view}&date=${dateYmd}`;
}

function EventCard({ row, compact }: { row: SchedulerQueueRow; compact?: boolean }) {
  return (
    <Link
      href={row.href}
      className={`block rounded-md border border-kelly-navy/15 bg-white hover:border-kelly-navy/40 ${
        compact ? "px-2 py-1.5" : "px-3 py-2"
      }`}
    >
      <p className={`font-body text-kelly-navy ${compact ? "text-[11px]" : "text-xs"}`}>
        {formatSchedulerClock(row.startAt)}
      </p>
      <p className={`font-heading font-bold text-kelly-text ${compact ? "text-xs leading-snug" : "text-sm"}`}>
        {row.title}
      </p>
      {!compact && row.locationName ? (
        <p className="mt-0.5 font-body text-xs text-kelly-text/65">{row.locationName}</p>
      ) : null}
    </Link>
  );
}

function DayList({ rows }: { rows: SchedulerQueueRow[] }) {
  if (rows.length === 0) {
    return <p className="font-body text-sm text-kelly-text/65">No public stops on this day.</p>;
  }
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.id}>
          <EventCard row={row} />
        </li>
      ))}
    </ul>
  );
}

export function SchedulerCalendarBoard({
  view,
  dateYmd,
  todayYmd,
  rows,
}: {
  view: SchedulerCalendarView;
  dateYmd: string;
  todayYmd: string;
  rows: SchedulerQueueRow[];
}) {
  const byDay = groupSchedulerRowsByYmd(rows);
  const prev = shiftCalendarDate(view, dateYmd, -1);
  const next = shiftCalendarDate(view, dateYmd, 1);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-kelly-text">Calendar</h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
          Same stops as the public calendar. Open a card to edit, publish, or archive.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((item) => (
          <Link
            key={item.id}
            href={hrefFor(item.id, dateYmd)}
            className={`rounded-full border px-3 py-1.5 font-body text-sm font-semibold ${
              view === item.id ? "border-kelly-navy bg-kelly-navy text-white" : "border-kelly-navy/20 bg-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-kelly-text">{calendarHeading(view, dateYmd)}</h2>
        {view === "campaign" ? (
          <Link
            href={hrefFor("week", todayYmd)}
            className="font-body text-sm font-semibold text-kelly-navy underline-offset-4 hover:underline"
          >
            This week
          </Link>
        ) : (
          <div className="flex flex-wrap gap-3 font-body text-sm font-semibold">
            <Link href={hrefFor(view, prev)} className="text-kelly-navy underline-offset-4 hover:underline">
              Previous
            </Link>
            <Link href={hrefFor(view, todayYmd)} className="text-kelly-navy underline-offset-4 hover:underline">
              Today
            </Link>
            <Link href={hrefFor(view, next)} className="text-kelly-navy underline-offset-4 hover:underline">
              Next
            </Link>
          </div>
        )}
      </div>
      {view === "day" ? <DayList rows={byDay.get(dateYmd) ?? []} /> : null}
      {view === "week" ? <WeekGrid dateYmd={dateYmd} todayYmd={todayYmd} byDay={byDay} /> : null}
      {view === "month" ? <MonthGrid dateYmd={dateYmd} todayYmd={todayYmd} byDay={byDay} /> : null}
      {view === "campaign" ? <CampaignList todayYmd={todayYmd} byDay={byDay} rows={rows} /> : null}
    </section>
  );
}

function WeekGrid({
  dateYmd,
  todayYmd,
  byDay,
}: {
  dateYmd: string;
  todayYmd: string;
  byDay: Map<string, SchedulerQueueRow[]>;
}) {
  const start = startOfWeekSunday(dateYmd);
  const days = eachYmd(start, addYmd(start, 6));
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[56rem] grid-cols-7 gap-2">
        {days.map((ymd, i) => {
          const isToday = ymd === todayYmd;
          return (
            <div
              key={ymd}
              className={`min-h-[12rem] rounded-card border p-2 ${
                isToday ? "border-kelly-navy bg-kelly-navy/[0.04]" : "border-kelly-navy/15 bg-kelly-page"
              }`}
            >
              <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-navy">
                {WEEKDAYS[i]} {Number(ymd.slice(8, 10))}
              </p>
              <div className="mt-2 space-y-1.5">
                {(byDay.get(ymd) ?? []).map((row) => (
                  <EventCard key={row.id} row={row} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid({
  dateYmd,
  todayYmd,
  byDay,
}: {
  dateYmd: string;
  todayYmd: string;
  byDay: Map<string, SchedulerQueueRow[]>;
}) {
  const monthStart = monthStartYmd(dateYmd);
  const monthEnd = monthEndYmd(dateYmd);
  const gridStart = startOfWeekSunday(monthStart);
  const gridEnd = addYmd(startOfWeekSunday(monthEnd), 6);
  const days = eachYmd(gridStart, gridEnd);
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[56rem] grid-cols-7 gap-1">
        {WEEKDAYS.map((label) => (
          <p key={label} className="px-1 pb-1 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-navy">
            {label}
          </p>
        ))}
        {days.map((ymd) => {
          const inMonth = ymd >= monthStart && ymd <= monthEnd;
          const isToday = ymd === todayYmd;
          return (
            <div
              key={ymd}
              className={`min-h-[8.5rem] rounded-md border p-1.5 ${
                isToday
                  ? "border-kelly-navy bg-kelly-navy/[0.04]"
                  : inMonth
                    ? "border-kelly-navy/15 bg-white"
                    : "border-kelly-navy/10 bg-kelly-page text-kelly-text/50"
              }`}
            >
              <p className="font-body text-[11px] font-semibold">{Number(ymd.slice(8, 10))}</p>
              <div className="mt-1 space-y-1">
                {(byDay.get(ymd) ?? []).map((row) => (
                  <EventCard key={row.id} row={row} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CampaignList({
  todayYmd,
  byDay,
  rows,
}: {
  todayYmd: string;
  byDay: Map<string, SchedulerQueueRow[]>;
  rows: SchedulerQueueRow[];
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-kelly-text/20 px-4 py-6 font-body text-sm text-kelly-text/70">
        No remaining public stops through November 3.
      </p>
    );
  }
  const weeks: { start: string; days: string[] }[] = [];
  const seen = new Set<string>();
  for (const ymd of [...byDay.keys()].sort()) {
    const start = startOfWeekSunday(ymd);
    if (seen.has(start)) continue;
    seen.add(start);
    weeks.push({ start, days: eachYmd(start, addYmd(start, 6)).filter((day) => day >= todayYmd && byDay.has(day)) });
  }
  return (
    <div className="space-y-8">
      {weeks.map((week) => (
        <section key={week.start} className="space-y-3">
          <h3 className="font-heading text-lg font-bold text-kelly-text">Week of {formatYmdMedium(week.start)}</h3>
          {week.days.map((ymd) => (
            <div key={ymd} className="space-y-2">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{formatYmdLong(ymd)}</p>
              <DayList rows={byDay.get(ymd) ?? []} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
