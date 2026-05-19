import { buildFilingReadinessReport } from "../filing-readiness/build-filing-readiness-report";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";
import { buildMoneyCoverageSummary, loadComplianceVendors, loadStagedMoneyMovements } from "../money/money-movement-storage";
import { loadStagedReceipts } from "../receipts/receipt-storage";
import { loadStagedCashContributions } from "../cash/cash-storage";
import type { ComplianceTask } from "./compliance-task-types";
import { loadApprovalNeedsInfoTasks } from "./approval-needs-info-storage";

export async function buildComplianceTasks(): Promise<ComplianceTask[]> {
  const [readiness, corpus, summary, movements, vendors, receipts, cash, approvalNeedsInfo] = await Promise.all([
    buildFilingReadinessReport(),
    loadComplianceRuleCorpus(),
    buildMoneyCoverageSummary(),
    loadStagedMoneyMovements(),
    loadComplianceVendors(),
    loadStagedReceipts(),
    loadStagedCashContributions(),
    loadApprovalNeedsInfoTasks(),
  ]);
  const now = new Date().toISOString();
  const ruleAudit = auditComplianceRuleCorpus(corpus);
  const tasks: ComplianceTask[] = [];
  for (const topic of ruleAudit.topicCoverage.filter((coverage) => !coverage.verified)) {
    tasks.push(task(`rule-${topic.topic}`, "rule_verification_required", `Verify ${topic.label} rule source`, "high", now, [{ label: "Rules", href: "/admin/compliance/rules", recordId: topic.topic }], topic.nextAction));
  }
  for (const movement of movements.filter((item) => item.documentationStatus === "missing_donor_info")) {
    tasks.push(task(`donor-${movement.id}`, "missing_donor_info", `Missing donor info: ${movement.name ?? movement.id}`, "urgent", now, [{ label: "Money movement", href: "/admin/compliance/money", recordId: movement.id }], movement.missingFields.join(", ")));
  }
  for (const movement of movements.filter((item) => item.reconciliationStatus !== "matched" && item.reconciliationStatus !== "ignored")) {
    tasks.push(task(`bank-${movement.id}`, "missing_bank_match", `Bank match needed: ${movement.category}`, "high", now, [{ label: "Reconciliation", href: "/admin/compliance/reconciliation", recordId: movement.id }], "Match or document override before filing."));
  }
  for (const vendor of vendors.filter((item) => item.w9Status === "missing" && item.likely1099Required)) {
    tasks.push(task(`w9-${vendor.id}`, "missing_w9", `W-9 needed: ${vendor.name}`, "medium", now, [{ label: "Vendor", href: `/admin/compliance/vendors/${vendor.id}`, recordId: vendor.id }], "Request W-9 before final year-end package."));
  }
  for (const receipt of receipts.filter((item) => item.documentationStatus !== "complete" || item.warnings.some((warning) => warning.toLowerCase().includes("duplicate")))) {
    tasks.push(task(`receipt-${receipt.id}`, receipt.warnings.some((warning) => warning.toLowerCase().includes("duplicate")) ? "possible_duplicate" : "missing_receipt", `Receipt review needed: ${receipt.vendorName ?? receipt.id}`, "medium", now, [{ label: "Receipt", href: `/admin/compliance/receipts/${receipt.id}`, recordId: receipt.id }], receipt.warnings.join("; ") || "Complete receipt documentation."));
  }
  for (const item of cash.filter((contribution) => contribution.complianceStatus === "amount_over_cash_limit")) {
    tasks.push(task(`cash-${item.id}`, "over_cash_threshold", `Cash threshold review: ${item.donorFullName ?? item.id}`, "urgent", now, [{ label: "Cash review", href: "/admin/compliance/cash/review", recordId: item.id }], "Treasurer/compliance review required."));
  }
  for (const blocker of readiness.blockers) {
    tasks.push(task(`filing-${hashId(blocker)}`, "filing_blocker", "Filing blocker", "urgent", now, [{ label: "Filing readiness", href: "/admin/compliance/filing-readiness", recordId: "filing-readiness" }], blocker));
  }
  if (summary.missingReceipts > 0) {
    tasks.push(task("missing-doc-summary", "missing_receipt", "Missing documentation summary", "high", now, [{ label: "Reports", href: "/admin/compliance/reports", recordId: "missing-docs" }], `${summary.missingReceipts} missing receipt/invoice item(s).`));
  }
  for (const approvalTask of approvalNeedsInfo) {
    tasks.push(approvalTask);
  }
  return tasks;
}

function task(id: string, type: ComplianceTask["type"], title: string, priority: ComplianceTask["priority"], now: string, links: ComplianceTask["relatedRecordLinks"], note: string): ComplianceTask {
  return { id, type, title, priority, relatedRecordLinks: links, status: "open", notes: [note].filter(Boolean), createdAt: now, updatedAt: now };
}

function hashId(value: string): string {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(36);
}
