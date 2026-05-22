import type { April26PayoutBatch, April26ReconciliationCandidate } from "./types";
import type { MappedGoodChangeContribution } from "./types";
import type { BankCsvRow } from "./parse-bank-csv";
import { centsToDollars } from "./parse-money";

export function buildPayoutBatches(rows: MappedGoodChangeContribution[]): April26PayoutBatch[] {
  const byPayout = new Map<string, April26PayoutBatch>();
  for (const row of rows) {
    if (!row.payoutId) continue;
    const current = byPayout.get(row.payoutId) ?? {
      payoutId: row.payoutId,
      grossTotal: 0,
      feeTotal: 0,
      netExpectedDeposit: 0,
      transactionCount: 0,
      earliestDate: row.receivedAt,
      latestDate: row.receivedAt,
      matchStatus: "unmatched" as const,
    };
    current.grossTotal += centsToDollars(row.grossCents);
    current.feeTotal += centsToDollars(row.feeCents);
    current.netExpectedDeposit += centsToDollars(row.netCents);
    current.transactionCount += 1;
    if (row.receivedAt < current.earliestDate) current.earliestDate = row.receivedAt;
    if (row.receivedAt > current.latestDate) current.latestDate = row.receivedAt;
    byPayout.set(row.payoutId, current);
  }
  return [...byPayout.values()].map((batch) => ({
    ...batch,
    grossTotal: roundMoney(batch.grossTotal),
    feeTotal: roundMoney(batch.feeTotal),
    netExpectedDeposit: roundMoney(batch.netExpectedDeposit),
  }));
}

export function matchPayoutsToBankLines(
  batches: April26PayoutBatch[],
  bankLines: BankCsvRow[],
): { batches: April26PayoutBatch[]; candidates: April26ReconciliationCandidate[]; matchedCount: number } {
  const candidates: April26ReconciliationCandidate[] = [];
  let matchedCount = 0;
  const updated = batches.map((batch) => ({ ...batch }));
  const credits = bankLines.filter((line) => line.amountCents > 0);

  for (const batch of updated) {
    const expectedCents = Math.round(batch.netExpectedDeposit * 100);
    const match = credits.find((line) => line.amountCents === expectedCents);
    if (!match) continue;
    batch.matchStatus = "matched";
    batch.matchedBankLineId = `bank-${match.postedAt}-${match.amountCents}`;
    matchedCount += 1;
    candidates.push({
      id: `recon-payout-${batch.payoutId}`,
      linkType: "payout_to_bank_deposit",
      leftKind: "payout_expectation",
      leftId: batch.payoutId,
      rightKind: "bank_line",
      rightId: batch.matchedBankLineId,
      confidence: "high",
      notes: `Matched net deposit $${batch.netExpectedDeposit.toFixed(2)} to bank credit on ${match.postedAt}.`,
      humanReviewRequired: true,
    });
  }

  return { batches: updated, candidates, matchedCount };
}

export function suggestReceiptToExpenseLinks(input: {
  receiptDocIds: Array<{ id: string; amountCents?: number; transactionDate?: string }>;
  expenseIds: Array<{ id: string; amountCents: number; spentAt: string }>;
}): April26ReconciliationCandidate[] {
  const candidates: April26ReconciliationCandidate[] = [];
  for (const receipt of input.receiptDocIds) {
    if (!receipt.amountCents) continue;
    const match = input.expenseIds.find(
      (expense) => expense.amountCents === receipt.amountCents && expense.spentAt === receipt.transactionDate,
    );
    if (!match) continue;
    candidates.push({
      id: `recon-receipt-${receipt.id}-${match.id}`,
      linkType: "expense_to_receipt",
      leftKind: "source_document",
      leftId: receipt.id,
      rightKind: "expense",
      rightId: match.id,
      confidence: "medium",
      notes: "Matched receipt OCR to Ethics expenditure by amount and date — treasurer must confirm.",
      humanReviewRequired: true,
    });
  }
  return candidates;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
