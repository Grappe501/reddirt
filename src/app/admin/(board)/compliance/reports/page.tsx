import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { loadCashAuditLog, loadCashDepositBatches, loadStagedCashContributions } from "@/lib/compliance/cash/cash-storage";
import { buildReconciliationAnalysis, loadBankAnalyses, loadGoodChangeAnalyses } from "@/lib/compliance/storage";

export const dynamic = "force-dynamic";

export default async function ComplianceReportsPage() {
  const [goodChange, bank, reconciliation, cash, cashBatches, cashAuditLog] = await Promise.all([
    loadGoodChangeAnalyses(),
    loadBankAnalyses(),
    buildReconciliationAnalysis(),
    loadStagedCashContributions(),
    loadCashDepositBatches(),
    loadCashAuditLog(),
  ]);
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
