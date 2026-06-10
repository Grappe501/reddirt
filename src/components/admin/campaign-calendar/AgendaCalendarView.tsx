"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { FranklinPlannerScaffold } from "./FranklinPlannerScaffold";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";
import { cal } from "./calendar-ui/calendar-design-tokens";

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
    <div className="space-y-5">
      <div>
        <p className={cal.kpiLabel}>Full ledger</p>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Agenda · sortable event ledger</h2>
        <p className="mt-1 font-body text-xs text-kelly-muted">{rows.length} events · approval and travel at a glance</p>
      </div>

      <FranklinPlannerScaffold focusYmd={focusYmd} />

      <div className={`${cal.glass} overflow-hidden p-0`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-kelly-text/10 bg-gradient-to-r from-kelly-navy/[0.04] to-kelly-gold/[0.06] text-left">
                {["Date", "Time", "Event", "Travel", "Status", "Alerts", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-copper">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.flatMap(([ymd, dayRows]) =>
                dayRows.map((r, idx) => (
                  <tr
                    key={r.recordId}
                    className={`border-b border-kelly-text/5 transition hover:bg-kelly-page/80 ${idx === 0 ? "border-t-2 border-t-kelly-gold/20" : ""}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-bold tabular-nums text-kelly-navy">{ymd}</td>
                    <td className="px-4 py-3 tabular-nums text-kelly-muted">{r.timeLabel}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-kelly-navy">{r.calendar.title}</p>
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
                    <td className="px-4 py-3 text-xs text-kelly-muted">{r.travelLine}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-kelly-navy">{r.eventStatus}</span>
                      <br />
                      <span className="text-kelly-muted">{r.decisionLabel ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.surface.alerts.map((a) => (
                          <span key={a.key} className="rounded-full bg-kelly-wash px-2 py-0.5 text-[10px] font-bold text-kelly-navy">
                            {a.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" className="mr-2 font-body text-xs font-bold text-kelly-navy underline" onClick={() => setReviewRecordId(r.recordId)}>
                        Review
                      </button>
                      <Link href={`/admin/campaign-events/${r.recordId}`} className="font-body text-xs font-bold text-kelly-copper underline">
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
    </div>
  );
}
