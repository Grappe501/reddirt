import { readFile } from "node:fs/promises";
import path from "node:path";
import { getApril26Dir } from "../approval/april26-source";

export type ParsedBankRow = {
  rowNumber: number;
  date: string;
  amount: number;
  memo: string;
  normalizedDate: string | null;
};

export type BankCsvParseResult = {
  expectedPath: string;
  found: boolean;
  headers: string[];
  columnMap: Record<string, string>;
  rows: ParsedBankRow[];
  issues: Array<{ code: string; message: string; row?: number }>;
};

const REQUIRED = ["date", "amount", "memo"];

export function parseCsvLine(line: string): string[] {
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

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

export async function parseApril26BankCsv(): Promise<BankCsvParseResult> {
  const expectedPath = path.join(getApril26Dir(), "bank-april-2026.csv");
  const issues: BankCsvParseResult["issues"] = [];
  try {
    const text = await readFile(expectedPath, "utf8");
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) {
      return { expectedPath, found: true, headers: [], columnMap: {}, rows: [], issues: [{ code: "empty_file", message: "Bank CSV is empty." }] };
    }
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const columnMap: Record<string, string> = {};
    headers.forEach((h, i) => {
      columnMap[h] = parseCsvLine(lines[0])[i] ?? h;
    });
    const missing = REQUIRED.filter((h) => !headers.includes(h));
    if (missing.length) {
      issues.push({
        code: "header_mismatch",
        message: `Missing columns: ${missing.join(", ")}. Found: ${headers.join(", ")}`,
      });
    }
    const rows: ParsedBankRow[] = [];
    const memoSeen = new Map<string, number>();
    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line.trim()) {
        issues.push({ code: "empty_row", message: "Blank row", row: i + 1 });
        continue;
      }
      const cells = parseCsvLine(line);
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = cells[index] ?? "";
      });
      const amount = parseAmount(record.amount ?? "");
      if (amount == null) {
        issues.push({ code: "invalid_amount", message: `Invalid amount at row ${i + 1}`, row: i + 1 });
        continue;
      }
      const normalizedDate = normalizeDate(record.date ?? "");
      if (!normalizedDate) {
        issues.push({ code: "invalid_date", message: `Invalid date at row ${i + 1}`, row: i + 1 });
        continue;
      }
      const memo = (record.memo ?? "").trim();
      if (memo) {
        const count = (memoSeen.get(memo) ?? 0) + 1;
        memoSeen.set(memo, count);
        if (count > 1) {
          issues.push({ code: "duplicate_memo", message: `Duplicate memo: ${memo.slice(0, 40)}…`, row: i + 1 });
        }
      }
      rows.push({
        rowNumber: i + 1,
        date: record.date ?? "",
        amount,
        memo,
        normalizedDate,
      });
    }
    return { expectedPath, found: true, headers, columnMap, rows, issues };
  } catch {
    return {
      expectedPath,
      found: false,
      headers: [],
      columnMap: {},
      rows: [],
      issues: [{ code: "file_missing", message: `Expected ${expectedPath}` }],
    };
  }
}
