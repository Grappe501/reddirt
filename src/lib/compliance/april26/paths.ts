import path from "node:path";

export const APRIL_2026_PERIOD = "2026-04";

export const GOODCHANGE_CSV_NAME =
  "_Committee to Elect Kelly Grappe_transactions_Apr 1, 2026_Apr 30, 2026_.csv";

export const ETHICS_XLSX_NAME = "April 2026 Ethics Filing.xlsx";

export const BANK_CSV_NAME = "bank-april-2026.csv";

const DEFAULT_APRIL26_DIR = path.resolve(process.cwd(), "..", "Compliance", "April26");

export function getApril26Dir(): string {
  return process.env.COMPLIANCE_APRIL26_DIR?.trim() || DEFAULT_APRIL26_DIR;
}

export function getApril26DataDir(): string {
  return path.join(process.cwd(), "data", "compliance", "april26");
}
