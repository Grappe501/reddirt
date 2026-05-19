import path from "node:path";
import { loadApprovalItems } from "../approval/approval-storage";
import { APRIL_2026_QUEUE_ID } from "../approval/build-approval-queue";
import { filterQueueItems } from "../approval/queue-navigation";
import { resolveBankSource } from "../april26/bank-source-adapter";
import { buildSourceTruthAudit } from "./source-truth-audit";

export type QueueUnlockReport = {
  generatedAt: string;
  openQueueCount: number;
  potentiallyUnlockedByBank: number;
  blockedByRuleReview: number;
  blockedByLowConfidence: number;
  sourceUpdatePendingResolvable: number;
  nearEligibleCount: number;
  next25OperatorActions: string[];
  expectedImpact: string;
};

export async function buildQueueUnlockReport(): Promise<QueueUnlockReport> {
  const [items, bank, audit] = await Promise.all([
    loadApprovalItems(),
    resolveBankSource(),
    buildSourceTruthAudit(),
  ]);
  const april = items.filter((i) => i.queueId === APRIL_2026_QUEUE_ID);
  const open = april.filter((i) => ["queued", "needs_review", "ready", "reopened"].includes(i.status));

  const ruleReview = open.filter((i) => i.source === "rule_review");
  const lowConf = filterQueueItems(open, "low_confidence");
  const nearEligible = filterQueueItems(open, "near_eligible");
  const sourcePending = open.filter((i) => i.status === "needs_info");

  const bankRelated = open.filter(
    (i) => i.source === "bank_transaction" || /bank|recon|payout/i.test(`${i.title} ${i.aiSummary ?? ""}`),
  );
  const potentiallyUnlocked = bank.canSatisfyBankRequirement ? bankRelated.length : 0;

  const actions: string[] = [];
  if (bank.canSatisfyBankRequirement) {
    actions.push("Run reconciliation workbench — bank source validated.");
  } else if (bank.databaseTransactionCount > 0) {
    actions.push("Fix bank import chunk validation, then re-run source-truth-audit.");
  } else {
    actions.push("Import bank statement or add bank-april-2026.csv.");
  }
  if (ruleReview.length) actions.push(`Review ${ruleReview.length} rule_review item(s) individually (no batch).`);
  if (nearEligible.length) actions.push(`Approve ${Math.min(5, nearEligible.length)} near-eligible ready item(s).`);
  for (const item of nearEligible.slice(0, 20)) {
    actions.push(`[${item.id}] ${item.title?.slice(0, 60) ?? item.source}`);
  }

  const expectedImpact = bank.canSatisfyBankRequirement
    ? `Up to ${potentiallyUnlocked} bank-related queue items may become actionable after reconciliation.`
    : audit.operatorSummary;

  return {
    generatedAt: new Date().toISOString(),
    openQueueCount: open.length,
    potentiallyUnlockedByBank: potentiallyUnlocked,
    blockedByRuleReview: ruleReview.length,
    blockedByLowConfidence: lowConf.length,
    sourceUpdatePendingResolvable: bank.canSatisfyBankRequirement ? sourcePending.length : 0,
    nearEligibleCount: nearEligible.length,
    next25OperatorActions: actions.slice(0, 25),
    expectedImpact,
  };
}

export async function writeQueueUnlockReport(): Promise<QueueUnlockReport> {
  const report = await buildQueueUnlockReport();
  const out = path.join(process.cwd(), "data", "compliance", "ai", "queue-unlock-report.json");
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}
