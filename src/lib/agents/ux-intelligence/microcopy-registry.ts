import type { CampaignUserRole } from "../user-intelligence/user-personas";

export type MicrocopyTerm =
  | "tentative_event"
  | "official_event"
  | "reimbursement"
  | "travel_candidate"
  | "needs_review"
  | "hold"
  | "request_info"
  | "calendar_promotion"
  | "sync_stale"
  | "missing_mileage"
  | "readiness_score"
  | "hot_wash"
  | "run_of_show"
  | "approval_package";

export type MicrocopyEntry = {
  term: MicrocopyTerm;
  shortTooltip: string;
  expanded: string;
  roleHints?: Partial<Record<CampaignUserRole, string>>;
  relatedAction?: { label: string; href: string };
};

const ENTRIES: MicrocopyEntry[] = [
  {
    term: "tentative_event",
    shortTooltip: "Proposed — not on official calendar yet",
    expanded: "A tentative event is in the campaign ledger for review. It may exist on a Kelly tentative Google calendar only after explicit promotion.",
    roleHints: { candidate: "Needs your approve/deny/hold before it becomes official." },
    relatedAction: { label: "Review queue", href: "/admin/campaign-events/review" },
  },
  {
    term: "official_event",
    shortTooltip: "Approved for official calendar lane",
    expanded: "Official events are approved and may be promoted to the confirmed Kelly Google calendar with human click + env gate.",
    relatedAction: { label: "Calendar promotion", href: "/admin/campaign-events/calendar-promotion" },
  },
  {
    term: "reimbursement",
    shortTooltip: "Travel reimbursement request packet",
    expanded: "Monthly print-ready reimbursement built from approved travel lines. Does not auto-post to finance systems.",
    roleHints: { treasurer: "Verify mileage and approvals before printing." },
    relatedAction: { label: "Reimbursement page", href: "/admin/campaign-events/reimbursement" },
  },
  {
    term: "travel_candidate",
    shortTooltip: "Travel attributed to candidate",
    expanded: "Round-trip miles and reimbursement amounts tied to ledger travel fields.",
    relatedAction: { label: "Travel report", href: "/admin/campaign-events/travel-report" },
  },
  {
    term: "needs_review",
    shortTooltip: "Operator review required",
    expanded: "Data or decision is incomplete — a human should confirm before month close or promotion.",
  },
  {
    term: "hold",
    shortTooltip: "Decision paused",
    expanded: "Event is on hold — not denied. Resolve blockers then approve or deny.",
  },
  {
    term: "request_info",
    shortTooltip: "More information needed",
    expanded: "Operator or candidate requested missing fields before approval.",
  },
  {
    term: "calendar_promotion",
    shortTooltip: "Human push to Google Calendar",
    expanded: "Promotion copies an approved ledger event to Kelly tentative or official Google Calendar. Never automatic.",
    relatedAction: { label: "Promotion workbench", href: "/admin/campaign-events/calendar-promotion" },
  },
  {
    term: "sync_stale",
    shortTooltip: "Calendar data may be out of date",
    expanded: "Normalized JSON or Google read is older than expected. Refresh before trusting match badges.",
    relatedAction: { label: "Calendar sync", href: "/admin/campaign-events/calendar-sync" },
  },
  {
    term: "missing_mileage",
    shortTooltip: "Round-trip miles not set",
    expanded: "Reimbursement and travel report need mileage — use travel assist in month review.",
    relatedAction: { label: "Travel log", href: "/admin/campaign-events/travel-log" },
  },
  {
    term: "readiness_score",
    shortTooltip: "Month close readiness %",
    expanded: "Weighted score from missing fields, approvals, and travel gaps. Does not auto-block saves.",
    relatedAction: { label: "Month readiness", href: "/admin/campaign-events/month-readiness" },
  },
  {
    term: "hot_wash",
    shortTooltip: "Post-event notes and media",
    expanded: "After-action capture — notes and uploads for learning, not auto-published.",
  },
  {
    term: "run_of_show",
    shortTooltip: "Event timing sequence",
    expanded: "Run-of-show timing for setup, program, and departure — drilldown tab (partial).",
  },
  {
    term: "approval_package",
    shortTooltip: "Candidate approval email package",
    expanded: "Summary + links for Kelly to approve, hold, or deny. Send is gated by EMAIL_SEND_ENABLED.",
    relatedAction: { label: "Approval package", href: "/admin/campaign-calendar/approval-package" },
  },
];

const BY_TERM = new Map(ENTRIES.map((e) => [e.term, e]));

export function getMicrocopy(term: MicrocopyTerm, role?: CampaignUserRole): MicrocopyEntry | null {
  const entry = BY_TERM.get(term);
  if (!entry) return null;
  if (!role || !entry.roleHints?.[role]) return entry;
  return {
    ...entry,
    expanded: entry.roleHints[role] ?? entry.expanded,
  };
}

export function listMicrocopyTerms(): MicrocopyTerm[] {
  return [...BY_TERM.keys()];
}
