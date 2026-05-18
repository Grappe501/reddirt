import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { advancedComplianceAITools } from "@/lib/compliance/ai/compliance-agent/advanced-tool-registry";
import { buildAmendmentCandidates } from "@/lib/compliance/amendments/amendment-assistant";
import { loadCashAuditLog, loadCashDepositBatches, loadStagedCashContributions } from "@/lib/compliance/cash/cash-storage";
import { buildFilingReadinessReport } from "@/lib/compliance/filing-readiness/build-filing-readiness-report";
import { loadFilingSnapshots } from "@/lib/compliance/filings/filing-storage";
import { auditComplianceRuleCorpus } from "@/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "@/lib/compliance/knowledge/load-compliance-rule-corpus";
import { buildMoneyCoverageSummary, loadComplianceVendors, loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";
import { loadStagedReceipts } from "@/lib/compliance/receipts/receipt-storage";
import { buildReconciliationWorkbench } from "@/lib/compliance/reconciliation/reconciliation-workbench-storage";
import { buildComplianceExecutiveScore } from "@/lib/compliance/scoring/compliance-score";
import { buildReconciliationAnalysis, loadBankAnalyses, loadGoodChangeAnalyses } from "@/lib/compliance/storage";
import { buildComplianceTasks } from "@/lib/compliance/tasks/build-compliance-tasks";

export const dynamic = "force-dynamic";

export default async function ComplianceReportsPage() {
  const [goodChange, bank, reconciliation, cash, cashBatches, cashAuditLog, moneySummary, moneyMovements, vendors, receipts, corpus, workbench, tasks, filings, amendments, score] = await Promise.all([
    loadGoodChangeAnalyses(),
    loadBankAnalyses(),
    buildReconciliationAnalysis(),
    loadStagedCashContributions(),
    loadCashDepositBatches(),
    loadCashAuditLog(),
    buildMoneyCoverageSummary(),
    loadStagedMoneyMovements(),
    loadComplianceVendors(),
    loadStagedReceipts(),
    loadComplianceRuleCorpus(),
    buildReconciliationWorkbench(),
    buildComplianceTasks(),
    loadFilingSnapshots(),
    buildAmendmentCandidates(),
    buildComplianceExecutiveScore(),
  ]);
  const [ruleAudit, filingReadiness] = [auditComplianceRuleCorpus(corpus), await buildFilingReadinessReport()];
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Reports"
        title="Pass 1 assessment outputs"
        description="Generated discovery reports and exact missing inputs for the Pass 2 compliance build script."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="GoodChange analyzer">{goodChange.length ? `${goodChange.length} batch(es) analyzed.` : "Sample CSV needed for exact columns and rows."}</ComplianceCard>
        <ComplianceCard title="Bank analyzer">{bank.length ? `${bank.length} batch(es) analyzed.` : "Sample bank CSV needed for exact columns and rows."}</ComplianceCard>
        <ComplianceCard title="Reconciliation preview">{reconciliation.candidates.length} candidate(s) generated.</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Cash intake report">{cash.length} staged cash contribution(s).</ComplianceCard>
        <ComplianceCard title="Missing donor info report">{cash.filter((item) => item.complianceStatus === "missing_required_fields").length} item(s).</ComplianceCard>
        <ComplianceCard title="Cash over-limit report">{cash.filter((item) => item.complianceStatus === "amount_over_cash_limit").length} item(s).</ComplianceCard>
        <ComplianceCard title="Cash batch/deposit report">{cashBatches.length} batch(es).</ComplianceCard>
        <ComplianceCard title="Cash audit log report">{cashAuditLog.length} audit event(s).</ComplianceCard>
        <ComplianceCard title="Cash reconciliation pending report">{cashBatches.filter((batch) => batch.status !== "matched_to_bank" && batch.status !== "closed").length} pending batch(es).</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Money movement coverage report" href="/admin/compliance/money">{moneyMovements.length} staged money movement(s).</ComplianceCard>
        <ComplianceCard title="All money in report">${moneySummary.totalMoneyInStaged.toFixed(2)} staged in.</ComplianceCard>
        <ComplianceCard title="All money out report">${moneySummary.totalMoneyOutStaged.toFixed(2)} staged out.</ComplianceCard>
        <ComplianceCard title="GoodChange fees report" href="/admin/compliance/reports/goodchange-fees">{moneySummary.processorFees} processor fee item(s).</ComplianceCard>
        <ComplianceCard title="Check deposit report">{moneySummary.checksPendingDeposit} check(s) pending deposit.</ComplianceCard>
        <ComplianceCard title="1099 vendor report" href="/admin/compliance/1099">{vendors.filter((vendor) => vendor.likely1099Required).length} likely 1099 review(s).</ComplianceCard>
        <ComplianceCard title="Missing W-9 report">{moneySummary.missingW9} missing W-9 item(s).</ComplianceCard>
        <ComplianceCard title="Missing receipt report">{moneySummary.missingReceipts} missing receipt/invoice item(s).</ComplianceCard>
        <ComplianceCard title="Unreconciled bank transaction report">{moneySummary.unreconciledDeposits + moneySummary.unreconciledExpenses} unmatched item(s).</ComplianceCard>
        <ComplianceCard title="Ready-for-ledger report">{moneySummary.readyForFilingCount} ready-for-approval item(s).</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Receipt extraction report" href="/admin/compliance/receipts">{receipts.filter((receipt) => receipt.extraction).length} extracted receipt(s).</ComplianceCard>
        <ComplianceCard title="Receipt review queue report" href="/admin/compliance/receipts/review">{receipts.filter((receipt) => receipt.reviewStatus === "needs_review").length} need review.</ComplianceCard>
        <ComplianceCard title="Receipt-to-bank reconciliation report">{receipts.filter((receipt) => receipt.reconciliationStatus === "awaiting_bank_match").length} awaiting bank match.</ComplianceCard>
        <ComplianceCard title="Tip verification report">{receipts.filter((receipt) => receipt.tipStatus === "not_sure").length} unresolved tip question(s).</ComplianceCard>
        <ComplianceCard title="Vendor spending report">{moneyMovements.filter((movement) => movement.category === "vendor_payment").length} vendor payment(s).</ComplianceCard>
        <ComplianceCard title="Reimbursement payable report">{moneyMovements.filter((movement) => movement.category === "travel_reimbursement").length} reimbursement item(s).</ComplianceCard>
        <ComplianceCard title="Filing readiness report" href="/admin/compliance/filing-readiness">Overall status: {filingReadiness.overallStatus}. {filingReadiness.blockers.length} blocker(s).</ComplianceCard>
        <ComplianceCard title="Rule coverage report" href="/admin/compliance/rules">{ruleAudit.chunksIndexed} rule chunk(s), {ruleAudit.topicsMissing.length} topic gap(s).</ComplianceCard>
        <ComplianceCard title="Compliance risk report">{moneySummary.needsReviewCount + receipts.filter((receipt) => receipt.warnings.length).length} review/risk item(s).</ComplianceCard>
        <ComplianceCard title="Missing rule source report" href="/admin/compliance/rules">{ruleAudit.topicCoverage.filter((topic) => topic.status === "missing" || topic.status === "placeholder").length} missing/placeholder topic(s).</ComplianceCard>
        <ComplianceCard title="Transactions blocking filing report" href="/admin/compliance/filing-readiness">{filingReadiness.sections.filter((section) => section.status === "red").length} red section(s).</ComplianceCard>
        <ComplianceCard title="Human review required report">Human review required: {filingReadiness.humanReviewRequired ? "yes" : "no"}.</ComplianceCard>
        <ComplianceCard title="Bank reconciliation blocker report">{filingReadiness.sections.find((section) => section.id === "bank")?.count ?? 0} unmatched item(s).</ComplianceCard>
        <ComplianceCard title="Missing documentation report">{moneySummary.missingReceipts + receipts.filter((receipt) => receipt.documentationStatus !== "complete").length} documentation gap(s).</ComplianceCard>
        <ComplianceCard title="Task aging report" href="/admin/compliance/tasks">{tasks.length} open generated task(s).</ComplianceCard>
        <ComplianceCard title="Audit log summary report">{cashAuditLog.length} cash audit event(s); money/receipt audit surfaces available in detail queues.</ComplianceCard>
        <ComplianceCard title="Monthly compliance score">{score.score}/100 · {score.status}</ComplianceCard>
        <ComplianceCard title="Executive dashboard packet" href="/admin/compliance">Score, readiness, tasks, filings, reconciliation, and rule coverage.</ComplianceCard>
        <ComplianceCard title="Unreconciled transactions" href="/admin/compliance/reconciliation">{workbench.unmatchedBankTransactions.length + workbench.unmatchedMoneyMovements.length} unmatched transaction(s).</ComplianceCard>
        <ComplianceCard title="Contributions by source">{moneyMovements.filter((movement) => movement.direction === "in").length} contribution/money-in movement(s).</ComplianceCard>
        <ComplianceCard title="Expenses by category">{new Set(moneyMovements.filter((movement) => movement.direction === "out").map((movement) => movement.category)).size} expense categor(ies).</ComplianceCard>
        <ComplianceCard title="GoodChange net vs bank">{reconciliation.candidates.length} GoodChange-bank candidate(s).</ComplianceCard>
        <ComplianceCard title="Duplicate candidates">{receipts.filter((receipt) => receipt.warnings.some((warning) => warning.toLowerCase().includes("duplicate"))).length} duplicate warning(s).</ComplianceCard>
        <ComplianceCard title="Amendment candidates" href="/admin/compliance/amendments">{amendments.length} candidate(s).</ComplianceCard>
        <ComplianceCard title="Filing export packages" href="/admin/compliance/filings">{filings.length} package(s).</ComplianceCard>
        <ComplianceCard title="AI tool suite">{advancedComplianceAITools.length} guarded AI tool definitions.</ComplianceCard>
      </section>
      <ComplianceCard title="Generated docs">
        <ul className="grid gap-1">
          <li><code>docs/compliance/GOODCHANGE_IMPORT_ASSESSMENT.md</code></li>
          <li><code>docs/compliance/BANK_RECONCILIATION_ASSESSMENT.md</code></li>
          <li><code>docs/compliance/COMPLIANCE_PASS_2_REQUIREMENTS.md</code></li>
        </ul>
      </ComplianceCard>
    </div>
  );
}
