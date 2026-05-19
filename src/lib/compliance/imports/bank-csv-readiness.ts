import { readFile } from "node:fs/promises";
import path from "node:path";
import { getApril26Dir } from "../approval/april26-source";
import { loadApril26GoodChangeRows } from "../approval/april26-source";

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
  issues: Array<{ code: BankCsvIssueCode; message: string; row?: number }>;
  reconciliationHint: string;
  readyForReconciliation: boolean;
};

const REQUIRED_HEADERS = ["date", "amount", "memo"];

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function parseDate(raw: string): boolean {
  if (!raw.trim()) return false;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw.trim());
  const us = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(raw.trim());
  return iso || us || !Number.isNaN(Date.parse(raw));
}

export async function evaluateBankCsvReadiness(): Promise<BankCsvReadiness> {
  const dir = getApril26Dir();
  const expectedPath = path.join(dir, "bank-april-2026.csv");
  const issues: BankCsvReadiness["issues"] = [];
  let found = false;
  let filename: string | null = null;
  let rowCount = 0;
  let validRowCount = 0;
  let duplicateMemoCount = 0;

  try {
    const text = await readFile(expectedPath, "utf8");
    found = true;
    filename = "bank-april-2026.csv";
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) {
      issues.push({ code: "empty_file", message: "Bank CSV file is empty." });
      return finish(expectedPath, found, filename, rowCount, validRowCount, duplicateMemoCount, issues);
    }
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
    if (missing.length) {
      issues.push({
        code: "header_mismatch",
        message: `Expected headers: ${REQUIRED_HEADERS.join(", ")}. Missing: ${missing.join(", ")}.`,
      });
    }
    const memoKeys = new Set<string>();
    for (let i = 1; i < lines.length; i += 1) {
      rowCount += 1;
      const line = lines[i];
      if (!line.trim()) {
        issues.push({ code: "empty_row", message: "Blank row in bank CSV.", row: i + 1 });
        continue;
      }
      const cells = parseCsvLine(line);
      if (cells.length < 3) {
        issues.push({ code: "malformed_row", message: "Row has fewer than 3 columns.", row: i + 1 });
        continue;
      }
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = cells[index] ?? "";
      });
      if (!parseDate(row.date ?? "")) {
        issues.push({ code: "invalid_date", message: `Invalid date: ${row.date}`, row: i + 1 });
        continue;
      }
      const amount = parseAmount(row.amount ?? "");
      if (amount == null) {
        issues.push({ code: "invalid_amount", message: `Invalid amount: ${row.amount}`, row: i + 1 });
        continue;
      }
      const memo = (row.memo ?? "").trim();
      if (memo && memoKeys.has(memo)) duplicateMemoCount += 1;
      if (memo) memoKeys.add(memo);
      validRowCount += 1;
    }
    if (duplicateMemoCount > 0) {
      issues.push({
        code: "duplicate_id",
        message: `${duplicateMemoCount} duplicate memo value(s) — verify before auto-matching.`,
      });
    }
    try {
      const goodChange = await loadApril26GoodChangeRows();
      const payoutIds = new Set(
        goodChange.map((row) => row.payout_id || row.transfer_id).filter(Boolean),
      );
      if (payoutIds.size && validRowCount > 0 && validRowCount < payoutIds.size) {
        issues.push({
          code: "unmatched_payout",
          message: `Bank rows (${validRowCount}) fewer than GoodChange payout batches (${payoutIds.size}) — some payouts may lack bank lines.`,
        });
      }
    } catch {
      issues.push({ code: "unmatched_payout", message: "Could not compare bank rows to GoodChange CSV." });
    }
  } catch {
    found = false;
    issues.push({
      code: "file_missing",
      message: `Place bank-april-2026.csv at ${expectedPath} (date, amount, memo; credits positive).`,
    });
  }

  return finish(expectedPath, found, filename, rowCount, validRowCount, duplicateMemoCount, issues);
}

function finish(
  expectedPath: string,
  found: boolean,
  filename: string | null,
  rowCount: number,
  validRowCount: number,
  duplicateMemoCount: number,
  issues: BankCsvReadiness["issues"],
): BankCsvReadiness {
  const blocking = issues.some((i) =>
    ["file_missing", "empty_file", "header_mismatch"].includes(i.code),
  );
  const readyForReconciliation = found && validRowCount > 0 && !blocking;
  const reconciliationHint = readyForReconciliation
    ? `${validRowCount} bank row(s) validated — open Reconciliation to match payouts.`
    : found
      ? "Fix bank CSV issues before reconciliation."
      : "Add bank CSV to unblock reconciliation.";
  return {
    expectedPath,
    found,
    filename,
    rowCount,
    validRowCount,
    duplicateMemoCount,
    issues,
    reconciliationHint,
    readyForReconciliation,
  };
}
