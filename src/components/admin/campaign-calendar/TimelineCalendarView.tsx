"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useCampaignCalendar } from "./campaign-calendar-context";
import { CalendarEventChip } from "./CalendarEventChip";
import { cal } from "./calendar-ui/calendar-design-tokens";

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
    <div className="space-y-5">
      <div className={`${cal.glassInset} border-kelly-navy/15 bg-gradient-to-r from-kelly-navy/[0.04] to-kelly-gold/[0.06] px-5 py-4`}>
        <p className={cal.kpiLabel}>Now → Election Day</p>
        <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">
          {daysToElection} days remaining
          <span className="ml-2 font-body text-sm font-normal text-kelly-muted">· {format(parseISO(electionDayYmd), "MMMM d, yyyy")}</span>
        </p>
        <p className="mt-1 font-body text-xs text-kelly-muted">Quiet gaps ≥{QUIET_GAP_DAYS} days compressed for clarity</p>
      </div>

      <ol className={cal.timelineSpine}>
        {segments.map((seg, i) =>
          seg.type === "gap" ? (
            <li key={`gap-${i}`} className="relative mb-8">
              <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full border-2 border-dashed border-kelly-gold/50 bg-white" />
              <p className="font-body text-xs italic text-kelly-muted">… {seg.label} …</p>
            </li>
          ) : (
            <li key={seg.row.recordId} className="relative mb-8">
              <span className={cal.timelineDot} />
              <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-copper">
                {seg.row.dateYmd} · {seg.row.timeLabel}
              </p>
              <CalendarEventChip row={seg.row} onSelect={setReviewRecordId} />
            </li>
          ),
        )}
      </ol>
      {!displayRows.length ? <p className="font-body text-sm text-kelly-muted">No events in timeline range.</p> : null}
    </div>
  );
}
