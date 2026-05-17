import { approveReceipt, convertReceiptToMoneyMovement } from "../../src/lib/compliance/receipts/convert-receipt-to-money-movement";
import { createStagedReceipt } from "../../src/lib/compliance/receipts/receipt-storage";

async function main() {
  const draft = await createStagedReceipt({
    createdByInitials: "QA",
    vendorName: "Synthetic Receipt Vendor",
    receiptDate: "2026-05-17",
    subtotal: 20,
    tax: 2,
    tip: 3,
    total: 25,
    tipStatus: "tip_on_receipt",
    paymentMethod: "campaign_card",
    cardLastFour: "4242",
    category: "meals",
    businessPurpose: "Synthetic campaign meal during county travel day.",
    sourceFileName: "synthetic-receipt.txt",
  });
  if (draft.approvalStatus !== "not_approved") throw new Error("Unapproved receipt should not be approved.");
  if (draft.moneyMovementId) throw new Error("Unapproved receipt should not create money movement.");
  const approved = await approveReceipt({ receiptId: draft.id, actorInitials: "QA" });
  const converted = await convertReceiptToMoneyMovement({ receiptId: approved.id, actorInitials: "QA" });
  if (!converted.moneyMovementId) throw new Error("Approved receipt did not create money movement.");
  if (converted.reconciliationStatus !== "awaiting_bank_match") throw new Error("Converted receipt should await bank match.");
  console.log(JSON.stringify({
    receiptId: converted.id,
    moneyMovementId: converted.moneyMovementId,
    tipQuestion: converted.tipStatus,
    approvalStatus: converted.approvalStatus,
    reconciliationStatus: converted.reconciliationStatus,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
