import type { FilingReadinessReport } from "../filing-readiness/filing-readiness-types";
import type { FilingHardGate } from "../filing-readiness/hard-gates";

export type FilingExportWatermark = "DRAFT — NOT LEGAL FILING CERTIFIED" | "READY FOR COMPLIANCE OFFICER REVIEW";

export type FilingPackageExport = {
  filingId: string;
  filingPeriod: {
    label?: string;
    startDate?: string;
    endDate?: string;
    dueDate?: string;
  };
  includedRecordIds: string[];
  excludedRecordIds: string[];
  readinessStatus: FilingReadinessReport["overallStatus"];
  ruleCoverageStatus: string;
  reconciliationStatus: string;
  approvalChainSummary: string[];
  hashManifest: Array<{ path: string; sha256: string }>;
  generatedAt: string;
  generatedByInitials: string;
  watermark: FilingExportWatermark;
  artifacts: Array<{ name: string; path: string; kind: string }>;
};

export type FilingExportBuildInput = {
  filingId: string;
  label: string;
  generatedByInitials: string;
  legalVerificationComplete?: boolean;
  hardGates?: FilingHardGate[];
  readiness: FilingReadinessReport;
};
