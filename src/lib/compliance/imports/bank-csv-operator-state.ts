import type { BankCsvReadiness } from "./bank-csv-readiness";

export type BankCsvOperatorState =
  | "missing"
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
};

export function buildBankCsvOperatorGuide(
  readiness: BankCsvReadiness,
  rehearsal?: { unmatchedBank: number; ambiguous: number; highConfidence: number },
): BankCsvOperatorGuide {
  if (!readiness.found) {
    return {
      state: "missing",
      headline: "Bank CSV not on disk",
      meaning: "Reconciliation and filing paths stay blocked until the treasurer export is placed at the expected path.",
      nextAction: "Add bank-april-2026.csv (date, amount, memo; credits positive).",
      command: "npm run compliance:bank:qa",
      href: "/admin/compliance/april26",
      issueSummary: readiness.issues.map((i) => i.message),
    };
  }

  if (!readiness.readyForReconciliation) {
    const parseIssues = readiness.issues.filter((i) => i.code !== "file_missing");
    return {
      state: "present_invalid",
      headline: "Bank CSV found but not valid",
      meaning: "The file exists but has header, row, or amount problems. Fix the CSV — do not invent rows.",
      nextAction: parseIssues[0]?.message ?? "Fix parse issues listed on April26 desk.",
      command: "npm run compliance:bank:qa",
      href: "/admin/compliance/april26",
      issueSummary: parseIssues.map((i) => i.message),
    };
  }

  if (rehearsal && (rehearsal.unmatchedBank > 0 || rehearsal.ambiguous > 0)) {
    return {
      state: "present_recon_issues",
      headline: "Bank CSV parsed — reconciliation needs review",
      meaning: `Valid rows: ${readiness.validRowCount}. High-confidence matches: ${rehearsal.highConfidence}. Unmatched or ambiguous items need operator decisions.`,
      nextAction: "Open reconciliation workbench and resolve unmatched/ambiguous matches.",
      command: "npm run compliance:qa-reconciliation",
      href: "/admin/compliance/reconciliation",
      issueSummary: [
        rehearsal.unmatchedBank ? `${rehearsal.unmatchedBank} unmatched bank row(s)` : "",
        rehearsal.ambiguous ? `${rehearsal.ambiguous} ambiguous match(es)` : "",
      ].filter(Boolean),
    };
  }

  return {
    state: "present_ready",
    headline: "Bank CSV ready for reconciliation",
    meaning: `${readiness.validRowCount} valid credit row(s). Proceed with matching and locking in the reconciliation workbench.`,
    nextAction: "Run reconciliation rehearsal review, then lock matches.",
    command: "npm run compliance:april26:qa",
    href: "/admin/compliance/reconciliation",
    issueSummary: [],
  };
}
