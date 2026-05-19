import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { getApril26Dir } from "../approval/april26-source";
import { loadBankAnalyses } from "../storage";
import type { BankStagedTransaction } from "../imports/types";
import { parseApril26BankCsv, parseBankCsvAtPath, type ParsedBankRow } from "../imports/bank-csv-parse";

export type BankReconciliationStatus =
  | "missing_file_only"
  | "database_source_available"
  | "file_source_available"
  | "both_sources_available"
  | "source_present_but_invalid"
  | "reconciliation_ready"
  | "reconciliation_active"
  | "reconciliation_blocked";

export type BankSourceKind = "none" | "file" | "database_chunks" | "file_and_database";

export type NormalizedBankTransaction = ParsedBankRow & {
  sourceKind: "file" | "database";
  sourceId: string;
  provenance: string;
};

export type BankSourceResolution = {
  expectedFilePath: string;
  alternateFilePaths: string[];
  fileFound: boolean;
  databaseBatchCount: number;
  databaseTransactionCount: number;
  fileRowCount: number;
  validTransactionCount: number;
  creditTransactionCount: number;
  primarySource: BankSourceKind;
  canSatisfyBankRequirement: boolean;
  readyForReconciliation: boolean;
  reconciliationStatus: BankReconciliationStatus;
  missingFields: string[];
  validationIssues: Array<{ code: string; message: string; row?: number }>;
  dateCoverage: { earliest: string | null; latest: string | null };
  provenance: string[];
  normalizedRows: NormalizedBankTransaction[];
  operatorSummary: string;
};

const GOODCHANGE_CSV_FRAGMENT = "transactions_Apr";

export async function discoverApril26BankCsvPaths(): Promise<{ expected: string; alternates: string[] }> {
  const dir = getApril26Dir();
  const expected = path.join(dir, "bank-april-2026.csv");
  const alternates: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !/\.csv$/i.test(entry.name)) continue;
      if (entry.name.includes(GOODCHANGE_CSV_FRAGMENT)) continue;
      const full = path.join(dir, entry.name);
      if (full === expected) continue;
      if (/bank|statement|checking|deposit|ledger|download/i.test(entry.name)) alternates.push(full);
    }
  } catch {
    /* april26 missing */
  }
  return { expected, alternates };
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function stagedToNormalized(txn: BankStagedTransaction, batchId: string): NormalizedBankTransaction | null {
  const amount =
    txn.credit != null && txn.credit > 0
      ? txn.credit
      : txn.amount != null && txn.amount > 0
        ? txn.amount
        : txn.debit != null && txn.debit < 0
          ? Math.abs(txn.debit)
          : null;
  if (amount == null || amount <= 0) return null;
  const dateRaw = txn.postedDate ?? "";
  return {
    rowNumber: txn.sourceRowNumber,
    date: dateRaw,
    amount,
    memo: (txn.description ?? "").trim() || "(no description)",
    normalizedDate: dateRaw.trim() ? normalizeDateOrNull(dateRaw) : null,
    sourceKind: "database",
    sourceId: txn.id,
    provenance: `data/compliance/imports/bank/${batchId}.analysis.json`,
  };
}

