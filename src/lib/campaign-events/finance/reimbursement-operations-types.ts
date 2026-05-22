/** Sprint 8 — reimbursement operations pipeline (extends month workflow). */

export type ReimbursementPipelineStatus =
  | "draft"
  | "pending_review"
  | "awaiting_receipts"
  | "ready_for_reimbursement"
  | "reimbursed"
  | "archived";

export const REIMBURSEMENT_PIPELINE_LABELS: Record<ReimbursementPipelineStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  awaiting_receipts: "Awaiting receipts",
  ready_for_reimbursement: "Ready for reimbursement",
  reimbursed: "Reimbursed",
  archived: "Archived",
};

export type ReimbursementAuditEntry = {
  at: string;
  actor: string;
  action: string;
  note?: string;
  recordId?: string;
};

export type ReimbursementException = {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
  recordId?: string;
};

export type ReimbursementPacketDraft = {
  month: string;
  generatedAt: string;
  travelLineCount: number;
  receiptCount: number;
  expenseNoteCount: number;
  auditNote: string;
  approvalHistorySummary: string;
};

export type ReimbursementMonthOperations = {
  month: string;
  pipelineStatus: ReimbursementPipelineStatus;
  auditHistory: ReimbursementAuditEntry[];
  exceptions: ReimbursementException[];
  lastPacket?: ReimbursementPacketDraft;
  updatedAt: string;
};
