import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { inferColumnTypes, parseBooleanish, parseCsv, parseMoney, sanitizeSampleRows, stableHash } from "./csv-column-detector";
import { getMappedColumn, mapGoodChangeColumns } from "./goodchange-field-mapper";
import type { GoodChangeImportAnalysis, GoodChangeStagedContribution } from "./types";

const STORAGE_DIR = path.join(process.cwd(), "data", "compliance", "imports", "goodchange");

export async function stageGoodChangeImport(input: {
  fileName: string;
  csvText: string;
  uploadedByInitials?: string;
  persist?: boolean;
}): Promise<GoodChangeImportAnalysis> {
  const parsed = parseCsv(input.csvText);
  const fieldMapping = mapGoodChangeColumns(parsed.columns);
  const batchId = createBatchId("goodchange", input.fileName);
  const uploadedAt = new Date().toISOString();
  const stagedContributions = parsed.rows.map((row, index) =>
    stageRow(row, index + 2, batchId, fieldMapping),
  );
  const warnings = [
    ...parsed.warnings,
    ...fieldMapping.warnings,
    ...batchWarnings(stagedContributions),
  ];

  const analysis: GoodChangeImportAnalysis = {
    batch: {
      id: batchId,
      fileName: input.fileName,
      uploadedAt,
      uploadedByInitials: input.uploadedByInitials,
      rowCount: parsed.rows.length,
      detectedColumns: parsed.columns,
      mappingStatus: fieldMapping.unmappedRequiredFields.length
        ? "needs_review"
        : fieldMapping.confidenceScore >= 0.55
          ? "mapped"
          : "unmapped",
      warnings,
    },
    columnTypes: inferColumnTypes(parsed.columns, parsed.rows),
    fieldMapping,
    stagedContributions,
    sampleRows: sanitizeSampleRows(parsed.rows, 10),
    possibleContributionFields: presentMappedFields(fieldMapping, ["amount", "grossAmount", "netAmount", "transactionDate"]),
    duplicateRisks: duplicateRiskSummary(stagedContributions),
    donorIdentityFields: presentMappedFields(fieldMapping, ["donorFirstName", "donorLastName", "donorFullName", "donorEmail", "donorPhone"]),
    transactionFields: presentMappedFields(fieldMapping, ["transactionDate", "depositDate", "processorTransactionId", "goodChangeContributionId"]),
    feeRefundRecurringFields: presentMappedFields(fieldMapping, ["feeAmount", "refund", "recurring"]),
    employerOccupationAddressAvailability: {
      employer: Boolean(getMappedColumn(fieldMapping, "employer")),
      occupation: Boolean(getMappedColumn(fieldMapping, "occupation")),
      address1: Boolean(getMappedColumn(fieldMapping, "donorAddress1")),
      city: Boolean(getMappedColumn(fieldMapping, "donorCity")),
      state: Boolean(getMappedColumn(fieldMapping, "donorState")),
      zip: Boolean(getMappedColumn(fieldMapping, "donorZip")),
    },
    notes: [
      "Pass 1 stages GoodChange rows for analysis only; no contribution records are finalized.",
      "Uploaded CSVs may contain donor/private data and are ignored by git.",
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
  fieldMapping: ReturnType<typeof mapGoodChangeColumns>,
): GoodChangeStagedContribution {
  const value = (field: string) => {
    const column = getMappedColumn(fieldMapping, field);
    return column ? row[column]?.trim() || undefined : undefined;
  };
  const amount = parseMoney(value("amount"));
  const grossAmount = parseMoney(value("grossAmount"));
  const feeAmount = parseMoney(value("feeAmount"));
  const netAmount = parseMoney(value("netAmount"));
  const refund = parseBooleanish(value("refund")) || (amount !== undefined && amount < 0) || (netAmount !== undefined && netAmount < 0);
  const recurring = parseBooleanish(value("recurring"));
  const donorFullName = value("donorFullName");
  const donorFirstName = value("donorFirstName");
  const donorLastName = value("donorLastName");
  const missingFields = [
    !donorFullName && (!donorFirstName || !donorLastName) ? "donor name" : undefined,
    !value("donorAddress1") ? "address" : undefined,
    !value("donorCity") || !value("donorState") || !value("donorZip") ? "city/state/zip" : undefined,
    !value("employer") ? "employer" : undefined,
    !value("occupation") ? "occupation" : undefined,
    amount === undefined && grossAmount === undefined && netAmount === undefined ? "amount" : undefined,
    !value("transactionDate") ? "date" : undefined,
  ].filter((field): field is string => Boolean(field));
  const warnings = [
    recurring ? "Recurring contribution flag present." : undefined,
    refund ? "Refund or negative amount detected." : undefined,
    feeAmount !== undefined ? "Processor fee field present." : undefined,
  ].filter((warning): warning is string => Boolean(warning));

  return {
    id: `${batchId}-row-${sourceRowNumber}`,
    batchId,
    rawRowHash: stableHash(row),
    sourceRowNumber,
    donorFirstName,
    donorLastName,
    donorFullName,
    donorEmail: value("donorEmail"),
    donorPhone: value("donorPhone"),
    donorAddress1: value("donorAddress1"),
    donorAddress2: value("donorAddress2"),
    donorCity: value("donorCity"),
    donorState: value("donorState"),
    donorZip: value("donorZip"),
    employer: value("employer"),
    occupation: value("occupation"),
    transactionDate: value("transactionDate"),
    depositDate: value("depositDate"),
    amount,
    grossAmount,
    feeAmount,
    netAmount,
    paymentMethod: value("paymentMethod"),
    processorTransactionId: value("processorTransactionId"),
    goodChangeContributionId: value("goodChangeContributionId"),
    recurring,
    refund,
    complianceStatus: refund
      ? "refund_or_negative"
      : missingFields.length
        ? "missing_required_fields"
        : "ready",
    missingFields,
    warnings,
    raw: row,
  };
}

function createBatchId(prefix: string, fileName: string): string {
  const safe = fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "upload";
  return `${prefix}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${safe}`;
}

function presentMappedFields(fieldMapping: ReturnType<typeof mapGoodChangeColumns>, fields: string[]): string[] {
  return fields.flatMap((field) => {
    const column = getMappedColumn(fieldMapping, field);
    return column ? [`${field}: ${column}`] : [];
  });
}

function duplicateRiskSummary(rows: GoodChangeStagedContribution[]): string[] {
  const byHash = countBy(rows.map((row) => row.rawRowHash));
  const byTransactionId = countBy(rows.map((row) => row.processorTransactionId).filter(isPresent));
  const risks = [
    ...Object.entries(byHash).filter(([, count]) => count > 1).map(([hash, count]) => `${count} rows share raw hash ${hash}.`),
    ...Object.entries(byTransactionId).filter(([, count]) => count > 1).map(([id, count]) => `${count} rows share transaction id ${id}.`),
  ];
  return risks.slice(0, 20);
}

function batchWarnings(rows: GoodChangeStagedContribution[]): string[] {
  const missingEmployer = rows.filter((row) => row.missingFields.includes("employer")).length;
  const missingOccupation = rows.filter((row) => row.missingFields.includes("occupation")).length;
  const refunds = rows.filter((row) => row.refund).length;
  return [
    missingEmployer ? `${missingEmployer} staged row(s) are missing employer.` : undefined,
    missingOccupation ? `${missingOccupation} staged row(s) are missing occupation.` : undefined,
    refunds ? `${refunds} staged row(s) look like refunds or negative amounts.` : undefined,
  ].filter((warning): warning is string => Boolean(warning));
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function isPresent(value: string | undefined): value is string {
  return Boolean(value);
}
