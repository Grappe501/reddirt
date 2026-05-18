export type ComplianceReconciliationMatchType =
  | "goodchange_deposit_to_bank_deposit"
  | "cash_batch_to_bank_deposit"
  | "check_batch_to_bank_deposit"
  | "receipt_expense_to_bank_debit"
  | "travel_reimbursement_to_bank_debit"
  | "staff_vendor_payment_to_bank_debit"
  | "processor_fee_to_bank_fee"
  | "transfer"
  | "manual";

export type ComplianceReconciliationStatus =
  | "suggested"
  | "force_matched"
  | "split_match"
  | "transfer"
  | "ignored"
  | "variance_review"
  | "approved"
  | "locked";

export type ComplianceReconciliationMatch = {
  id: string;
  matchType: ComplianceReconciliationMatchType;
  status: ComplianceReconciliationStatus;
  confidence: "high" | "medium" | "low";
  bankTransactionIds: string[];
  moneyMovementIds: string[];
  sourceRecordIds: string[];
  bankAmount?: number;
  ledgerAmount?: number;
  variance?: number;
  reviewerInitials?: string;
  approvedAt?: string;
  lockedAt?: string;
  notes?: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
  updatedAt: string;
  humanReviewRequired: true;
};
