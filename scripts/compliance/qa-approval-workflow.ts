import { appendApprovalEvent, buildApprovalChain } from "../../src/lib/compliance/approvals/approval-storage";

async function main() {
  const recordId = `qa-approval-${Date.now()}`;
  await appendApprovalEvent({ recordId, recordType: "money_movement", stage: "entered", role: "staff", actorInitials: "QA" });
  await appendApprovalEvent({ recordId, recordType: "money_movement", stage: "approved", role: "treasurer", actorInitials: "QA", note: "Synthetic approval." });
  const chain = await buildApprovalChain(recordId, ["staff", "treasurer"]);
  if (chain.humanReviewRequired !== true) throw new Error("Approval chain must require human review.");
  if (!chain.completedRoles.includes("treasurer")) throw new Error("Approval role completion not recorded.");
  console.log(JSON.stringify({ status: "ok", recordId, currentStage: chain.currentStage, completedRoles: chain.completedRoles }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
