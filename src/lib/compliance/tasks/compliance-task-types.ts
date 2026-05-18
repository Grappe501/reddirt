export type ComplianceTaskType =
  | "missing_donor_info"
  | "missing_receipt"
  | "missing_w9"
  | "missing_contract"
  | "missing_bank_match"
  | "possible_duplicate"
  | "over_cash_threshold"
  | "rule_verification_required"
  | "filing_blocker"
  | "amendment_candidate";

export type ComplianceTask = {
  id: string;
  type: ComplianceTaskType;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  assignedInitials?: string;
  relatedRecordLinks: Array<{ label: string; href: string; recordId: string }>;
  status: "open" | "in_progress" | "blocked" | "resolved" | "dismissed";
  notes: string[];
  createdAt: string;
  updatedAt: string;
};
