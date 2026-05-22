/** Sprint 8 — event-level financial operations (factCard._eventFinance). */

export type ExpenseCategory =
  | "mileage"
  | "food"
  | "venue"
  | "printing"
  | "lodging"
  | "fuel"
  | "supplies"
  | "digital"
  | "miscellaneous";

export type ExpenseReimbursementStatus = "not_applicable" | "pending" | "approved" | "reimbursed" | "denied";

export type EventExpenseLine = {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: string;
  paid: boolean;
  reimbursementStatus: ExpenseReimbursementStatus;
  receiptDocumentId?: string;
  notes?: string;
};

export type EventBudgetBlock = {
  estimatedSpend: string;
  actualSpend: string;
  categoryBreakdown: string;
  hostContributions: string;
  donatedItems: string;
  volunteerSupportValue: string;
  reimbursementExposure: string;
  notes: string;
};

export type EventComplianceReadiness = {
  receiptCompleteness: string;
  reimbursementCompleteness: string;
  travelCompleteness: string;
  documentationCompleteness: string;
  reportingCompleteness: string;
  warningLevel: "low" | "medium" | "high";
  gaps: string[];
};

export type EventApprovalChain = {
  eventApprovedBy: string;
  eventApprovedAt: string;
  reimbursementReview: string;
  complianceReview: string;
  treasurerReview: string;
};

export type EventFinanceData = {
  budget: EventBudgetBlock;
  expenses: EventExpenseLine[];
  linkedReceiptIds: string[];
  compliance: EventComplianceReadiness;
  approvalChain: EventApprovalChain;
  executiveSummary: string;
  updatedAt?: string;
};

export type EventFinanceSectionId = "budget" | "expenses" | "receipts" | "compliance" | "approval_chain";
