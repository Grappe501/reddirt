/** Sprint 8 — finance documents (JSON index; files under data/campaign-events/finance/). */

export type FinanceDocumentType =
  | "receipt"
  | "invoice"
  | "reimbursement_form"
  | "expense_memo"
  | "hotel_confirmation"
  | "fuel_receipt"
  | "event_invoice"
  | "other";

export type FinanceDocumentApprovalStatus = "pending" | "approved" | "rejected" | "needs_review";

export type FinanceDocumentRecord = {
  id: string;
  documentType: FinanceDocumentType;
  eventRecordId: string;
  eventTitle: string;
  period: string;
  county: string;
  uploaderName: string;
  uploaderEmail: string;
  originalFilename: string;
  storedPath: string;
  mimeType: string;
  approvalStatus: FinanceDocumentApprovalStatus;
  reimbursementStatus: "not_linked" | "linked" | "reimbursed";
  linkedExpenseId?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type FinanceDocumentIndex = {
  version: 1;
  items: FinanceDocumentRecord[];
};
