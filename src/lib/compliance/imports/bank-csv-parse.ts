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

const STRICT_REQUIRED = ["date", "amount", "memo"];

function resolveHeaderKeys(headers: string[]): {
  dateKey: string | null;
  amountKey: string | null;
  memoKey: string | null;
  strict: boolean;
} {
  const has = (name: string) => headers.includes(name);
  const dateKey = has("date")
    ? "date"
    : headers.find((h) => /^(posted date|transaction date|post date)$/.test(h)) ?? null;
  const amountKey = has("amount") ? "amount" : headers.find((h) => /^transaction amount$/.test(h)) ?? null;
  const memoKey = has("memo")
    ? "memo"
    : has("description")
      ? "description"
      : headers.find((h) => /^(details|payee|transaction description)$/.test(h)) ?? null;
  const strict = STRICT_REQUIRED.every((h) => has(h));
  return { dateKey, amountKey, memoKey, strict };
}

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

export async function parseBankCsvAtPath(filePath: string): Promise<BankCsvParseResult> {
  const issues: BankCsvParseResult["issues"] = [];
  try {
    const text = await readFile(filePath, "utf8");
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) {
      return { expectedPath: filePath, found: true, headers: [], columnMap: {}, rows: [], issues: [{ code: "empty_file", message: "Bank CSV is empty." }] };
    }
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const columnMap: Record<string, string> = {};
    headers.forEach((h, i) => {
      columnMap[h] = parseCsvLine(lines[0])[i] ?? h;
    });
    const { dateKey, amountKey, memoKey, strict } = resolveHeaderKeys(headers);
    if (!dateKey || !amountKey) {
      issues.push({
        code: "header_mismatch",
        message: `Missing date or amount columns. Found: ${headers.join(", ")}`,
      });
    } else if (!strict && !memoKey) {
      issues.push({
        code: "header_mismatch",
        message: `Missing memo/description column. Found: ${headers.join(", ")}`,
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
      const amountRaw = amountKey ? record[amountKey] ?? "" : "";
      if (!amountRaw.trim()) {
        continue;
      }
      const amount = parseAmount(amountRaw);
      if (amount == null) {
        issues.push({ code: "invalid_amount", message: `Invalid amount at row ${i + 1}`, row: i + 1 });
        continue;
      }
      const normalizedDate = normalizeDate(dateKey ? record[dateKey] ?? "" : "");
      if (!normalizedDate) {
        issues.push({ code: "invalid_date", message: `Invalid date at row ${i + 1}`, row: i + 1 });
        continue;
      }
      const memo = (memoKey ? record[memoKey] ?? "" : "").trim();
      if (memo) {
        const count = (memoSeen.get(memo) ?? 0) + 1;
        memoSeen.set(memo, count);
        if (count > 1) {
          issues.push({ code: "duplicate_memo", message: `Duplicate memo: ${memo.slice(0, 40)}…`, row: i + 1 });
        }
      }
      rows.push({
        rowNumber: i + 1,
        date: dateKey ? record[dateKey] ?? "" : "",
        amount,
        memo,
        normalizedDate,
      });
    }
    return { expectedPath: filePath, found: true, headers, columnMap, rows, issues };
  } catch {
    return {
      expectedPath: filePath,
      found: false,
      headers: [],
      columnMap: {},
      rows: [],
      issues: [{ code: "file_missing", message: `Cannot read ${filePath}` }],
    };
  }
}

export async function parseApril26BankCsv(): Promise<BankCsvParseResult> {
  const expectedPath = path.join(getApril26Dir(), "bank-april-2026.csv");
  return parseBankCsvAtPath(expectedPath);
}
