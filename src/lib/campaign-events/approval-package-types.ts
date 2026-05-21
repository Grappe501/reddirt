import type { WorkbenchEventRow } from "./merge-persisted-row";
import {
  advanceApprovalTimeline,
  defaultApprovalTimeline,
  parseApprovalTimeline,
  type ApprovalTimelineEntry,
  type ApprovalTimelineStatus,
} from "./approval-timeline";
import type { ApprovalEmailAssist } from "./approval-email/approval-email-assist";
import type { ApprovalEmailLogEntry } from "./approval-email/approval-email-log";
export type ApprovalPackageAction = {
  id: string;
  label: string;
  disabled: boolean;
  hint?: string;
};

export type ApprovalPackagePayload = {
  recordId: string;
  generatedAt: string;
  eventSummary: {
    title: string;
    dateYmd: string;
    timeLabel: string;
    eventType: string;
    city?: string;
    county?: string;
    status: string;
    reviewStatus: string;
  };
  aiAssumptions: Array<{ label: string; value: string }>;
  missingFields: string[];
  conflicts: Array<{ label: string; detail: string }>;
  travelEstimate: {
    line: string;
    roundTripMiles: number | null;
    reimbursementDisplay?: string;
  };
  recommendedDecision: string;
  actions: ApprovalPackageAction[];
  links: {
    workbenchUrl: string;
    drilldownUrl: string;
    packagePreviewUrl: string;
    secureTokenPlaceholder: string;
  };
  approvalStatusTimeline: ApprovalTimelineEntry[];
  recipientsPlaceholder: string[];
  /** Default To line for future candidate approval email (not sent). */
  candidateApprovalTo: string;
  emailSendEnabled: boolean;
  emailConfig: {
    sendEnabled: boolean;
    readyToSend: boolean;
    disabledReason: string | null;
    missingConfig: string[];
    provider: string;
    fromEmail: string;
  };
  emailAssist: ApprovalEmailAssist;
  lastEmailLog: ApprovalEmailLogEntry | null;
  tokenLinks: {
    review: string | null;
    approve: string | null;
    hold: string | null;
    deny: string | null;
    requestInfo: string | null;
  } | null;
};

export function buildApprovalTimelineFromRow(
  row: WorkbenchEventRow,
  storedTimeline?: ApprovalTimelineEntry[],
): ApprovalTimelineEntry[] {
  let timeline = storedTimeline?.length ? storedTimeline : defaultApprovalTimeline();

  if (row.rawDecision === "approved") timeline = advanceApprovalTimeline(timeline, "approved");
  if (row.rawDecision === "denied") timeline = advanceApprovalTimeline(timeline, "denied");
  if (row.rawDecision === "hold") timeline = advanceApprovalTimeline(timeline, "hold");
  if (row.rawReviewStatus === "IN_PROGRESS") timeline = advanceApprovalTimeline(timeline, "under_review");
  if (row.rawEventStatus === "TENTATIVE" && timeline.length === defaultApprovalTimeline().length) {
    timeline = advanceApprovalTimeline(timeline, "tentative_created");
  }

  return timeline;
}

export function statusIndex(status: ApprovalTimelineStatus): number {
  const order = [
    "tentative_created",
    "under_review",
    "awaiting_candidate",
    "awaiting_campaign_manager",
    "approved",
    "denied",
    "hold",
    "promoted_to_official_calendar",
  ] as const;
  return order.indexOf(status);
}
