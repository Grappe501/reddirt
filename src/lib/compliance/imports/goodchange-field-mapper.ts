import { normalizeColumnName } from "./csv-column-detector";
import type { FieldMappingCandidate, FieldMappingResult } from "./types";

const GOODCHANGE_PATTERNS: Record<string, string[]> = {
  donorFirstName: ["first name", "firstname", "donor first", "contributor first", "first"],
  donorLastName: ["last name", "lastname", "donor last", "contributor last", "last"],
  donorFullName: ["full name", "name", "donor name", "contributor name", "customer name"],
  donorEmail: ["email", "email address", "donor email", "contributor email"],
  donorPhone: ["phone", "phone number", "mobile", "donor phone"],
  donorAddress1: ["address", "address 1", "street", "street address", "billing address"],
  donorAddress2: ["address 2", "apt", "suite", "unit"],
  donorCity: ["city", "donor city", "billing city"],
  donorState: ["state", "donor state", "billing state"],
  donorZip: ["zip", "zipcode", "postal", "postal code", "zip code"],
  employer: ["employer", "occupation employer", "donor employer"],
  occupation: ["occupation", "job title", "profession", "donor occupation"],
  transactionDate: ["transaction date", "date", "created", "created at", "donation date", "contribution date"],
  depositDate: ["deposit date", "payout date", "settlement date", "transfer date"],
  amount: ["amount", "contribution amount", "donation amount"],
  grossAmount: ["gross", "gross amount", "gross donation", "gross contribution"],
  feeAmount: ["fee", "fees", "processing fee", "processor fee", "goodchange fee"],
  netAmount: ["net", "net amount", "payout amount", "deposit amount", "settled amount"],
  paymentMethod: ["payment method", "card type", "method", "payment type"],
  processorTransactionId: ["transaction id", "processor transaction id", "stripe id", "payment id"],
  goodChangeContributionId: ["goodchange id", "goodchange contribution id", "contribution id", "donation id"],
  recurring: ["recurring", "recurring donation", "subscription", "recurrence"],
  refund: ["refund", "refunded", "refund status", "status"],
};

const REQUIRED_FIELDS = ["donorFullName", "amount", "transactionDate"];

export function mapGoodChangeColumns(columns: string[]): FieldMappingResult {
  const normalized = columns.map((column) => ({ column, normalized: normalizeColumnName(column) }));
  const mappings = Object.entries(GOODCHANGE_PATTERNS).map(([field, patterns]) => {
    const alternatives = normalized
      .map(({ column, normalized: candidate }) => ({
        column,
        confidence: scoreColumn(candidate, patterns),
      }))
      .filter((candidate) => candidate.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    const best = alternatives[0];
    return {
      field,
      column: best?.confidence >= 0.55 ? best.column : undefined,
      confidence: best?.confidence ?? 0,
      alternatives,
    } satisfies FieldMappingCandidate;
  });

  const mappedFields = new Set(mappings.filter((mapping) => mapping.column).map((mapping) => mapping.field));
  const hasName = mappedFields.has("donorFullName") || (mappedFields.has("donorFirstName") && mappedFields.has("donorLastName"));
  const unmappedRequiredFields = REQUIRED_FIELDS.filter((field) => {
    if (field === "donorFullName") return !hasName;
    return !mappedFields.has(field);
  });
  const mappedCount = mappings.filter((mapping) => mapping.column).length;
  const confidenceScore = mappings.length ? Math.round((mappedCount / mappings.length) * 100) / 100 : 0;
  const warnings = unmappedRequiredFields.length
    ? [`Missing likely required fields: ${unmappedRequiredFields.join(", ")}.`]
    : [];

  return { confidenceScore, mappings, unmappedRequiredFields, warnings };
}

export function getMappedColumn(mapping: FieldMappingResult, field: string): string | undefined {
  return mapping.mappings.find((candidate) => candidate.field === field)?.column;
}

function scoreColumn(candidate: string, patterns: string[]): number {
  let score = 0;
  for (const pattern of patterns.map(normalizeColumnName)) {
    if (candidate === pattern) score = Math.max(score, 1);
    else if (candidate.includes(pattern)) score = Math.max(score, 0.82);
    else if (pattern.includes(candidate) && candidate.length > 3) score = Math.max(score, 0.65);
  }
  return score;
}
