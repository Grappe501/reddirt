import type { FilingReadinessReport } from "../filing-readiness/filing-readiness-types";

export type ComplianceFilingStatus = "draft" | "ready_for_certification" | "certified" | "filed" | "amended";

export type ComplianceFilingSnapshot = {
  id: string;
  label: string;
  filingPeriodLabel?: string;
  status: ComplianceFilingStatus;
  createdAt: string;
  createdByInitials: string;
  approvedByInitials?: string;
  certifiedAt?: string;
  filedAt?: string;
  includedRecordIds: string[];
  supportingDocumentIds: string[];
  readiness: FilingReadinessReport;
  htmlSummary: string;
  csvExports: Array<{ name: string; path: string; rowCount: number }>;
  jsonPackagePath: string;
  auditHashManifest: Array<{ path: string; sha256: string }>;
  packageHash: string;
  humanCertificationRequired: true;
};
