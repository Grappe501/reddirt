import type { MonthReviewMode } from "../month-review/month-review-types";

export const MONTH_REVIEW_FOCUS_VALUES = [
  "missing_city",
  "missing_county",
  "missing_zip",
  "missing_mileage",
] as const;

export type MonthReviewFocus = (typeof MONTH_REVIEW_FOCUS_VALUES)[number];

export const MONTH_REVIEW_FOCUS_LABELS: Record<MonthReviewFocus, string> = {
  missing_city: "Missing city",
  missing_county: "Missing county",
  missing_zip: "Missing ZIP",
  missing_mileage: "Missing mileage (travel events)",
};

export function parseMonthReviewFocus(raw: string | null | undefined): MonthReviewFocus | null {
  if (raw && MONTH_REVIEW_FOCUS_VALUES.includes(raw as MonthReviewFocus)) return raw as MonthReviewFocus;
  return null;
}

export type ReadinessBand = "not_ready" | "in_progress" | "nearly_ready" | "ready";

export const READINESS_BAND_LABELS: Record<ReadinessBand, string> = {
  not_ready: "Not ready",
  in_progress: "In progress",
  nearly_ready: "Nearly ready",
  ready: "Ready for month close",
};

export function readinessBandForScore(score: number): ReadinessBand {
  if (score >= 95) return "ready";
  if (score >= 80) return "nearly_ready";
  if (score >= 50) return "in_progress";
  return "not_ready";
}

export type MonthReadinessQueueLink = {
  id: string;
  label: string;
  count: number;
  href: string;
  hint?: string;
};

export function buildReviewQueueHref(
  month: string,
  mode: MonthReviewMode,
  focus?: MonthReviewFocus | null,
  range?: { start?: string | null; end?: string | null; autostart?: boolean },
): string {
  const params = new URLSearchParams({ month, mode });
  if (focus) params.set("focus", focus);
  if (range?.start) params.set("start", range.start);
  if (range?.end) params.set("end", range.end);
  if (range?.autostart) params.set("autostart", "1");
  return `/admin/campaign-events/review?${params.toString()}`;
}
