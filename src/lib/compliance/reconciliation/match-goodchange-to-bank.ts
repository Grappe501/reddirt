import type {
  BankStagedTransaction,
  GoodChangeStagedContribution,
  ReconciliationAnalysis,
  ReconciliationCandidate,
} from "../imports/types";

export function matchGoodChangeToBank(input: {
  goodChangeContributions: GoodChangeStagedContribution[];
  bankTransactions: BankStagedTransaction[];
}): ReconciliationAnalysis {
  const candidates: ReconciliationCandidate[] = [];
  const deposits = input.bankTransactions.filter((transaction) => transaction.transactionType === "deposit");
  const contributions = input.goodChangeContributions.filter((contribution) => !contribution.refund);
  const contributionsByBatch = groupBy(contributions, (contribution) => contribution.batchId);

  for (const bankTransaction of deposits) {
    const bankAmount = positiveAmount(bankTransaction.credit ?? bankTransaction.amount);
    if (bankAmount === undefined) continue;

    const transactionIdMatches = contributions.filter((contribution) => {
      const memo = bankTransaction.description?.toLowerCase() ?? "";
      return Boolean(contribution.processorTransactionId && memo.includes(contribution.processorTransactionId.toLowerCase()));
    });
    if (transactionIdMatches.length) {
      candidates.push(buildCandidate("transaction_id_memo", "high", bankTransaction, transactionIdMatches, "Processor transaction id appears in the bank memo."));
      continue;
    }

    const exact = contributions.filter((contribution) => {
      const net = contribution.netAmount ?? contribution.amount;
      return net !== undefined && isSameMoney(net, bankAmount) && sameDate(contribution.depositDate ?? contribution.transactionDate, bankTransaction.postedDate);
    });
    if (exact.length) {
      candidates.push(buildCandidate("exact_amount_date", "high", bankTransaction, exact, "GoodChange net/amount and date match the bank deposit."));
      continue;
    }

    const windowed = contributions.filter((contribution) => {
      const net = contribution.netAmount ?? contribution.amount;
      const diff = daysBetween(contribution.depositDate ?? contribution.transactionDate, bankTransaction.postedDate);
      return net !== undefined && isSameMoney(net, bankAmount) && diff !== undefined && diff >= 0 && diff <= 5;
    });
    if (windowed.length) {
      const diff = daysBetween(windowed[0].depositDate ?? windowed[0].transactionDate, bankTransaction.postedDate);
      candidates.push(buildCandidate("amount_with_date_window", "medium", bankTransaction, windowed, "Amount matches with a 1-5 day deposit window.", diff));
      continue;
    }

    for (const [batchId, batchContributions] of Object.entries(contributionsByBatch)) {
      const netTotal = roundMoney(batchContributions.reduce((total, contribution) => total + (contribution.netAmount ?? contribution.amount ?? 0), 0));
      if (isSameMoney(netTotal, bankAmount)) {
        candidates.push(buildCandidate("batch_total_to_deposit", "medium", bankTransaction, batchContributions, `GoodChange batch ${batchId} net total matches this bank deposit.`));
        continue;
      }
    }

    if (/goodchange|stripe|processor|payout|merchant/i.test(bankTransaction.description ?? "")) {
      candidates.push({
        id: `recon-${bankTransaction.id}-processor`,
        bankTransactionId: bankTransaction.id,
        matchType: "possible_processor_deposit",
        confidence: "low",
        goodChangeContributionIds: [],
        bankAmount,
        explanation: "Bank memo looks like a processor deposit, but no deterministic GoodChange row or batch total matched.",
        humanReviewRequired: true,
      });
    } else {
      candidates.push({
        id: `recon-${bankTransaction.id}-manual`,
        bankTransactionId: bankTransaction.id,
        matchType: "manual_required",
        confidence: "low",
        goodChangeContributionIds: [],
        bankAmount,
        explanation: "No deterministic GoodChange match found for this deposit.",
        humanReviewRequired: true,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    goodChangeBatchCount: new Set(input.goodChangeContributions.map((row) => row.batchId)).size,
    bankBatchCount: new Set(input.bankTransactions.map((row) => row.batchId)).size,
    candidates,
    summary: {
      highConfidence: candidates.filter((candidate) => candidate.confidence === "high").length,
      mediumConfidence: candidates.filter((candidate) => candidate.confidence === "medium").length,
      lowConfidence: candidates.filter((candidate) => candidate.confidence === "low").length,
      manualRequired: candidates.filter((candidate) => candidate.humanReviewRequired).length,
    },
    notes: [
      "Pass 1 preview only; no bank transaction is marked reconciled without human approval.",
      "Batch-total matching assumes the supplied GoodChange export has a payout/deposit grouping or represents a single payout window.",
    ],
  };
}

function buildCandidate(
  matchType: ReconciliationCandidate["matchType"],
  confidence: ReconciliationCandidate["confidence"],
  bankTransaction: BankStagedTransaction,
  contributions: GoodChangeStagedContribution[],
  explanation: string,
  dateDifferenceDays?: number,
): ReconciliationCandidate {
  const grossTotal = roundMoney(contributions.reduce((total, contribution) => total + (contribution.grossAmount ?? contribution.amount ?? 0), 0));
  const feeTotal = roundMoney(contributions.reduce((total, contribution) => total + (contribution.feeAmount ?? 0), 0));
  const netTotal = roundMoney(contributions.reduce((total, contribution) => total + (contribution.netAmount ?? contribution.amount ?? 0), 0));
  return {
    id: `recon-${bankTransaction.id}-${matchType}`,
    goodChangeBatchId: contributions[0]?.batchId,
    bankTransactionId: bankTransaction.id,
    matchType,
    confidence,
    goodChangeContributionIds: contributions.map((contribution) => contribution.id),
    bankAmount: positiveAmount(bankTransaction.credit ?? bankTransaction.amount) ?? 0,
    goodChangeGrossTotal: grossTotal,
    goodChangeFeeTotal: feeTotal,
    goodChangeNetTotal: netTotal,
    dateDifferenceDays,
    explanation,
    humanReviewRequired: confidence !== "high",
  };
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = getKey(item);
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

function positiveAmount(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.abs(value);
}

function isSameMoney(a: number, b: number): boolean {
  return Math.abs(roundMoney(a) - roundMoney(b)) < 0.01;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function sameDate(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  return a.slice(0, 10) === b.slice(0, 10);
}

function daysBetween(a: string | undefined, b: string | undefined): number | undefined {
  if (!a || !b) return undefined;
  const left = Date.parse(`${a.slice(0, 10)}T00:00:00.000Z`);
  const right = Date.parse(`${b.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(left) || Number.isNaN(right)) return undefined;
  return Math.round((right - left) / (24 * 60 * 60 * 1000));
}
