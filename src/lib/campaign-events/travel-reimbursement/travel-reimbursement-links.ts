import type { MonthReviewFocus } from "../month-readiness/month-readiness-types";
import type { MonthReviewMode } from "../month-review/month-review-types";

export type TravelReimbursementRoute =
  | "travel-log"
  | "travel-report"
  | "reimbursement"
  | "review"
  | "workbench"
  | "month-readiness";

export function monthLabel(period: string): string {
  const [y, m] = period.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function travelLogHref(month: string, filter?: string): string {
  const p = new URLSearchParams({ month });
  if (filter && filter !== "all") p.set("filter", filter);
  return `/admin/campaign-events/travel-log?${p.toString()}`;
}

export function travelReportHref(month: string): string {
  return `/admin/campaign-events/travel-report?month=${month}`;
}

export function reimbursementHref(month: string): string {
  return `/admin/campaign-events/reimbursement?month=${month}`;
}

export function workbenchHref(month: string): string {
  return `/admin/campaign-events/workbench?month=${month}`;
}

export function monthReadinessHref(month: string): string {
  return `/admin/campaign-events/month-readiness?month=${month}`;
}

export function eventEditHref(recordId: string, month: string): string {
  return `/admin/campaign-events/${recordId}?from=travel&month=${month}`;
}

export function reviewHref(input: {
  month: string;
  mode?: MonthReviewMode;
  focus?: MonthReviewFocus | null;
  start?: string | null;
  end?: string | null;
  autostart?: boolean;
}): string {
  const params = new URLSearchParams({ month: input.month, mode: input.mode ?? "travel_needs_approval" });
  if (input.focus) params.set("focus", input.focus);
  if (input.start) params.set("start", input.start);
  if (input.end) params.set("end", input.end);
  if (input.autostart) params.set("autostart", "1");
  return `/admin/campaign-events/review?${params.toString()}`;
}

/** ISO week starting Monday for a date within month. */
export function weekRangeInMonth(month: string, weekIndex: number): { start: string; end: string } | null {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const weeks: Array<{ start: string; end: string }> = [];
  let cursor = 1;
  while (cursor <= lastDay) {
    const startDate = new Date(Date.UTC(y, m - 1, cursor));
    const dow = startDate.getUTCDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const weekStart = new Date(startDate);
    weekStart.setUTCDate(cursor + mondayOffset);
    const ws = Math.max(1, weekStart.getUTCDate());
    const we = Math.min(lastDay, ws + 6);
    weeks.push({
      start: `${y}-${String(m).padStart(2, "0")}-${String(ws).padStart(2, "0")}`,
      end: `${y}-${String(m).padStart(2, "0")}-${String(we).padStart(2, "0")}`,
    });
    cursor = we + 1;
  }
  return weeks[weekIndex] ?? null;
}

export function parseTravelLogFilter(raw: string | null | undefined): string {
  const allowed = [
    "all",
    "needs_city_county",
    "needs_mileage",
    "unreviewed",
    "approved",
    "denied",
    "hold",
    "reimbursable_only",
    "needs_approval",
  ];
  if (raw && allowed.includes(raw)) return raw;
  return "all";
}
