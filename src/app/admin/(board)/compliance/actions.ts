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
  lockReconciliationMatchAction,
  unlockReconciliationMatchAction,
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

export {
  approveReconciliationMatch,
  forceReconciliationMatch,
  splitReconciliationMatch,
  ignoreBankTransactionMatch,
  markTransferMatch,
  recordVarianceMatch,
  lockReconciliationMatchAction,
  unlockReconciliationMatchAction,
};
