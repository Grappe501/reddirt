"use client";

import { useMemo } from "react";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import Link from "next/link";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { FranklinPlannerScaffold } from "./FranklinPlannerScaffold";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";
import { CalendarMonthNavigator } from "./calendar-ui/CalendarMonthNavigator";
import { cal } from "./calendar-ui/calendar-design-tokens";

export function DayCalendarView() {
  const { rows, focusYmd, setFocusYmd, setReviewRecordId, nowMs } = useCampaignCalendar();
  const dayRows = useMemo(() => rows.filter((r) => r.dateYmd === focusYmd), [rows, focusYmd]);
  const cursor = parseISO(focusYmd);
  const isToday = isSameDay(cursor, new Date(nowMs));

  return (
    <div className="space-y-5">
      <CalendarMonthNavigator
        label={format(cursor, "EEEE, MMMM d, yyyy")}
        subtitle={isToday ? "Today · Kelly's operational day" : `${dayRows.length} events scheduled`}
        onPrev={() => setFocusYmd(format(addDays(cursor, -1), "yyyy-MM-dd"))}
        onNext={() => setFocusYmd(format(addDays(cursor, 1), "yyyy-MM-dd"))}
      />

      <FranklinPlannerScaffold focusYmd={focusYmd} />

      {dayRows.length === 0 ? (
        <div className={`${cal.glassInset} py-12 text-center`}>
          <p className="font-body text-sm text-kelly-muted">No events this day — open Week or Month to plan.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {dayRows.map((r) => {
            const when = r.factCard.when;
            const slots = [
              ["Setup", when.setupTime],
              ["Volunteer arrival", when.volunteerArrivalTime],
              ["Candidate arrival", when.arrivalTime],
              ["Speaking", r.factCard.what.speakingTime ?? r.factCard.what.speakingSlot],
              ["Departure", when.departureTime],
              ["Travel window", r.travelLine],
            ].filter(([, v]) => v);
            return (
              <article key={r.recordId} className={`${cal.glass} border-l-4 border-l-kelly-navy p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={cal.kpiLabel}>{r.timeLabel}</p>
                    <h3 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{r.calendar.title}</h3>
                    <p className="mt-1 font-body text-sm text-kelly-muted">
                      {r.classificationLabel} · {r.likelyCity ?? "City TBD"}
                      {r.county ? (
                        <>
                          {" "}
                          · <CountyWorkbenchLink countyLabel={r.county} className="inline" />
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className={cal.btnGhost} onClick={() => setReviewRecordId(r.recordId)}>
                      Review
                    </button>
                    <Link href={`/admin/campaign-events/${r.recordId}`} className={cal.btnPrimary}>
                      Open event
                    </Link>
                  </div>
                </div>
                {r.hasWorkHoursWarning ? (
                  <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-950">{r.workHours.detail}</p>
                ) : null}
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 font-body text-sm">
                  {slots.map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-kelly-page/60 px-3 py-2">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-kelly-copper">{label}</dt>
                      <dd className="mt-0.5 font-medium text-kelly-navy">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
