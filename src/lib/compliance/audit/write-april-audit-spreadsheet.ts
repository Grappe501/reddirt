import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import { buildAprilAuditSpreadsheetPackage, APRIL_AUDIT_MAIN_COLUMNS } from "./build-april-audit-spreadsheet";
import { rowsToCsv } from "./april-audit-csv";

const AUDIT_DIR = path.join(process.cwd(), "docs", "compliance", "audit");

export const APRIL_AUDIT_PATHS = {
  main: "docs/compliance/audit/april-2026-compliance-audit.csv",
  checks: "docs/compliance/audit/april-2026-checks.csv",
  ledger: "docs/compliance/audit/april-2026-ledger-expenditures.csv",
  addresses: "docs/compliance/audit/april-2026-missing-addresses.csv",
  unmatched: "docs/compliance/audit/april-2026-unmatched-items.csv",
  inKind: "docs/compliance/audit/april-2026-in-kind-auction.csv",
  reconciliation: "docs/compliance/audit/april-2026-reconciliation-exceptions.csv",
  xlsx: "docs/compliance/audit/april-2026-compliance-audit.xlsx",
} as const;

export async function writeAprilAuditSpreadsheetPackage() {
  const pkg = await buildAprilAuditSpreadsheetPackage();
  await mkdir(AUDIT_DIR, { recursive: true });

  const writes: Array<[string, string]> = [
    [APRIL_AUDIT_PATHS.main, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, pkg.mainRows)],
    [APRIL_AUDIT_PATHS.checks, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, pkg.checksRows)],
    [APRIL_AUDIT_PATHS.ledger, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, pkg.ledgerRows)],
    [APRIL_AUDIT_PATHS.addresses, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, pkg.addressRows)],
    [APRIL_AUDIT_PATHS.unmatched, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, pkg.unmatchedRows)],
    [APRIL_AUDIT_PATHS.inKind, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, pkg.inKindRows)],
    [APRIL_AUDIT_PATHS.reconciliation, rowsToCsv(APRIL_AUDIT_MAIN_COLUMNS, pkg.reconciliationRows)],
  ];

  for (const [rel, csv] of writes) {
    await writeFile(path.join(process.cwd(), rel), csv, "utf8");
  }

  const wb = XLSX.utils.book_new();
  const sheets: Array<[string, typeof pkg.mainRows]> = [
    ["All rows", pkg.mainRows],
    ["Checks", pkg.checksRows],
    ["Ledger", pkg.ledgerRows],
    ["Addresses", pkg.addressRows],
    ["Unmatched", pkg.unmatchedRows],
    ["In-kind", pkg.inKindRows],
    ["Reconciliation", pkg.reconciliationRows],
  ];
  for (const [name, rows] of sheets) {
    const ws = XLSX.utils.json_to_sheet(rows, { header: [...APRIL_AUDIT_MAIN_COLUMNS] });
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  }
  XLSX.writeFile(wb, path.join(process.cwd(), APRIL_AUDIT_PATHS.xlsx));

  return { pkg, paths: APRIL_AUDIT_PATHS };
}
