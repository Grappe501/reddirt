export type ApprovalItemSource =
  | "goodchange_contribution"
  | "bank_transaction"
  | "receipt_expense"
  | "cash_contribution"
  | "check_contribution"
  | "in_kind_contribution"
  | "vendor_payment"
  | "staff_1099_payment"
  | "travel_reimbursement"
  | "processor_fee"
  | "loan"
  | "debt"
  | "manual_money_movement"
  | "filing_task"
  | "rule_review";

export type ApprovalItemStatus =
  | "queued"
  | "needs_review"
  | "ready"
  | "approved"
  | "approved_with_changes"
  | "needs_info"
  | "rejected"
  | "duplicate"
  | "skipped"
  | "reopened";

export type ApprovalRiskLevel = "low" | "medium" | "high" | "blocked";

export type ApprovalAiRecommendation =
  | "approve"
  | "approve_with_changes"
  | "needs_info"
  | "reject"
  | "duplicate"
  | "manual_review";

export type ApprovalFieldType =
  | "text"
  | "number"
  | "money"
  | "date"
  | "select"
  | "textarea"
  | "boolean";

export type ApprovalFieldSource =
  | "ai_extracted"
  | "imported"
  | "ocr"
  | "bank"
  | "goodchange"
  | "manual"
  | "system";

export type ApprovalFieldValidationStatus = "ok" | "missing" | "warning" | "blocked";

export type ApprovalField = {
  key: string;
  label: string;
  value?: string | number | boolean | null;
  proposedValue?: string | number | boolean | null;
  fieldType: ApprovalFieldType;
  required: boolean;
  editable: boolean;
  source: ApprovalFieldSource;
  confidence: "high" | "medium" | "low";
  validationStatus: ApprovalFieldValidationStatus;
  options?: string[];
};

export type ApprovalEvidenceType =
  | "receipt_image"
  | "cash_slip"
  | "bill_photo"
  | "check_image"
  | "goodchange_row"
  | "bank_row"
  | "ocr_text"
  | "rule_citation"
  | "audit_note"
  | "source_file";

export type ApprovalEvidence = {
  id: string;
  type: ApprovalEvidenceType;
  title: string;
  summary?: string;
  path?: string;
  url?: string;
  textPreview?: string;
  confidence?: "high" | "medium" | "low";
};

export type ApprovalItem = {
  id: string;
  queueId: string;
  source: ApprovalItemSource;
  sourceRecordId: string;
  title: string;
  subtitle?: string;
  amount?: number;
  date?: string;
  entityName?: string;
  status: ApprovalItemStatus;
  riskLevel: ApprovalRiskLevel;
  confidenceScore: number;
  aiSummary: string;
  aiRecommendation: ApprovalAiRecommendation;
  fields: ApprovalField[];
  evidence: ApprovalEvidence[];
  warnings: string[];
  blockers: string[];
  missingFields: string[];
  suggestedNotes: string[];
  auditTrailIds: string[];
  sourceUpdatePending?: boolean;
  duplicateOfId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalQueue = {
  id: string;
  label: string;
  description: string;
  filterTags: string[];
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ApprovalAuditAction =
  | "field_edits_saved"
  | "approved"
  | "approved_with_changes"
  | "needs_info"
  | "rejected"
  | "duplicate"
  | "skipped"
  | "reopened"
  | "batch_approved"
  | "override_approve"
  | "voice_command";

export type ApprovalAuditEntry = {
  id: string;
  itemId: string;
  queueId: string;
  action: ApprovalAuditAction;
  actorInitials: string;
  note?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changedFields?: string[];
  voiceTranscript?: string;
  createdAt: string;
};

export type ApprovalQueueStats = {
  total: number;
  approved: number;
  approvedWithChanges: number;
  needsInfo: number;
  rejected: number;
  duplicate: number;
  skipped: number;
  remaining: number;
  highRisk: number;
  blockerCount: number;
  dollarsReviewed: number;
  dollarsRemaining: number;
};

export type ApprovalWorkbenchAgentResult = {
  itemId: string;
  plainEnglishSummary: string;
  confidenceScore: number;
  riskLevel: ApprovalRiskLevel;
  recommendedAction: ApprovalAiRecommendation;
  reasons: string[];
  missingFields: string[];
  warningFlags: string[];
  suggestedNotes: string[];
  nextBestQuestion?: string;
  humanApprovalRequired: true;
};
