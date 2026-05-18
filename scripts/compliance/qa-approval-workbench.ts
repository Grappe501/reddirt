import { buildApprovalQueues } from "../../src/lib/compliance/approval/build-approval-queue";
import {
  approveItem,
  approveItemWithChanges,
  markNeedsInfo,
  rejectItem,
  reopenItem,
  saveApprovalFieldEdits,
} from "../../src/lib/compliance/approval/approval-actions";
import { evaluateApprovalGuards } from "../../src/lib/compliance/approval/approval-guards";
import { getBatchEligibleItems, getNextQueueItem } from "../../src/lib/compliance/approval/load-approval-queue";
import { saveApprovalItems, saveApprovalQueues, loadApprovalItems } from "../../src/lib/compliance/approval/approval-storage";
import { APRIL_2026_QUEUE_ID } from "../../src/lib/compliance/approval/build-approval-queue";

async function main() {
  const { queues, items } = await buildApprovalQueues();
  await saveApprovalQueues(queues);
  await saveApprovalItems(items);
  if (!queues.length) throw new Error("Queue build produced no queues");
  if (!items.length) throw new Error("Queue build produced no items");

  const sample = items.find((item) => item.fields.length > 0 && item.evidence.length > 0) ?? items[0];
  if (!sample.fields.length) throw new Error("Approval item missing fields");
  if (!sample.evidence.length && sample.blockers.length === 0) {
    console.warn("warn: sample item has no evidence");
  }

  const blocked = { ...sample, missingFields: ["Donor"], fields: sample.fields.map((f) => (f.key === "donorFullName" ? { ...f, validationStatus: "missing" as const, value: "" } : f)) };
  const blockedGuards = evaluateApprovalGuards(blocked);
  if (blockedGuards.canApprove) throw new Error("Blocked item should not approve");

  const editKey = sample.fields[0]?.key ?? "amount";
  await saveApprovalFieldEdits(sample.id, { [editKey]: sample.fields[0]?.value ?? "qa" }, "QA");
  const afterEdit = (await loadApprovalItems()).find((item) => item.id === sample.id);
  if (!afterEdit) throw new Error("Editable field save failed");

  const highRisk = items.find((item) => item.riskLevel === "high" || item.blockers.length > 0);
  const eligible = await getBatchEligibleItems(APRIL_2026_QUEUE_ID);
  if (highRisk && eligible.some((item) => item.id === highRisk.id)) {
    throw new Error("Batch approval must reject high-risk items");
  }

  const lowRisk = eligible[0] ?? items.find((item) => item.riskLevel === "low" && !item.blockers.length && item.evidence.length);
  if (lowRisk) {
    const guards = evaluateApprovalGuards(lowRisk);
    if (guards.canApprove) await approveItem(lowRisk.id, "QA", "qa-approve");
  }

  const needsInfoTarget = items.find((item) => item.id !== lowRisk?.id && item.status === "needs_review");
  if (needsInfoTarget) await markNeedsInfo(needsInfoTarget.id, "QA", "qa-needs-info");

  const rejectTarget = items.find((item) => item.status === "needs_review" && item.id !== needsInfoTarget?.id);
  if (rejectTarget) await rejectItem(rejectTarget.id, "QA", "qa-reject");

  if (lowRisk) {
    await approveItemWithChanges(lowRisk.id, "QA", "qa-approve-changes");
    await reopenItem(lowRisk.id, "QA", "qa-reopen");
  }

  const next = await getNextQueueItem(APRIL_2026_QUEUE_ID);
  if (!next && items.some((item) => ["queued", "needs_review", "ready", "reopened"].includes(item.status))) {
    console.warn("warn: auto-next returned null while items remain");
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        queues: queues.length,
        items: items.length,
        blockedGuard: blockedGuards.canApprove === false,
        batchEligible: eligible.length,
        nextItem: next?.id ?? null,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
