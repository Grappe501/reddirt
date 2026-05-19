import { loadBankAnalyses } from "../storage";
import { createSuggestedMatchAsDraft } from "./reconciliation-actions";
import { rehearsalMatchId, resolveBankTransactionId } from "./build-reconciliation-review-board";

export async function createReconciliationDraftFromRehearsal(input: {
  bankRowNumber: number;
  payoutKey?: string;
  bankAmount: number;
  ledgerAmount?: number;
  actorInitials: string;
  note?: string;
  resolutionKind: "high_confidence" | "ambiguous_pick" | "unmatched_investigate";
}): Promise<{ matchId: string }> {
  const bankAnalyses = await loadBankAnalyses();
  const bankTxnId = resolveBankTransactionId(input.bankRowNumber, bankAnalyses);
  const matchId = input.payoutKey
    ? rehearsalMatchId(input.bankRowNumber, input.payoutKey)
    : rehearsalMatchId(input.bankRowNumber);
  const ledgerAmount = input.ledgerAmount ?? input.bankAmount;

  await createSuggestedMatchAsDraft({
    matchId,
    matchType: "goodchange_deposit_to_bank_deposit",
    bankTransactionIds: [bankTxnId],
    moneyMovementIds: [],
    bankAmount: input.bankAmount,
    ledgerAmount,
    confidence: input.resolutionKind === "high_confidence" ? "high" : "medium",
    notes: [
      `Treasurer draft (${input.resolutionKind.replace(/_/g, " ")}).`,
      input.note,
      `Initials: ${input.actorInitials}`,
      input.payoutKey ? `Payout: ${input.payoutKey}` : "No payout selected — investigate.",
    ]
      .filter(Boolean)
      .join(" "),
  });

  return { matchId };
}
