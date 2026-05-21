import type { OfficialReimbursementReport } from "./reimbursement-report";
import type { TravelQueueVerification } from "./queue-verification";

/** Client-safe types and labels (no filesystem / JSON store). */

export type ReimbursementMonthStatusValue = "draft" | "needs_review" | "ready" | "finalized";

export type ReimbursementMonthStatusHistoryEntry = {
  at: string;
  by: string;
  action: "mark_ready" | "finalize" | "reopen_draft" | "auto_note";
  note?: string;
};

export type ReimbursementMonthStatusRecord = {
  status: ReimbursementMonthStatusValue;
  finalizedAt?: string;
  finalizedBy?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  updatedAt: string;
  history: ReimbursementMonthStatusHistoryEntry[];
};

export type ReimbursementMonthStatusContext = {
  month: string;
  computedStatus: ReimbursementMonthStatusValue;
  effectiveStatus: ReimbursementMonthStatusValue;
  stored: ReimbursementMonthStatusRecord | null;
  queues: TravelQueueVerification;
  report: OfficialReimbursementReport;
  blockingFinalize: string[];
  canMarkReady: boolean;
  canFinalize: boolean;
  canReopen: boolean;
};

export const REIMBURSEMENT_STATUS_LABELS: Record<ReimbursementMonthStatusValue, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  ready: "Ready",
  finalized: "Finalized",
};