function normalizeDateOrNull(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

async function loadDatabaseNormalized(): Promise<{
  rows: NormalizedBankTransaction[];
  batchCount: number;
  issues: BankSourceResolution["validationIssues"];
}> {
  const analyses = await loadBankAnalyses();
  const rows: NormalizedBankTransaction[] = [];
  const issues: BankSourceResolution["validationIssues"] = [];
  for (const analysis of analyses) {
    for (const txn of analysis.stagedTransactions) {
      const norm = stagedToNormalized(txn, analysis.batch.id);
      if (!norm) continue;
      if (!norm.normalizedDate) {
        issues.push({ code: "invalid_date", message: `Database txn ${txn.id}: invalid or missing date`, row: txn.sourceRowNumber });
        continue;
      }
      rows.push(norm);
    }
  }
  return { rows, batchCount: analyses.length, issues };
}

async function resolveApril26FilePath(): Promise<string | null> {
  const envPath = process.env.COMPLIANCE_BANK_CSV_PATH?.trim();
  if (envPath && (await pathExists(envPath))) return envPath;
  const { expected, alternates } = await discoverApril26BankCsvPaths();
  if (await pathExists(expected)) return expected;
  for (const alt of alternates) {
    if (await pathExists(alt)) return alt;
  }
  return null;
}

function dateCoverage(rows: NormalizedBankTransaction[]): { earliest: string | null; latest: string | null } {
  const dates = rows.map((r) => r.normalizedDate).filter((d): d is string => Boolean(d));
  if (!dates.length) return { earliest: null, latest: null };
  dates.sort();
  return { earliest: dates[0], latest: dates[dates.length - 1] };
}

function deriveReconciliationStatus(input: {
  canSatisfy: boolean;
  primary: BankSourceKind;
  fileFound: boolean;
  dbCount: number;
  fileValid: number;
  blocking: boolean;
}): BankReconciliationStatus {
  if (input.canSatisfy) return "reconciliation_ready";
  if (input.primary === "file_and_database") return "both_sources_available";
  if (input.dbCount > 0 && input.fileValid === 0) return "database_source_available";
  if (input.fileFound && input.fileValid === 0) return "source_present_but_invalid";
  if (input.fileFound) return "file_source_available";
  if (input.dbCount > 0) return "database_source_available";
  if (input.primary === "none" && !input.fileFound && input.dbCount === 0) return "missing_file_only";
  if (input.blocking) return "reconciliation_blocked";
  return "missing_file_only";
}

export async function resolveBankSource(): Promise<BankSourceResolution> {
  const { expected, alternates } = await discoverApril26BankCsvPaths();
  const filePath = await resolveApril26FilePath();

  const [db, fileParsed] = await Promise.all([
    loadDatabaseNormalized(),
    filePath ? parseBankCsvAtPath(filePath) : parseApril26BankCsv(),
  ]);

  const fileRows: NormalizedBankTransaction[] = fileParsed.rows.map((r) => ({
    ...r,
    sourceKind: "file" as const,
    sourceId: `file-row-${r.rowNumber}`,
    provenance: fileParsed.expectedPath,
  }));
  const fileIssues = fileParsed.issues.map((i) => ({ code: i.code, message: i.message, row: i.row }));
  const fileFound = fileParsed.found;
  const fileHeaderBlocked = fileIssues.some((i) => i.code === "header_mismatch");

  let primarySource: BankSourceKind = "none";
  let normalizedRows: NormalizedBankTransaction[] = [];

  if (fileRows.length > 0 && !fileHeaderBlocked) {
    normalizedRows = fileRows;
    primarySource = db.rows.length > 0 ? "file_and_database" : "file";
  } else if (db.rows.length > 0) {
    normalizedRows = db.rows;
    primarySource = "database_chunks";
  } else if (fileFound) {
    primarySource = "file";
  }

  const validTransactionCount = normalizedRows.filter((r) => r.normalizedDate && r.amount > 0).length;
  const creditTransactionCount = normalizedRows.filter((r) => r.amount > 0).length;
  const coverage = dateCoverage(normalizedRows);
  const missingFields = new Set<string>();
  for (const row of normalizedRows) {
    if (!row.normalizedDate) missingFields.add("date");
    if (!row.memo?.trim() || row.memo === "(no description)") missingFields.add("memo");
  }

  const blocking = [...fileIssues, ...db.issues].some((i) =>
    ["file_missing", "empty_file"].includes(i.code),
  ) || fileHeaderBlocked;
  const canSatisfyBankRequirement = validTransactionCount > 0 && !blocking;
  const readyForReconciliation = canSatisfyBankRequirement;

  const reconciliationStatus = deriveReconciliationStatus({
    canSatisfy: canSatisfyBankRequirement,
    primary: primarySource,
    fileFound,
    dbCount: db.rows.length,
    fileValid: fileRows.filter((r) => r.normalizedDate).length,
    blocking,
  });

  const provenance: string[] = [];
  if (fileFound) provenance.push(`file:${fileParsed.expectedPath}`);
  if (db.batchCount > 0) provenance.push(`database:${db.batchCount}_batch(es)_${db.rows.length}_txn(s)`);

  let operatorSummary: string;
  if (primarySource === "database_chunks" && !fileFound) {
    operatorSummary =
      "Bank data found in imported chunks. CSV file is optional unless you want to replace or verify the import.";
  } else if (canSatisfyBankRequirement && primarySource === "file") {
    operatorSummary = "Bank data loaded from April26 CSV file.";
  } else if (canSatisfyBankRequirement && primarySource === "file_and_database") {
    operatorSummary = "Bank data available from CSV and imported chunks; CSV used for reconciliation.";
  } else if (primarySource === "database_chunks") {
    operatorSummary = "Bank chunks present but cannot reconcile until validation issues are fixed.";
  } else if (fileFound) {
    operatorSummary = "Bank source exists but cannot reconcile because rows or dates are invalid.";
  } else {
    operatorSummary = "No usable bank data found. Add bank-april-2026.csv or import via admin bank import.";
  }

  return {
    expectedFilePath: expected,
    alternateFilePaths: alternates,
    fileFound,
    databaseBatchCount: db.batchCount,
    databaseTransactionCount: db.rows.length,
    fileRowCount: fileRows.length,
    validTransactionCount,
    creditTransactionCount,
    primarySource,
    canSatisfyBankRequirement,
    readyForReconciliation,
    reconciliationStatus,
    missingFields: [...missingFields],
    validationIssues: [...fileIssues, ...db.issues],
    dateCoverage: coverage,
    provenance,
    normalizedRows,
    operatorSummary,
  };
}

/** Legacy readiness shape for existing callers. */
export async function evaluateBankCsvReadinessFromAdapter(): Promise<{
  expectedPath: string;
  found: boolean;
  filename: string | null;
  rowCount: number;
  validRowCount: number;
  duplicateMemoCount: number;
  issues: Array<{ code: string; message: string; row?: number }>;
  reconciliationHint: string;
  readyForReconciliation: boolean;
  primarySource: BankSourceKind;
  reconciliationStatus: BankReconciliationStatus;
  canSatisfyBankRequirement: boolean;
  operatorSummary: string;
  databaseTransactionCount: number;
  databaseBatchCount: number;
}> {
  const r = await resolveBankSource();
  const issues = [...r.validationIssues];
  if (r.primarySource === "none") {
    issues.push({
      code: "file_missing",
      message: `No usable bank at ${r.expectedFilePath} or data/compliance/imports/bank/*.analysis.json`,
    });
  }
  const reconciliationHint = r.readyForReconciliation
    ? `${r.validTransactionCount} bank credit(s) from ${r.primarySource} — open Reconciliation to match payouts.`
    : r.databaseTransactionCount > 0
      ? "Bank chunks present; fix validation to run full reconciliation."
      : "Add or import bank data to unblock reconciliation.";
  return {
    expectedPath: r.expectedFilePath,
    found: r.canSatisfyBankRequirement || r.fileFound || r.databaseTransactionCount > 0,
    filename: r.fileFound ? path.basename(r.expectedFilePath) : null,
    rowCount: r.normalizedRows.length,
    validRowCount: r.validTransactionCount,
    duplicateMemoCount: 0,
    issues,
    reconciliationHint,
    readyForReconciliation: r.readyForReconciliation,
    primarySource: r.primarySource,
    reconciliationStatus: r.reconciliationStatus,
    canSatisfyBankRequirement: r.canSatisfyBankRequirement,
    operatorSummary: r.operatorSummary,
    databaseTransactionCount: r.databaseTransactionCount,
    databaseBatchCount: r.databaseBatchCount,
  };
}
