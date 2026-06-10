import { differenceInCalendarDays, parseISO } from "date-fns";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";

export type CalendarSurfaceStats = {
  totalEvents: number;
  upcomingEvents: number;
  needsApproval: number;
  tentativeEvents: number;
  conflictEvents: number;
  uniqueCounties: number;
  daysToElection: number;
  electionDayYmd: string;
};

export function computeCalendarSurfaceStats(
  rows: CalendarSurfaceRow[],
  electionDayYmd: string,
  nowMs: number,
): CalendarSurfaceStats {
  const upcomingEvents = rows.filter((r) => r.startAtMs >= nowMs).length;
  const needsApproval = rows.filter((r) => r.surface.missingApproval).length;
  const tentativeEvents = rows.filter((r) => r.surface.isTentative).length;
  const conflictEvents = rows.filter((r) => r.hasConflictWarning).length;
  const uniqueCounties = new Set(rows.map((r) => r.county).filter(Boolean)).size;
  const daysToElection = differenceInCalendarDays(parseISO(electionDayYmd), new Date(nowMs));

  return {
    totalEvents: rows.length,
    upcomingEvents,
    needsApproval,
    tentativeEvents,
    conflictEvents,
    uniqueCounties,
    daysToElection,
    electionDayYmd,
  };
}
