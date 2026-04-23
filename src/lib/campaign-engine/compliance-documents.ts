/**
 * COMP-2: Compliance document upload metadata vocabulary — **aligns** with `ComplianceDocumentType` in `schema.prisma`.
 * @see docs/compliance-document-ingest-foundation.md
 */

export const COM2_PACKET = "COMP-2" as const;

/** Mirror of Prisma `ComplianceDocumentType` string values (keep in sync when schema changes). */
export const ComplianceDocumentType = {
  SOS_ETHICS_FORM: "SOS_ETHICS_FORM",
  FILING_INSTRUCTIONS: "FILING_INSTRUCTIONS",
  PRIOR_SUBMITTED_REPORT: "PRIOR_SUBMITTED_REPORT",
  RECEIPT: "RECEIPT",
  REIMBURSEMENT: "REIMBURSEMENT",
  BANK_OR_EXPORT_STATEMENT: "BANK_OR_EXPORT_STATEMENT",
  POLICY_MEMO: "POLICY_MEMO",
  COUNSEL_GUIDANCE: "COUNSEL_GUIDANCE",
  DEADLINE_CALENDAR: "DEADLINE_CALENDAR",
  DISCLAIMER_OR_TEMPLATE: "DISCLAIMER_OR_TEMPLATE",
  OTHER: "OTHER",
} as const;
export type ComplianceDocumentTypeId =
  (typeof ComplianceDocumentType)[keyof typeof ComplianceDocumentType];

export const complianceDocumentTypeLabel: Record<ComplianceDocumentTypeId, string> = {
  SOS_ETHICS_FORM: "SOS / ethics form",
  FILING_INSTRUCTIONS: "Filing instructions",
  PRIOR_SUBMITTED_REPORT: "Prior submitted report",
  RECEIPT: "Receipt",
  REIMBURSEMENT: "Reimbursement",
  BANK_OR_EXPORT_STATEMENT: "Bank / export (future import)",
  POLICY_MEMO: "Policy memo",
  COUNSEL_GUIDANCE: "Counsel guidance",
  DEADLINE_CALENDAR: "Deadline / calendar",
  DISCLAIMER_OR_TEMPLATE: "Disclaimer / template",
  OTHER: "Other",
};
