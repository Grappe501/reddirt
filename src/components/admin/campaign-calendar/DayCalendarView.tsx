"use client";

import { useMemo } from "react";
import { addDays, format, parseISO } from "date-fns";
import { useCampaignCalendar } from "./campaign-calendar-context";
import Link from "next/link";
import { FranklinPlannerScaffold } from "./FranklinPlannerScaffold";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";

export function DayCalendarView() {
  const { rows, focusYmd, setFocusYmd, setReviewRecordId } = useCampaignCalendar();
  const dayRows = useMemo(() => rows.filter((r) => r.dateYmd === focusYmd), [rows, focusYmd]);
  const cursor = parseISO(focusYmd);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-full border px-3 py-1 text-sm font-bold" onClick={() => setFocusYmd(format(addDays(cursor, -1), "yyyy-MM-dd"))}>
          ←
        </button>
        <h2 className="font-heading text-xl font-bold">{format(cursor, "EEEE, MMMM d, yyyy")}</h2>
        <button type="button" className="rounded-full border px-3 py-1 text-sm font-bold" onClick={() => setFocusYmd(format(addDays(cursor, 1), "yyyy-MM-dd"))}>
          →
        </button>
      </div>
      <FranklinPlannerScaffold focusYmd={focusYmd} />
      {dayRows.length === 0 ? (
        <p className="font-body text-sm text-kelly-muted">No events this day.</p>
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
              <article key={r.recordId} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-lg font-bold">{r.calendar.title}</h3>
                    <p className="font-body text-sm text-kelly-muted">
                      {r.timeLabel} · {r.classificationLabel} · {r.likelyCity ?? "City TBD"}
                      {r.county ? (
                        <>
                          {" "}
                          · <CountyWorkbenchLink countyLabel={r.county} className="inline" />
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy" onClick={() => setReviewRecordId(r.recordId)}>
                      Review
                    </button>
                    <Link href={`/admin/campaign-events/${r.recordId}`} className="rounded-full border px-3 py-1 text-xs font-bold">
                      Drilldown
                    </Link>
                  </div>
                </div>
                {r.hasWorkHoursWarning ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">{r.workHours.detail}</p>
                ) : null}
                <dl className="mt-3 grid gap-2 sm:grid-cols-2 font-body text-sm">
                  {slots.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-kelly-subtle">{label}</dt>
                      <dd>{value}</dd>
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
