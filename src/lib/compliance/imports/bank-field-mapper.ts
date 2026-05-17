import { normalizeColumnName } from "./csv-column-detector";
import type { FieldMappingCandidate, FieldMappingResult } from "./types";

const BANK_PATTERNS: Record<string, string[]> = {
  postedDate: ["posted date", "post date", "date", "transaction date", "effective date"],
  description: ["description", "memo", "details", "transaction description", "payee"],
  amount: ["amount", "transaction amount"],
  debit: ["debit", "withdrawal", "withdrawals", "paid out", "money out"],
  credit: ["credit", "deposit", "deposits", "paid in", "money in"],
  balance: ["balance", "running balance", "available balance", "ledger balance"],
  checkNumber: ["check", "check number", "check no", "chk no", "number"],
};

export function mapBankColumns(columns: string[]): FieldMappingResult {
  const normalized = columns.map((column) => ({ column, normalized: normalizeColumnName(column) }));
  const mappings = Object.entries(BANK_PATTERNS).map(([field, patterns]) => {
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
  const unmappedRequiredFields = [
    !mappedFields.has("postedDate") ? "postedDate" : undefined,
    !mappedFields.has("description") ? "description" : undefined,
    !mappedFields.has("amount") && !mappedFields.has("debit") && !mappedFields.has("credit") ? "amount/debit/credit" : undefined,
  ].filter((field): field is string => Boolean(field));
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
