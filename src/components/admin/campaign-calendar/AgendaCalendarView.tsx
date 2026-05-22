"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { FranklinPlannerScaffold } from "./FranklinPlannerScaffold";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";

export function AgendaCalendarView() {
  const { rows, setReviewRecordId, focusYmd } = useCampaignCalendar();

  const grouped = useMemo(() => {
    const m = new Map<string, typeof rows>();
    for (const r of rows) {
      const list = m.get(r.dateYmd) ?? [];
      list.push(r);
      m.set(r.dateYmd, list);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="space-y-4">
      <FranklinPlannerScaffold focusYmd={focusYmd} />
    <div className="overflow-x-auto rounded-2xl border border-kelly-text/10">
      <table className="w-full min-w-[720px] border-collapse font-body text-sm">
        <thead>
          <tr className="border-b bg-kelly-wash text-left text-xs font-bold uppercase text-kelly-slate">
            <th className="p-3">Date</th>
            <th className="p-3">Time</th>
            <th className="p-3">Event</th>
            <th className="p-3">Travel</th>
            <th className="p-3">Status</th>
            <th className="p-3">Alerts</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {grouped.flatMap(([ymd, dayRows]) =>
            dayRows.map((r) => (
              <tr key={r.recordId} className="border-b border-kelly-text/5 hover:bg-kelly-wash/50">
                <td className="p-3 whitespace-nowrap font-bold">{ymd}</td>
                <td className="p-3">{r.timeLabel}</td>
                <td className="p-3">
                  <p className="font-semibold">{r.calendar.title}</p>
                  <p className="text-xs text-kelly-muted">
                    {r.classificationLabel}
                    {r.county ? (
                      <>
                        {" "}
                        · <CountyWorkbenchLink countyLabel={r.county} />
                      </>
                    ) : null}
                  </p>
                </td>
                <td className="p-3 text-xs">{r.travelLine}</td>
                <td className="p-3 text-xs">
                  {r.eventStatus}
                  <br />
                  {r.decisionLabel ?? "—"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {r.surface.alerts.map((a) => (
                      <span key={a.key} className="rounded bg-kelly-wash px-1 text-[10px] font-bold">
                        {a.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <button type="button" className="mr-2 text-xs font-bold text-kelly-navy" onClick={() => setReviewRecordId(r.recordId)}>
                    Review
                  </button>
                  <Link href={`/admin/campaign-events/${r.recordId}`} className="text-xs font-bold underline">
                    Open
                  </Link>
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
