import type { April26AiChunk, April26AiChunkType, April26PayoutBatch, April26ReconciliationCandidate } from "./types";
import type { MappedGoodChangeContribution } from "./types";
import type { ContributionDraft } from "./types";
import { contributionChunkText, formatContributorName } from "./parse-goodchange";
import { ethicsContributionChunk, ethicsExpenseChunk } from "./parse-ethics-xlsx";
import { imageExtractionChunk } from "./extract-image";
import type { ImageExtractionResult } from "./types";
import type { BankCsvRow } from "./parse-bank-csv";
import { centsToDollars } from "./parse-money";

let chunkCounter = 0;

function nextChunkId(prefix: string): string {
  chunkCounter += 1;
  return `april26-chunk-${prefix}-${chunkCounter}`;
}

export function resetApril26ChunkCounter(): void {
  chunkCounter = 0;
}

export function buildGoodChangeRowChunks(rows: MappedGoodChangeContribution[], sourceDocumentId?: string): April26AiChunk[] {
  return rows.map((row) => ({
    id: nextChunkId("gc"),
    chunkType: "goodchange_row" as const,
    topic: "contribution",
    text: contributionChunkText(row, formatContributorName(row)),
    metadata: {
      transferId: row.sourceTransferId,
      payoutId: row.payoutId,
      receivedAt: row.receivedAt,
      grossCents: row.grossCents,
      netCents: row.netCents,
    },
    sourceDocumentId,
    humanReviewRequired: true,
  }));
}

export function buildContributionRowChunks(
  draft: ContributionDraft,
  label: string,
  sourceDocumentId?: string,
  sourceKey?: string,
): April26AiChunk {
  return {
    id: nextChunkId("contrib"),
    chunkType: "contribution_row",
    topic: "contribution",
    text: ethicsContributionChunk(draft, label),
    metadata: {
      sourceKey: sourceKey ?? "",
      paymentMethod: draft.paymentMethod,
      amountCents: draft.amountCents,
    },
    sourceDocumentId,
    humanReviewRequired: true,
  };
}

export function buildExpenseRowChunks(
  draft: { spentAt: string; amountCents: number; payeeName: string; expenseType: string; expenseCategory: string; memo: string; receiptRequired: boolean },
  sourceKey: string,
  sourceDocumentId?: string,
): April26AiChunk {
  return {
    id: nextChunkId("expense"),
    chunkType: "expense_row",
    topic: "expenditure",
    text: ethicsExpenseChunk(draft, draft.payeeName),
    metadata: { sourceKey, receiptRequired: draft.receiptRequired },
    sourceDocumentId,
    humanReviewRequired: true,
  };
}

export function buildImageOcrChunk(
  fileName: string,
  extraction: ImageExtractionResult,
  chunkType: "receipt_ocr" | "check_ocr" | "in_kind_ocr",
  sourceDocumentId?: string,
): April26AiChunk {
  return {
    id: nextChunkId(chunkType),
    chunkType,
    topic: extraction.documentType,
    text: imageExtractionChunk(fileName, extraction),
    metadata: {
      confidence: extraction.confidence,
      amountCents: extraction.amountCents,
      transactionDate: extraction.transactionDate,
    },
    sourceDocumentId,
    humanReviewRequired: true,
  };
}

export function buildPayoutBatchChunks(batches: April26PayoutBatch[]): April26AiChunk[] {
  return batches.map((batch) => ({
    id: nextChunkId("payout"),
    chunkType: "payout_batch" as const,
    topic: "reconciliation",
    text: [
      `April 2026 GoodChange payout batch ${batch.payoutId}`,
      `Transactions: ${batch.transactionCount}`,
      `Gross: $${batch.grossTotal.toFixed(2)} · Fees: $${batch.feeTotal.toFixed(2)} · Net expected deposit: $${batch.netExpectedDeposit.toFixed(2)}`,
      `Date range: ${batch.earliestDate} – ${batch.latestDate}`,
      `Match status: ${batch.matchStatus}`,
      `Reconcile net deposit to bank credit when bank-april-2026.csv is available.`,
    ].join("\n"),
    metadata: {
      payoutId: batch.payoutId,
      netExpectedDeposit: batch.netExpectedDeposit,
      matchStatus: batch.matchStatus,
    },
    humanReviewRequired: true,
  }));
}

export function buildBankLineChunks(lines: BankCsvRow[], sourceDocumentId?: string): April26AiChunk[] {
  return lines.map((line, index) => ({
    id: nextChunkId(`bank-${index}`),
    chunkType: "bank_line" as const,
    topic: "bank",
    text: `Bank line ${line.postedAt}: $${centsToDollars(line.amountCents).toFixed(2)} — ${line.memo}`,
    metadata: {
      postedAt: line.postedAt,
      amountCents: line.amountCents,
      checkNumber: line.checkNumber,
    },
    sourceDocumentId,
    humanReviewRequired: true,
  }));
}

export function buildReconciliationCandidateChunks(candidates: April26ReconciliationCandidate[]): April26AiChunk[] {
  return candidates.map((candidate) => ({
    id: nextChunkId("recon"),
    chunkType: "reconciliation_candidate" as const,
    topic: "reconciliation",
    text: `${candidate.linkType}: ${candidate.notes} (confidence ${candidate.confidence})`,
    metadata: {
      linkType: candidate.linkType,
      leftId: candidate.leftId,
      rightId: candidate.rightId,
      confidence: candidate.confidence,
    },
    humanReviewRequired: true,
  }));
}
