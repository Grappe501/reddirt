export type ComplianceApprovalRole = "staff" | "treasurer" | "candidate" | "compliance_officer";

export type ComplianceApprovalStage =
  | "entered"
  | "reviewed"
  | "approved"
  | "reconciled"
  | "filing_certified";

export type ComplianceApprovalEvent = {
  id: string;
  recordId: string;
  recordType:
    | "money_movement"
    | "receipt"
    | "cash_contribution"
    | "vendor"
    | "reconciliation_match"
    | "filing_snapshot"
    | "amendment";
  stage: ComplianceApprovalStage;
  role: ComplianceApprovalRole;
  actorInitials: string;
  note?: string;
  overrideReason?: string;
  createdAt: string;
  before?: unknown;
  after?: unknown;
};

export type ComplianceApprovalChain = {
  recordId: string;
  currentStage: ComplianceApprovalStage;
  requiredRoles: ComplianceApprovalRole[];
  completedRoles: ComplianceApprovalRole[];
  events: ComplianceApprovalEvent[];
  humanReviewRequired: true;
};
