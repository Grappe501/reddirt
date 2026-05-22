/**
 * Approval package lifecycle — scaffold only; no email send.
 */

export const APPROVAL_STATUS_TIMELINE = [
  "tentative_created",
  "under_review",
  "awaiting_candidate",
  "awaiting_campaign_manager",
  "approved",
  "denied",
  "hold",
  "promoted_to_official_calendar",
] as const;

export type ApprovalTimelineStatus = (typeof APPROVAL_STATUS_TIMELINE)[number];

export type ApprovalTimelineEntry = {
  status: ApprovalTimelineStatus;
  at?: string;
  note?: string;
  actor?: string;
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalTimelineStatus, string> = {
  tentative_created: "Tentative created",
  under_review: "Under review",
  awaiting_candidate: "Awaiting candidate",
  awaiting_campaign_manager: "Awaiting campaign manager",
  approved: "Approved",
  denied: "Denied",
  hold: "On hold",
  promoted_to_official_calendar: "Promoted to official calendar",
};

export function defaultApprovalTimeline(): ApprovalTimelineEntry[] {
  return [{ status: "tentative_created" }, { status: "under_review" }];
}

export function parseApprovalTimeline(raw: unknown): ApprovalTimelineEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaultApprovalTimeline();
  const parsed = raw.filter(
    (e): e is ApprovalTimelineEntry =>
      !!e &&
      typeof e === "object" &&
      APPROVAL_STATUS_TIMELINE.includes((e as ApprovalTimelineEntry).status),
  );
  return parsed.length ? parsed : defaultApprovalTimeline();
}

export function advanceApprovalTimeline(
  timeline: ApprovalTimelineEntry[],
  status: ApprovalTimelineStatus,
  note?: string,
  actor?: string,
): ApprovalTimelineEntry[] {
  const at = new Date().toISOString();
  const existing = timeline.find((t) => t.status === status);
  if (existing) {
    return timeline.map((t) =>
      t.status === status ? { ...t, at: t.at ?? at, note: note ?? t.note, actor: actor ?? t.actor } : t,
    );
  }
  return [...timeline, { status, at, note, actor }];
}
