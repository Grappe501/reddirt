"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { CalendarEventChip } from "./CalendarEventChip";

const QUIET_GAP_DAYS = 7;

export function TimelineCalendarView() {
  const { rows, electionDayYmd, nowMs, setReviewRecordId } = useCampaignCalendar();

  const futureRows = useMemo(() => rows.filter((r) => r.startAtMs >= nowMs - 86400000), [rows, nowMs]);
  const displayRows = futureRows.length ? futureRows : rows;

  const segments = useMemo(() => {
    const out: Array<{ type: "gap"; days: number; label: string } | { type: "event"; row: (typeof rows)[0] }> = [];
    let prevMs: number | null = null;
    for (const row of displayRows) {
      if (prevMs != null) {
        const gapDays = Math.round((row.startAtMs - prevMs) / 86400000);
        if (gapDays >= QUIET_GAP_DAYS) {
          out.push({ type: "gap", days: gapDays, label: `${gapDays} days between events (compressed)` });
        }
      }
      out.push({ type: "event", row });
      prevMs = row.startAtMs;
    }
    return out;
  }, [displayRows]);

  const daysToElection = differenceInCalendarDays(parseISO(electionDayYmd), new Date(nowMs));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] px-4 py-3 font-body text-sm">
        <strong>Now → Election Day</strong> ({electionDayYmd}) · {daysToElection} days remaining · quiet gaps ≥{QUIET_GAP_DAYS}d compressed
      </div>
      <ol className="relative border-l-2 border-kelly-navy/20 pl-6">
        {segments.map((seg, i) =>
          seg.type === "gap" ? (
            <li key={`gap-${i}`} className="mb-6 ml-2 font-body text-xs italic text-kelly-subtle">
              … {seg.label} …
            </li>
          ) : (
            <li key={seg.row.recordId} className="mb-6">
              <span className="absolute -left-[9px] mt-2 h-4 w-4 rounded-full border-2 border-kelly-page bg-kelly-navy" />
              <p className="mb-1 font-body text-xs font-bold uppercase text-kelly-slate">{seg.row.dateYmd}</p>
              <CalendarEventChip row={seg.row} onSelect={setReviewRecordId} />
            </li>
          ),
        )}
      </ol>
      {!displayRows.length ? <p className="font-body text-sm text-kelly-muted">No events in timeline range.</p> : null}
    </div>
  );
}
