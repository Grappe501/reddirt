import { auditComplianceRuleCorpus } from "../../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../../knowledge/load-compliance-rule-corpus";
import { evaluateFilingHardGates } from "../../filing-readiness/hard-gates";
import { gradeFilingReadiness } from "../../filing-readiness/filing-readiness-grade";
import { buildReconciliationWorkbench } from "../../reconciliation/reconciliation-workbench-storage";
import { loadFilingSnapshots } from "../../filings/filing-storage";
import { buildComplianceExecutiveScore } from "../../scoring/compliance-score";
import { checkComplianceStorageHealth } from "../../storage/storage-health";
import { assessDbPersistenceReadiness } from "../../persistence/db-readiness";
import type { ComplianceFinalizationReport } from "./finalization-types";

export async function runComplianceFinalizationReport(): Promise<ComplianceFinalizationReport> {
  const [corpus, hardGates, workbench, filings, executive, storage, db] = await Promise.all([
    loadComplianceRuleCorpus(),
    evaluateFilingHardGates(),
    buildReconciliationWorkbench(),
    loadFilingSnapshots(),
    buildComplianceExecutiveScore(),
    checkComplianceStorageHealth(),
    assessDbPersistenceReadiness(),
  ]);
  const ruleAudit = auditComplianceRuleCorpus(corpus);
  const filingGrade = gradeFilingReadiness(hardGates);
  const ruleScore = Math.round((ruleAudit.topicCoverage.filter((topic) => topic.hasOfficialSource).length / Math.max(ruleAudit.topicCoverage.length, 1)) * 100);
  const reconScore = workbench.matches.length
    ? Math.round((workbench.lockedCount / workbench.matches.length) * 100)
    : workbench.unmatchedBankTransactions.length + workbench.unmatchedMoneyMovements.length
      ? 20
      : 70;
  const subsystemScores: ComplianceFinalizationReport["subsystemScores"] = [
    { id: "rules", label: "Rule corpus", score: ruleScore, status: scoreStatus(ruleScore), explanation: ruleAudit.warning },
    { id: "filing", label: "Filing readiness", score: filingGrade.score, status: filingGrade.status, explanation: filingGrade.label },
    { id: "reconciliation", label: "Reconciliation", score: reconScore, status: scoreStatus(reconScore), explanation: `${workbench.lockedCount} locked of ${workbench.matches.length} matches` },
    { id: "storage", label: "Storage", score: storage.ready ? 85 : 45, status: storage.ready ? "yellow" : "red", explanation: storage.summary },
    { id: "db", label: "DB persistence", score: db.score, status: scoreStatus(db.score), explanation: db.summary },
    { id: "commercial", label: "Commercial readiness", score: executive.commercialReadinessPct, status: scoreStatus(executive.commercialReadinessPct), explanation: "Weighted product/compliance readiness." },
  ];
  const completionPct = Math.round(subsystemScores.reduce((sum, item) => sum + item.score, 0) / subsystemScores.length);
  const blockers = [
    ...hardGates.filter((gate) => gate.blocking && gate.status === "blocked").map((gate) => gate.label),
    ...(ruleAudit.topicsMissing.length ? [`Missing rule topics: ${ruleAudit.topicsMissing.join(", ")}`] : []),
    ...(storage.localFallbackActive ? ["Storage using local fallback — configure Supabase private bucket for production."] : []),
    ...(db.migrationRequired ? ["Compliance DB models not migrated — JSON fallback active."] : []),
  ];
  const nextActions = [
    "Run compliance:rules:verify-links and compliance:rules:build",
    "Compliance officer review for topics with official sources but pending legal verification",
    "Upload GoodChange and bank sample CSVs at /admin/compliance/imports/sample-needed",
    "Lock reconciliation matches after treasurer approval",
    filings.length ? "Export filing package and review watermark" : "Create draft filing snapshot",
  ];
  return {
    generatedAt: new Date().toISOString(),
    completionPct,
    commercialReadinessPct: executive.commercialReadinessPct,
    filingReadinessStatus: filingGrade.status,
    canUseInternally: completionPct >= 65 && !blockers.some((item) => item.includes("Missing rule topics")),
    canBetaTest: completionPct >= 75 && filingGrade.status !== "red",
    canSell: completionPct >= 90 && filingGrade.status === "green" && executive.commercialReadinessPct >= 80,
    blockers,
    nextActions,
    subsystemScores,
  };
}

function scoreStatus(score: number): "green" | "yellow" | "red" {
  if (score >= 85) return "green";
  if (score >= 65) return "yellow";
  return "red";
}
