"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { saveRuleReview, flagRuleSourceStale } from "@/lib/compliance/knowledge/rule-reviews-storage";
import {
  approveReconciliationMatch,
  forceReconciliationMatch,
  splitReconciliationMatch,
  ignoreBankTransactionMatch,
  markTransferMatch,
  recordVarianceMatch,
  lockReconciliationMatchAction as lockReconciliationMatchLib,
  unlockReconciliationMatchAction as unlockReconciliationMatchLib,
} from "@/lib/compliance/reconciliation/reconciliation-actions";

const execFileAsync = promisify(execFile);

async function runNpmScript(script: string) {
  await execFileAsync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script], {
    cwd: process.cwd(),
    env: process.env,
  });
}

export async function rebuildComplianceRuleCorpusAction() {
  await runNpmScript("compliance:rules:build");
  revalidatePath("/admin/compliance/rules");
}

export async function verifyComplianceRuleLinksAction() {
  await runNpmScript("compliance:rules:verify-links");
  revalidatePath("/admin/compliance/rules");
}

export async function markRuleSourceReviewedAction(input: { sourceId: string; initials: string; note?: string }) {
  await saveRuleReview({
    sourceId: input.sourceId,
    reviewedByInitials: input.initials,
    reviewedAt: new Date().toISOString(),
    reviewNote: input.note,
  });
  await runNpmScript("compliance:rules:build");
  revalidatePath("/admin/compliance/rules");
}

export async function markRuleTopicReviewedAction(input: { topic: string; initials: string; note?: string }) {
  await saveRuleReview({
    topic: input.topic as import("@/lib/compliance/knowledge/compliance-rule-types").ComplianceRuleTopic,
    reviewedByInitials: input.initials,
    reviewedAt: new Date().toISOString(),
    reviewNote: input.note,
  });
  await runNpmScript("compliance:rules:build");
  revalidatePath("/admin/compliance/rules");
}

export async function flagRuleSourceStaleAction(sourceId: string) {
  await flagRuleSourceStale(sourceId);
  revalidatePath("/admin/compliance/rules");
}

export async function exportRuleCoverageReportAction() {
  const { auditComplianceRuleCorpusAsync } = await import("@/lib/compliance/knowledge/compliance-rule-index");
  const { loadComplianceRuleCorpus } = await import("@/lib/compliance/knowledge/load-compliance-rule-corpus");
  const corpus = await loadComplianceRuleCorpus();
  const audit = await auditComplianceRuleCorpusAsync(corpus);
  const reportPath = path.join(process.cwd(), "reports", "compliance", "rule-coverage-report.json");
  await writeFile(reportPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  return reportPath;
}

export async function approveReconciliationMatchAction(input: { matchId: string; actorInitials: string; note?: string }) {
  await approveReconciliationMatch(input);
  revalidatePath("/admin/compliance/reconciliation");
  revalidatePath(`/admin/compliance/reconciliation/${input.matchId}`);
}

export async function forceReconciliationMatchAction(input: { matchId: string; actorInitials: string; note?: string }) {
  await forceReconciliationMatch(input);
  revalidatePath("/admin/compliance/reconciliation");
}

export async function splitReconciliationMatchAction(input: { matchId: string; actorInitials: string; note?: string }) {
  await splitReconciliationMatch(input);
  revalidatePath("/admin/compliance/reconciliation");
}

export async function ignoreBankTransactionMatchAction(input: { matchId: string; actorInitials: string; note?: string }) {
  await ignoreBankTransactionMatch(input);
  revalidatePath("/admin/compliance/reconciliation");
}

export async function recordVarianceMatchAction(input: { matchId: string; actorInitials: string; note?: string }) {
  await recordVarianceMatch(input);
  revalidatePath("/admin/compliance/reconciliation");
}

export async function lockReconciliationMatchAction(input: { matchId: string; actorInitials: string; note?: string }) {
  await lockReconciliationMatchLib(input);
  revalidatePath("/admin/compliance/reconciliation");
  revalidatePath(`/admin/compliance/reconciliation/${input.matchId}`);
}

export async function unlockReconciliationMatchAction(input: { matchId: string; actorInitials: string; unlockReason: string }) {
  await unlockReconciliationMatchLib({ matchId: input.matchId, actorInitials: input.actorInitials, unlockReason: input.unlockReason, note: input.unlockReason });
  revalidatePath("/admin/compliance/reconciliation");
}
