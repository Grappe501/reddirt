import { readFile } from "node:fs/promises";
import { discoverApril26BankCsvPaths } from "../april26/bank-source-adapter";
import { loadBankAnalyses } from "../storage";
import { parseCsvLine, parseAmount, normalizeDate } from "../imports/bank-csv-parse";

export type FullLedgerRow = {
  rowNumber: number;
  date: string;
  normalizedDate: string | null;
  refCheckNumber: string | null;
  description: string;
  amount: number;
  memo: string;
  category: string;
  provenance: string;
  sourceKind: "file" | "database";
  sourceId: string;
};

function resolveRefKey(headers: string[]): string | null {
  if (headers.includes("ref/check")) return "ref/check";
  if (headers.includes("ref")) return "ref";
  if (headers.includes("check")) return "check";
  return headers.find((h) => /check|ref/.test(h)) ?? null;
}

function resolveCategoryKey(headers: string[]): string | null {
  if (headers.includes("category")) return "category";
  return null;
}

export async function resolveApril26FilePath(): Promise<string | null> {
  const { expected, alternates } = await discoverApril26BankCsvPaths();
  const { access } = await import("node:fs/promises");
  if (await access(expected).then(() => true).catch(() => false)) return expected;
  for (const alt of alternates) {
    if (await access(alt).then(() => true).catch(() => false)) return alt;
  }
  return null;
}

async function parseFileLedger(filePath: string): Promise<FullLedgerRow[]> {
  const text = await readFile(filePath, "utf8");
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const dateKey = headers.includes("date") ? "date" : null;
  const amountKey = headers.includes("amount") ? "amount" : null;
  const descKey = headers.includes("description") ? "description" : headers.includes("memo") ? "memo" : null;
  const memoKey = headers.includes("memo") ? "memo" : null;
  const refKey = resolveRefKey(headers);
  const catKey = resolveCategoryKey(headers);
  if (!dateKey || !amountKey) return [];

  const rows: FullLedgerRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = cells[idx] ?? "";
    });
    const amountRaw = record[amountKey] ?? "";
    if (!amountRaw.trim()) continue;
    const amount = parseAmount(amountRaw);
    if (amount == null) continue;
    const normalizedDate = normalizeDate(record[dateKey] ?? "");
    rows.push({
      rowNumber: i + 1,
      date: record[dateKey] ?? "",
      normalizedDate,
      refCheckNumber: refKey ? (record[refKey]?.trim() || null) : null,
      description: descKey ? (record[descKey] ?? "").trim() : "",
      amount,
      memo: memoKey ? (record[memoKey] ?? "").trim() : "",
      category: catKey ? (record[catKey] ?? "").trim() : "",
      provenance: filePath,
      sourceKind: "file",
      sourceId: `file-row-${i + 1}`,
    });
  }
  return rows;
}

function databaseLedgerRows(): Promise<FullLedgerRow[]> {
  return loadBankAnalyses().then((analyses) =>
    analyses.flatMap((analysis) =>
      analysis.stagedTransactions.map((txn) => ({
        rowNumber: txn.sourceRowNumber,
        date: txn.postedDate ?? "",
        normalizedDate: txn.postedDate?.trim() ? normalizeDate(txn.postedDate) : null,
        refCheckNumber: txn.checkNumber ?? null,
        description: (txn.description ?? "").trim(),
        amount: txn.amount ?? txn.debit ?? (txn.credit != null ? -Math.abs(txn.credit) : 0),
        memo: "",
        category: txn.transactionType ?? "",
        provenance: `data/compliance/imports/bank/${analysis.batch.id}.analysis.json`,
        sourceKind: "database" as const,
        sourceId: txn.id,
      })),
    ),
  );
}

export async function loadFullAprilLedgerRows(): Promise<FullLedgerRow[]> {
  const filePath = await resolveApril26FilePath();
  const fileRows = filePath ? await parseFileLedger(filePath) : [];
  const dbRows = await databaseLedgerRows();
  if (fileRows.length > 0) return fileRows;
  return dbRows;
}

export function isApril2026(date: string | null): boolean {
  if (!date) return false;
  return date.startsWith("2026-04");
}

export function isLedgerExpenditure(row: FullLedgerRow): boolean {
  if (row.amount < 0) return true;
  if (/daily ledger bal/i.test(row.description)) return false;
  if (row.amount === 0) return false;
  return row.amount > 0 && /purchase|withdrawal|debit|pos |fee|payment|paid/i.test(`${row.description} ${row.memo}`);
}

/** Debits and negative amounts for April expenditure list */
export function filterAprilExpenditures(rows: FullLedgerRow[]): FullLedgerRow[] {
  return rows.filter((row) => {
    if (!isApril2026(row.normalizedDate)) return false;
    if (/daily ledger bal/i.test(row.description)) return false;
    if (row.amount < 0) return true;
    if (row.amount > 0 && !/stripe\/transfer|deposit/i.test(row.description)) {
      return /pos |purchase|withdrawal|fee|paid|mcdonald|deposit reverse/i.test(row.description.toLowerCase());
    }
    return false;
  });
}

export function inferVendorFromDescription(description: string): string | null {
  const d = description.trim();
  if (!d) return null;
  const pos = d.match(/POS Purchase\s+(.+?)\s+[A-Z]{2}\s+\*+/i);
  if (pos?.[1]) return pos[1].trim().slice(0, 80);
  if (/STRIPE\/TRANSFER/i.test(d)) return "Stripe transfer (contribution)";
  if (/^Deposit$/i.test(d)) return "Deposit";
  return d.slice(0, 60);
}
