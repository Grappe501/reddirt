import type { BankReconciliationStatus, BankSourceKind } from "../april26/bank-source-adapter";
import { evaluateBankCsvReadinessFromAdapter } from "../april26/bank-source-adapter";

export type BankCsvIssueCode =
  | "file_missing"
  | "wrong_filename"
  | "empty_file"
  | "header_mismatch"
  | "malformed_row"
  | "empty_row"
  | "duplicate_id"
  | "invalid_date"
  | "invalid_amount"
  | "unmatched_payout";

export type BankCsvReadiness = {
  expectedPath: string;
  found: boolean;
  filename: string | null;
  rowCount: number;
  validRowCount: number;
  duplicateMemoCount: number;
  issues: Array<{ code: BankCsvIssueCode | string; message: string; row?: number }>;
  reconciliationHint: string;
  readyForReconciliation: boolean;
  primarySource: BankSourceKind;
  reconciliationStatus: BankReconciliationStatus;
  canSatisfyBankRequirement: boolean;
  operatorSummary: string;
  databaseTransactionCount: number;
  databaseBatchCount: number;
};

export async function evaluateBankCsvReadiness(): Promise<BankCsvReadiness> {
  const r = await evaluateBankCsvReadinessFromAdapter();
  return {
    expectedPath: r.expectedPath,
    found: r.found,
    filename: r.filename,
    rowCount: r.rowCount,
    validRowCount: r.validRowCount,
    duplicateMemoCount: r.duplicateMemoCount,
    issues: r.issues as BankCsvReadiness["issues"],
    reconciliationHint: r.reconciliationHint,
    readyForReconciliation: r.readyForReconciliation,
    primarySource: r.primarySource,
    reconciliationStatus: r.reconciliationStatus,
    canSatisfyBankRequirement: r.canSatisfyBankRequirement,
    operatorSummary: r.operatorSummary,
    databaseTransactionCount: r.databaseTransactionCount,
    databaseBatchCount: r.databaseBatchCount,
  };
}
