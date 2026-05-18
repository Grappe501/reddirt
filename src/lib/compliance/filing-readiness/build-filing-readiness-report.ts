import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadCashDepositBatches, loadStagedCashContributions } from "../cash/cash-storage";
import { loadComplianceVendors, loadStagedMoneyMovements } from "../money/money-movement-storage";
import { loadStagedReceipts } from "../receipts/receipt-storage";
import { loadBankAnalyses, loadGoodChangeAnalyses } from "../storage";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";
import { buildRuleCoverageGate } from "./rule-coverage-gate";
import { buildTransactionReadinessSections } from "./filing-readiness-checks";
import { getCurrentFilingPeriod } from "./arkansas-filing-periods";
import type { FilingReadinessReport, FilingReadinessStatus } from "./filing-readiness-types";

export const filingReadinessJsonPath = path.join(process.cwd(), "data", "compliance", "filing-readiness", "latest.json");
export const filingReadinessMarkdownPath = path.join(process.cwd(), "reports", "compliance", "filing-readiness-report.md");

export async function buildFilingReadinessReport(): Promise<FilingReadinessReport> {
  const [movements, receipts, cash, cashBatches, vendors, goodChange, bank, corpus] = await Promise.all([
    loadStagedMoneyMovements(),
    loadStagedReceipts(),
    loadStagedCashContributions(),
    loadCashDepositBatches(),
    loadComplianceVendors(),
    loadGoodChangeAnalyses(),
    loadBankAnalyses(),
    loadComplianceRuleCorpus(),
  ]);
  const ruleGate = buildRuleCoverageGate(corpus);
  const period = getCurrentFilingPeriod();
  const sections = buildTransactionReadinessSections({
    movements,
    receipts,
    cashCount: cash.length + cashBatches.length,
    cashMissingInfo: cash.filter((item) => item.complianceStatus === "missing_required_fields" || item.complianceStatus === "amount_over_cash_limit").length,
    goodChangeBatches: goodChange.length,
    bankBatches: bank.length,
    vendorMissingW9: vendors.filter((vendor) => vendor.w9Status === "missing" && vendor.likely1099Required).length,
  });
  sections.push({
    id: "rule-coverage",
    label: "Rule coverage status",
    status: ruleGate.complete ? "green" : "red",
    summary: ruleGate.complete ? "All required rule topics are verified." : `${ruleGate.missingTopics.length} missing topic(s), ${ruleGate.needsLegalReviewTopics.length} topic(s) need legal review.`,
    count: ruleGate.missingTopics.length + ruleGate.needsLegalReviewTopics.length,
    nextAction: "Verify authoritative sources before final filing reliance.",
  });
  sections.push({
    id: "filing-period",
    label: "Filing period status",
    status: period.sourceStatus === "verified" ? "green" : "yellow",
    summary: `${period.label}: ${period.startDate} to ${period.endDate}${period.dueDate ? `, due ${period.dueDate}` : ", due date not verified"}.`,
    nextAction: period.sourceNote,
  });
  const blockers = [
    ...ruleGate.blockers,
    ...sections.filter((section) => section.status === "red").map((section) => `${section.label}: ${section.summary}`),
  ];
  const warnings = [
    ...ruleGate.warnings,
    ...sections.filter((section) => section.status === "yellow").map((section) => `${section.label}: ${section.summary}`),
  ];
  return {
    id: `filing-readiness-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    filingPeriod: {
      label: period.label,
      startDate: period.startDate,
      endDate: period.endDate,
      dueDate: period.dueDate,
    },
    overallStatus: resolveOverallStatus(sections, blockers),
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    sections,
    ruleCoverage: {
      complete: ruleGate.complete,
      missingTopics: ruleGate.missingTopics,
      needsLegalReviewTopics: ruleGate.needsLegalReviewTopics,
    },
    humanReviewRequired: true,
  };
}

export async function writeFilingReadinessReport(): Promise<FilingReadinessReport> {
  const report = await buildFilingReadinessReport();
  await mkdir(path.dirname(filingReadinessJsonPath), { recursive: true });
  await mkdir(path.dirname(filingReadinessMarkdownPath), { recursive: true });
  await writeFile(filingReadinessJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(filingReadinessMarkdownPath, renderFilingReadinessMarkdown(report), "utf8");
  return report;
}

function resolveOverallStatus(sections: FilingReadinessReport["sections"], blockers: string[]): FilingReadinessStatus {
  if (blockers.length || sections.some((section) => section.status === "red")) return "red";
  if (sections.some((section) => section.status === "yellow")) return "yellow";
  return "green";
}

function renderFilingReadinessMarkdown(report: FilingReadinessReport): string {
  return [
    "# Compliance Filing Readiness Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Overall status: ${report.overallStatus}`,
    "",
    "Human review required. This report is not legal certification.",
    "",
    "## Blockers",
    ...(report.blockers.length ? report.blockers.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Warnings",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Sections",
    ...report.sections.map((section) => `- ${section.label}: ${section.status} — ${section.summary}`),
    "",
  ].join("\n");
}
