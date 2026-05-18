import { buildReconciliationWorkbench, upsertReconciliationMatch } from "../../src/lib/compliance/reconciliation/reconciliation-workbench-storage";

async function main() {
  const before = await buildReconciliationWorkbench();
  const match = await upsertReconciliationMatch({
    id: "qa-reconciliation-synthetic",
    matchType: "manual",
    status: "suggested",
    confidence: "low",
    bankTransactionIds: [],
    moneyMovementIds: [],
    sourceRecordIds: ["qa"],
    bankAmount: 10,
    ledgerAmount: 9.5,
    reviewerInitials: "QA",
    notes: "Synthetic reconciliation shape check.",
  });
  if (match.variance !== 0.5) throw new Error("Variance calculation failed.");
  const after = await buildReconciliationWorkbench();
  if (!after.matches.some((item) => item.id === match.id)) throw new Error("Synthetic reconciliation match was not saved.");
  console.log(JSON.stringify({ status: "ok", beforeMatches: before.matches.length, afterMatches: after.matches.length, variance: match.variance }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
