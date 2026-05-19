import type { BankCsvReadiness } from "./bank-csv-readiness";

export type BankCsvOperatorState =
  | "missing"
  | "database_only"
  | "present_invalid"
  | "present_parsed"
  | "present_recon_issues"
  | "present_ready";

export type BankCsvOperatorGuide = {
  state: BankCsvOperatorState;
  headline: string;
  meaning: string;
  nextAction: string;
  command: string;
  href: string;
  issueSummary: string[];
  sourceType: "file" | "database_chunks" | "file_and_database" | "none";
  reconciliationStatus: string;
};

export function buildBankCsvOperatorGuide(
  readiness: BankCsvReadiness,
  rehearsal?: { unmatchedBank: number; ambiguous: number; highConfidence: number },
): BankCsvOperatorGuide {
  const sourceType =
    readiness.primarySource === "file_and_database"
      ? "file_and_database"
      : readiness.primarySource === "database_chunks"
        ? "database_chunks"
        : readiness.primarySource === "file"
          ? "file"
          : "none";

  if (!readiness.canSatisfyBankRequirement && readiness.databaseTransactionCount > 0 && readiness.primarySource === "database_chunks") {
    return {
      state: "database_only",
      headline: "Bank data in imported chunks",
      meaning: readiness.operatorSummary,
      nextAction: "Fix validation on staged bank imports or add CSV to verify.",
      command: "npm run compliance:source-truth-audit",
      href: "/admin/compliance/april26",
      issueSummary: readiness.issues.map((i) => i.message),
      sourceType: "database_chunks",
      reconciliationStatus: readiness.reconciliationStatus,
    };
  }

  if (!readiness.found && readiness.primarySource === "none") {
    return {
      state: "missing",
      headline: "No usable bank source",
      meaning: "Neither April26 bank CSV nor validated bank import chunks are available.",
      nextAction: "Add bank-april-2026.csv or import bank statement via admin bank import.",
      command: "npm run compliance:bank:qa",
      href: "/admin/compliance/april26",
      issueSummary: readiness.issues.map((i) => i.message),
      sourceType: "none",
      reconciliationStatus: readiness.reconciliationStatus,
    };
  }

  if (!readiness.readyForReconciliation) {
    const parseIssues = readiness.issues.filter((i) => i.code !== "file_missing");
    return {
      state: "present_invalid",
      headline: readiness.databaseTransactionCount > 0 ? "Bank source present but not valid" : "Bank CSV found but not valid",
      meaning: readiness.operatorSummary,
      nextAction: parseIssues[0]?.message ?? "Fix parse issues listed on April26 desk.",
      command: "npm run compliance:bank:qa",
      href: "/admin/compliance/april26",
      issueSummary: parseIssues.map((i) => i.message),
      sourceType,
      reconciliationStatus: readiness.reconciliationStatus,
    };
  }

  if (rehearsal && (rehearsal.unmatchedBank > 0 || rehearsal.ambiguous > 0)) {
    return {
      state: "present_recon_issues",
      headline: "Bank source ready — reconciliation needs review",
      meaning: `Valid rows: ${readiness.validRowCount} (${readiness.primarySource}). High-confidence: ${rehearsal.highConfidence}.`,
      nextAction: "Open reconciliation workbench and resolve unmatched/ambiguous matches.",
      command: "npm run compliance:qa-reconciliation",
      href: "/admin/compliance/reconciliation",
      issueSummary: [
        rehearsal.unmatchedBank ? `${rehearsal.unmatchedBank} unmatched bank row(s)` : "",
        rehearsal.ambiguous ? `${rehearsal.ambiguous} ambiguous match(es)` : "",
      ].filter(Boolean),
      sourceType,
      reconciliationStatus: readiness.reconciliationStatus,
    };
  }

  return {
    state: "present_ready",
    headline: "Bank source ready for reconciliation",
    meaning: `${readiness.validRowCount} valid credit row(s) from ${readiness.primarySource}. ${readiness.operatorSummary}`,
    nextAction: "Run reconciliation rehearsal review, then lock matches.",
    command: "npm run compliance:april26:qa",
    href: "/admin/compliance/reconciliation",
    issueSummary: [],
    sourceType,
    reconciliationStatus: readiness.reconciliationStatus,
  };
}
