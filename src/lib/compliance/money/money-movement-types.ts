export type MoneyDirection = "in" | "out" | "neutral";

export type MoneyMovementSource =
  | "goodchange"
  | "cash_intake"
  | "check_intake"
  | "bank_csv"
  | "manual_entry"
  | "receipt_intake"
  | "travel_ledger"
  | "credit_card"
  | "processor_fee"
  | "refund"
  | "loan"
  | "in_kind"
  | "transfer"
  | "correction";

export type MoneyMovementCategory =
  | "contribution_cash"
  | "contribution_check"
  | "contribution_credit_card"
  | "contribution_in_kind"
  | "contribution_refund"
  | "processor_fee"
  | "bank_fee"
  | "cash_expense"
  | "staff_1099_payment"
  | "vendor_payment"
  | "travel_reimbursement"
  | "loan_received"
  | "loan_repayment"
  | "debt_obligation"
  | "transfer"
  | "void"
  | "unknown";

export type MoneyMovementReviewStatus =
  | "staged"
  | "needs_review"
  | "ready_for_approval"
  | "approved"
  | "rejected"
  | "matched_to_bank"
  | "converted_to_ledger";

export type StagedMoneyMovement = {
  id: string;
  source: MoneyMovementSource;
  direction: MoneyDirection;
  category: MoneyMovementCategory;

  amount: number;
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number;

  transactionDate?: string;
  postedDate?: string;
  depositDate?: string;

  name?: string;
  entityType?: "individual" | "business" | "committee" | "staff" | "vendor" | "unknown";

  address1?: string;
  city?: string;
  state?: string;
  zip?: string;

  employer?: string;
  occupation?: string;

  paymentMethod?: "cash" | "check" | "credit_card" | "debit_card" | "ach" | "wire" | "other" | "unknown";
  checkNumber?: string;
  processorTransactionId?: string;
  bankTransactionId?: string;
  reconciliationStatus?: "awaiting_bank_match" | "possible_match" | "matched" | "ignored" | "needs_review";

  description?: string;
  purpose?: string;
  memo?: string;

  documentationStatus:
    | "complete"
    | "missing_receipt"
    | "missing_invoice"
    | "missing_donor_info"
    | "missing_w9"
    | "missing_contract"
    | "needs_review";

  reviewStatus: MoneyMovementReviewStatus;
  approvalStatus: "not_approved" | "approved" | "rejected";

  warnings: string[];
  missingFields: string[];
  sourceRefs: string[];

  createdAt: string;
  updatedAt: string;
};

export type ComplianceVendor = {
  id: string;
  name: string;
  entityType: "individual" | "business" | "staff" | "vendor";
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  email?: string;
  phone?: string;
  w9Status: "missing" | "requested" | "received" | "not_required";
  contractStatus: "missing" | "received" | "not_required";
  ytdPaid: number;
  likely1099Required: boolean;
  notes?: string;
};

export type MoneyAuditLog = {
  id: string;
  moneyMovementId?: string;
  vendorId?: string;
  actorInitials: string;
  action:
    | "intake_created"
    | "field_edited"
    | "document_attached"
    | "classified"
    | "approved"
    | "rejected"
    | "matched_to_bank"
    | "converted_to_compliance_ledger"
    | "batch_created"
    | "batch_deposited"
    | "warning_overridden"
    | "vendor_created";
  before?: unknown;
  after?: unknown;
  sourceRoute?: string;
  note?: string;
  createdAt: string;
};

export type MoneyMovementInput = Partial<StagedMoneyMovement> & {
  source: MoneyMovementSource;
  direction: MoneyDirection;
  category: MoneyMovementCategory;
  amount: number;
  actorInitials: string;
  sourceRoute?: string;
};

export type MoneyCoverageSummary = {
  totalMoneyInStaged: number;
  totalMoneyOutStaged: number;
  approvedMoneyIn: number;
  approvedMoneyOut: number;
  unreconciledDeposits: number;
  unreconciledExpenses: number;
  processorFees: number;
  cashPendingDeposit: number;
  checksPendingDeposit: number;
  missingW9: number;
  missingReceipts: number;
  missingDonorInfo: number;
  readyForFilingCount: number;
  needsReviewCount: number;
};
