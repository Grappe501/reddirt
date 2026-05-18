import { buildFilingReadinessReport } from "../filing-readiness/build-filing-readiness-report";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";
import { buildMoneyCoverageSummary } from "../money/money-movement-storage";

export type ComplianceExecutiveScore = {
  score: number;
  status: "green" | "yellow" | "red";
  metrics: Array<{ id: string; label: string; score: number; summary: string }>;
};

export async function buildComplianceExecutiveScore(): Promise<ComplianceExecutiveScore> {
  const [summary, readiness, corpus] = await Promise.all([
    buildMoneyCoverageSummary(),
    buildFilingReadinessReport(),
    loadComplianceRuleCorpus(),
  ]);
  const ruleAudit = auditComplianceRuleCorpus(corpus);
  const totalRecon = summary.unreconciledDeposits + summary.unreconciledExpenses + summary.approvedMoneyIn + summary.approvedMoneyOut;
  const reconciliationScore = totalRecon ? Math.max(0, Math.round(((summary.approvedMoneyIn + summary.approvedMoneyOut) / totalRecon) * 100)) : 60;
  const metrics = [
    { id: "data", label: "Data completeness", score: scoreFromGaps(summary.missingDonorInfo), summary: `${summary.missingDonorInfo} donor info gap(s).` },
    { id: "documentation", label: "Documentation completeness", score: scoreFromGaps(summary.missingReceipts + summary.missingW9), summary: `${summary.missingReceipts + summary.missingW9} documentation gap(s).` },
    { id: "reconciliation", label: "Reconciliation percentage", score: reconciliationScore, summary: `${summary.unreconciledDeposits + summary.unreconciledExpenses} unreconciled item(s).` },
    { id: "approval", label: "Approval completion", score: scoreFromGaps(summary.needsReviewCount), summary: `${summary.needsReviewCount} needs-review item(s).` },
    { id: "rules", label: "Rule verification", score: Math.round((ruleAudit.verifiedSources / Math.max(1, ruleAudit.sourceCounts.arkansas_code + ruleAudit.sourceCounts.arkansas_ethics + ruleAudit.sourceCounts.arkansas_sos + ruleAudit.sourceCounts.internal_notes)) * 100), summary: `${ruleAudit.rulesNeedingVerification} source(s) need verification.` },
    { id: "filing", label: "Filing readiness", score: readiness.overallStatus === "green" ? 100 : readiness.overallStatus === "yellow" ? 65 : 35, summary: `${readiness.blockers.length} filing blocker(s).` },
  ];
  const score = Math.round(metrics.reduce((total, metric) => total + metric.score, 0) / metrics.length);
  return { score, status: score >= 85 ? "green" : score >= 60 ? "yellow" : "red", metrics };
}

function scoreFromGaps(count: number): number {
  if (count === 0) return 100;
  if (count <= 2) return 75;
  if (count <= 5) return 50;
  return 25;
}
