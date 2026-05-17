import type { CashSlipExtraction } from "./cash-slip-ocr-types";

export type CashContributionPolicy = {
  maxCashContributionAmount: number;
  idRequired: boolean;
  contributorInfoRequired: boolean;
  requireHumanReview: boolean;
  sourceNote: string;
  verifiedBy?: string;
  verifiedAt?: string;
};

export type StagedCashContribution = {
  id: string;
  intakeBatchId?: string;

  createdAt: string;
  createdByInitials: string;

  contributionDate: string;
  amount: number;

  donorFullName?: string;
  donorFirstName?: string;
  donorLastName?: string;
  donorAddress1?: string;
  donorCity?: string;
  donorState?: string;
  donorZip?: string;
  donorPhone?: string;
  donorEmail?: string;
  employer?: string;
  occupation?: string;

  idChecked: boolean;
  idCheckMethod?: "visual_check" | "not_recorded" | "not_required";
  idCheckedByInitials?: string;

  eventSource?: string;
  notes?: string;

  billPhotoPath?: string;
  donorSlipPhotoPath?: string;

  ocrExtraction?: CashSlipExtraction;

  complianceStatus:
    | "needs_review"
    | "missing_required_fields"
    | "amount_over_cash_limit"
    | "ready_for_approval"
    | "approved"
    | "rejected"
    | "converted_to_contribution";

  approvalStatus: "not_approved" | "approved" | "rejected";

  warnings: string[];
  auditLogIds: string[];
};

export type CashDepositBatch = {
  id: string;
  batchDate: string;
  contributionIds: string[];
  countedCashTotal: number;
  systemCashTotal: number;
  variance: number;
  preparedByInitials: string;
  reviewedByInitials?: string;
  depositedByInitials?: string;
  bankDepositDate?: string;
  bankTransactionId?: string;
  status:
    | "draft"
    | "ready_for_deposit"
    | "deposited"
    | "matched_to_bank"
    | "variance_review"
    | "closed";
  notes?: string;
};

export type CashIntakeAuditLog = {
  id: string;
  cashContributionId?: string;
  batchId?: string;
  actorInitials: string;
  action:
    | "cash_intake_created"
    | "ocr_extracted"
    | "cash_intake_modified"
    | "id_checked"
    | "approved"
    | "rejected"
    | "converted_to_contribution"
    | "batched"
    | "deposited"
    | "matched_to_bank"
    | "variance_flagged";
  before?: unknown;
  after?: unknown;
  note?: string;
  createdAt: string;
};

export type CashIntakeInput = {
  createdByInitials: string;
  contributionDate?: string;
  amount: number;
  billCount?: number;
  donorFullName?: string;
  donorFirstName?: string;
  donorLastName?: string;
  donorAddress1?: string;
  donorCity?: string;
  donorState?: string;
  donorZip?: string;
  donorPhone?: string;
  donorEmail?: string;
  employer?: string;
  occupation?: string;
  idChecked?: boolean;
  idCheckMethod?: "visual_check" | "not_recorded" | "not_required";
  idCheckedByInitials?: string;
  eventSource?: string;
  notes?: string;
  billPhotoPath?: string;
  donorSlipPhotoPath?: string;
  ocrExtraction?: CashSlipExtraction;
};
