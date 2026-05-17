export type ReceiptPaymentMethod =
  | "campaign_card"
  | "campaign_check"
  | "personal_reimbursement"
  | "cash"
  | "unknown";

export type ReceiptReviewStatus =
  | "draft"
  | "extracted"
  | "needs_review"
  | "ready_for_approval"
  | "approved"
  | "rejected"
  | "staged_to_money_movement";

export type ReceiptTipStatus =
  | "no_tip"
  | "tip_on_receipt"
  | "tip_added_after"
  | "not_sure";

export type ReceiptExpenseCategory =
  | "meals"
  | "travel"
  | "lodging"
  | "fuel"
  | "printing"
  | "postage"
  | "event_supplies"
  | "office_supplies"
  | "software"
  | "advertising"
  | "fundraising"
  | "bank_fee"
  | "staff_payment"
  | "consulting"
  | "other"
  | "unknown";

export type ReceiptExtraction = {
  vendorName?: string;
  receiptDate?: string;
  receiptTime?: string;
  subtotal?: number;
  tax?: number;
  tip?: number;
  total?: number;
  paymentMethod?: ReceiptPaymentMethod;
  cardLastFour?: string;
  city?: string;
  state?: string;
  lineItems?: Array<{
    description: string;
    amount?: number;
  }>;
  suggestedCategory: ReceiptExpenseCategory;
  suggestedPurpose?: string;
  confidence: "high" | "medium" | "low";
  missingFields: string[];
  warnings: string[];
  humanReviewRequired: true;
};

export type StagedReceiptExpense = {
  id: string;
  createdAt: string;
  createdByInitials: string;

  imagePath?: string;
  imageHash?: string;
  sourceFileName?: string;

  extraction?: ReceiptExtraction;

  vendorName?: string;
  receiptDate?: string;
  subtotal?: number;
  tax?: number;
  tip?: number;
  total: number;

  tipStatus: ReceiptTipStatus;
  tipVerifiedByInitials?: string;
  tipVerificationNote?: string;

  paymentMethod: ReceiptPaymentMethod;
  cardLastFour?: string;
  checkNumber?: string;

  category: ReceiptExpenseCategory;
  businessPurpose?: string;

  reviewStatus: ReceiptReviewStatus;
  approvalStatus: "not_approved" | "approved" | "rejected";

  moneyMovementId?: string;
  bankTransactionId?: string;
  reconciliationStatus:
    | "awaiting_bank_match"
    | "possible_match"
    | "matched"
    | "ignored"
    | "needs_review";

  documentationStatus:
    | "receipt_attached"
    | "receipt_extracted"
    | "missing_receipt"
    | "needs_human_review"
    | "complete";

  warnings: string[];
  auditLogIds: string[];
};

export type ReceiptAuditLog = {
  id: string;
  receiptId?: string;
  moneyMovementId?: string;
  actorInitials: string;
  action:
    | "receipt_draft_created"
    | "receipt_uploaded"
    | "receipt_extracted"
    | "receipt_review_updated"
    | "tip_verified"
    | "approved"
    | "rejected"
    | "staged_to_money_movement"
    | "possible_duplicate_flagged";
  before?: unknown;
  after?: unknown;
  note?: string;
  createdAt: string;
};

export type ReceiptIntakeInput = {
  createdByInitials: string;
  vendorName?: string;
  receiptDate?: string;
  subtotal?: number;
  tax?: number;
  tip?: number;
  total: number;
  tipStatus?: ReceiptTipStatus;
  tipVerificationNote?: string;
  paymentMethod?: ReceiptPaymentMethod;
  cardLastFour?: string;
  checkNumber?: string;
  category?: ReceiptExpenseCategory;
  businessPurpose?: string;
  imagePath?: string;
  imageHash?: string;
  sourceFileName?: string;
  extraction?: ReceiptExtraction;
  reviewStatus?: ReceiptReviewStatus;
};
