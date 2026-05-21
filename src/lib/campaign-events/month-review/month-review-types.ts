export const MONTH_REVIEW_MODES = [
  "chronological",
  "type",
  "county",
  "region",
  "status",
  "needs_info",
  "work_hours",
  "conflicts",
  "reimbursable",
  "tentative_only",
  "unreviewed_only",
  "travel_needs_approval",
  "approved_travel",
  "denied_travel",
  "website_intake_only",
  "needs_intake_review",
  "duplicate_risk",
  "intake_conflict",
] as const;

export type MonthReviewMode = (typeof MONTH_REVIEW_MODES)[number];

export const MONTH_REVIEW_MODE_LABELS: Record<MonthReviewMode, string> = {
  chronological: "Chronological",
  type: "By event type",
  county: "By county",
  region: "By region",
  status: "By review status",
  needs_info: "Needs information",
  work_hours: "Work-hours warnings",
  conflicts: "Conflicts",
  reimbursable: "Reimbursable travel",
  tentative_only: "Tentative only",
  unreviewed_only: "Unreviewed only",
  travel_needs_approval: "Travel — needs approval",
  approved_travel: "Travel — approved",
  denied_travel: "Travel — denied",
  website_intake_only: "Website intake only",
  needs_intake_review: "Needs intake review",
  duplicate_risk: "Duplicate risk",
  intake_conflict: "Intake schedule conflict",
};

export function parseReviewDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): { start: string | null; end: string | null } {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  return {
    start: start && iso.test(start) ? start : null,
    end: end && iso.test(end) ? end : null,
  };
}

export function parseMonthReviewMode(raw: string | null | undefined): MonthReviewMode {
  if (raw && MONTH_REVIEW_MODES.includes(raw as MonthReviewMode)) return raw as MonthReviewMode;
  return "chronological";
}

export function parseReviewMonth(raw: string | null | undefined, defaultMonth = "2026-03"): string {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) return raw;
  return defaultMonth;
}
