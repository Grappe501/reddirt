import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { inferColumnTypes, parseCsv, parseMoney, sanitizeSampleRows, stableHash } from "./csv-column-detector";
import { getMappedColumn, mapBankColumns } from "./bank-field-mapper";
import type { BankImportAnalysis, BankStagedTransaction } from "./types";

const STORAGE_DIR = path.join(process.cwd(), "data", "compliance", "imports", "bank");

export async function stageBankImport(input: {
  fileName: string;
  csvText: string;
  uploadedByInitials?: string;
  persist?: boolean;
}): Promise<BankImportAnalysis> {
  const parsed = parseCsv(input.csvText);
  const fieldMapping = mapBankColumns(parsed.columns);
  const batchId = createBatchId("bank", input.fileName);
  const uploadedAt = new Date().toISOString();
  const stagedTransactions = parsed.rows.map((row, index) => stageRow(row, index + 2, batchId, fieldMapping));
  const warnings = [...parsed.warnings, ...fieldMapping.warnings];
  const balanceColumn = getMappedColumn(fieldMapping, "balance");
  const descriptionColumn = getMappedColumn(fieldMapping, "description");
  const signConvention = getSignConvention(fieldMapping);

  const analysis: BankImportAnalysis = {
    batch: {
      id: batchId,
      fileName: input.fileName,
      uploadedAt,
      uploadedByInitials: input.uploadedByInitials,
      rowCount: parsed.rows.length,
      detectedColumns: parsed.columns,
      mappingStatus: fieldMapping.unmappedRequiredFields.length
        ? "needs_review"
        : fieldMapping.confidenceScore >= 0.5
          ? "mapped"
          : "unmapped",
      warnings,
    },
    columnTypes: inferColumnTypes(parsed.columns, parsed.rows),
    fieldMapping,
    stagedTransactions,
    sampleRows: sanitizeSampleRows(parsed.rows, 10),
    bankNameOrExportType: inferBankName(input.fileName, parsed.columns),
    depositExpenseSignConvention: signConvention,
    detectedCapabilities: {
      dateColumn: getMappedColumn(fieldMapping, "postedDate"),
      descriptionColumn,
      debitColumn: getMappedColumn(fieldMapping, "debit"),
      creditColumn: getMappedColumn(fieldMapping, "credit"),
      amountColumn: getMappedColumn(fieldMapping, "amount"),
      balanceColumn,
      checkNumberColumn: getMappedColumn(fieldMapping, "checkNumber"),
      processorInfoInMemo: descriptionColumn ? parsed.rows.some((row) => /goodchange|stripe|processor|payout/i.test(row[descriptionColumn] ?? "")) : false,
      runningBalance: Boolean(balanceColumn),
    },
    possibleDeposits: stagedTransactions.filter((row) => row.transactionType === "deposit").length,
    possibleExpenditures: stagedTransactions.filter((row) => row.transactionType === "expense").length,
    possibleFees: stagedTransactions.filter((row) => row.transactionType === "fee").length,
    possibleTransfers: stagedTransactions.filter((row) => row.transactionType === "transfer").length,
    notes: [
      "Pass 1 stages bank rows for reconciliation preview only; no ledger entries are finalized.",
      "Uploaded bank CSVs may contain private financial data and are ignored by git.",
    ],
  };

  if (input.persist !== false) {
    await mkdir(STORAGE_DIR, { recursive: true });
    await writeFile(path.join(STORAGE_DIR, `${batchId}.analysis.json`), `${JSON.stringify(analysis, null, 2)}\n`, "utf8");
  }

  return analysis;
}

function stageRow(
  row: Record<string, string>,
  sourceRowNumber: number,
  batchId: string,
  fieldMapping: ReturnType<typeof mapBankColumns>,
): BankStagedTransaction {
  const value = (field: string) => {
    const column = getMappedColumn(fieldMapping, field);
    return column ? row[column]?.trim() || undefined : undefined;
  };
  const debit = parseMoney(value("debit"));
  const credit = parseMoney(value("credit"));
  const amount = parseMoney(value("amount")) ?? (credit !== undefined ? credit : debit !== undefined ? -Math.abs(debit) : undefined);
  const description = value("description");
  const transactionType = classifyTransaction({ amount, debit, credit, description });
  const warnings = [
    !value("postedDate") ? "Missing posted date." : undefined,
    !description ? "Missing description." : undefined,
    amount === undefined && debit === undefined && credit === undefined ? "Missing amount/debit/credit." : undefined,
  ].filter((warning): warning is string => Boolean(warning));

  return {
    id: `${batchId}-row-${sourceRowNumber}`,
    batchId,
    rawRowHash: stableHash(row),
    sourceRowNumber,
    postedDate: value("postedDate"),
    description,
    amount,
    debit,
    credit,
    balance: parseMoney(value("balance")),
    checkNumber: value("checkNumber"),
    transactionType,
    reconciliationStatus: "unmatched",
    raw: row,
    warnings,
  };
}

function classifyTransaction(input: {
  amount?: number;
  debit?: number;
  credit?: number;
  description?: string;
}): BankStagedTransaction["transactionType"] {
  const description = input.description ?? "";
  if (/fee|service charge|processing/i.test(description)) return "fee";
  if (/transfer|xfer/i.test(description)) return "transfer";
  if ((input.credit ?? 0) > 0 || (input.amount ?? 0) > 0) return "deposit";
  if ((input.debit ?? 0) > 0 || (input.amount ?? 0) < 0) return "expense";
  return "unknown";
}

function getSignConvention(fieldMapping: ReturnType<typeof mapBankColumns>): BankImportAnalysis["depositExpenseSignConvention"] {
  if (getMappedColumn(fieldMapping, "debit") || getMappedColumn(fieldMapping, "credit")) return "debit_credit_columns";
  if (getMappedColumn(fieldMapping, "amount")) return "positive_negative";
  return "unknown";
}

function inferBankName(fileName: string, columns: string[]): string | undefined {
  const haystack = `${fileName} ${columns.join(" ")}`.toLowerCase();
  if (haystack.includes("arvest")) return "Arvest export";
  if (haystack.includes("bank of america")) return "Bank of America export";
  if (haystack.includes("regions")) return "Regions export";
  if (haystack.includes("first security")) return "First Security export";
  return undefined;
}

function createBatchId(prefix: string, fileName: string): string {
  const safe = fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "upload";
  return `${prefix}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${safe}`;
}
