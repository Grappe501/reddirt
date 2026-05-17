import { createStagedMoneyMovement, loadStagedMoneyMovements } from "./money-movement-storage";
import type { GoodChangeImportAnalysis, GoodChangeStagedContribution } from "../imports/types";

export async function stageGoodChangeMoneyCoverage(
  analysis: GoodChangeImportAnalysis,
): Promise<{ contributionMovements: number; feeMovements: number; skippedExisting: number }> {
  const existing = await loadStagedMoneyMovements();
  const existingRefs = new Set(existing.flatMap((movement) => movement.sourceRefs));
  let contributionMovements = 0;
  let feeMovements = 0;
  let skippedExisting = 0;

  for (const contribution of analysis.stagedContributions) {
    if (existingRefs.has(contribution.id)) {
      skippedExisting += 1;
      continue;
    }
    const amount = contribution.grossAmount ?? contribution.amount ?? contribution.netAmount ?? 0;
    if (amount > 0) {
      await createStagedMoneyMovement({
        source: "goodchange",
        direction: contribution.refund ? "out" : "in",
        category: contribution.refund ? "contribution_refund" : "contribution_credit_card",
        amount,
        grossAmount: contribution.grossAmount,
        feeAmount: contribution.feeAmount,
        netAmount: contribution.netAmount,
        transactionDate: contribution.transactionDate,
        depositDate: contribution.depositDate,
        name: donorName(contribution),
        entityType: "individual",
        address1: contribution.donorAddress1,
        city: contribution.donorCity,
        state: contribution.donorState,
        zip: contribution.donorZip,
        employer: contribution.employer,
        occupation: contribution.occupation,
        paymentMethod: "credit_card",
        processorTransactionId: contribution.processorTransactionId ?? contribution.goodChangeContributionId,
        description: "GoodChange credit-card contribution coverage record.",
        documentationStatus: contribution.missingFields.length ? "missing_donor_info" : "complete",
        sourceRefs: [analysis.batch.id, contribution.id],
        actorInitials: analysis.batch.uploadedByInitials ?? "GC",
        sourceRoute: "/admin/compliance/imports/goodchange",
      });
      contributionMovements += 1;
    }
    if ((contribution.feeAmount ?? 0) > 0) {
      await createStagedMoneyMovement({
        source: "processor_fee",
        direction: "out",
        category: "processor_fee",
        amount: contribution.feeAmount ?? 0,
        transactionDate: contribution.transactionDate,
        depositDate: contribution.depositDate,
        name: "GoodChange processor",
        entityType: "business",
        paymentMethod: "credit_card",
        processorTransactionId: contribution.processorTransactionId ?? contribution.goodChangeContributionId,
        description: "GoodChange processor fee coverage record.",
        purpose: "Fundraising processing fee",
        documentationStatus: "complete",
        sourceRefs: [analysis.batch.id, `${contribution.id}:processor_fee`],
        actorInitials: analysis.batch.uploadedByInitials ?? "GC",
        sourceRoute: "/admin/compliance/imports/goodchange",
      });
      feeMovements += 1;
    }
  }

  return { contributionMovements, feeMovements, skippedExisting };
}

function donorName(contribution: GoodChangeStagedContribution): string | undefined {
  const parsedName = [contribution.donorFirstName, contribution.donorLastName].filter(Boolean).join(" ");
  return contribution.donorFullName ?? (parsedName || undefined);
}
