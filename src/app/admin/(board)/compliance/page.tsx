import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "./components";
import { loadBankAnalyses, loadGoodChangeAnalyses } from "@/lib/compliance/storage";

export const dynamic = "force-dynamic";

export default async function ComplianceCommandCenterPage() {
  const [goodChange, bank] = await Promise.all([loadGoodChangeAnalyses(), loadBankAnalyses()]);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Compliance"
        title="Compliance Command Center"
        description="Import fundraising and bank files, reconcile deposits, prepare filing-ready compliance records."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard eyebrow="Coverage" title="Money Movement Center" href="/admin/compliance/money">
          Intake, classify, stage, review, reconcile, and report every money-in and money-out transaction type.
        </ComplianceCard>
        <ComplianceCard eyebrow="GoodChange" title="Fundraising import discovery" href="/admin/compliance/imports/goodchange">
          Upload a GoodChange CSV to detect columns, infer contribution fields, flag missing compliance data, and stage rows for review.
          <p className="mt-2 font-semibold">{goodChange.length} analyzed batch(es).</p>
        </ComplianceCard>
        <ComplianceCard eyebrow="Cash" title="Cash Contribution Intake" href="/admin/compliance/cash">
          Capture cash donations, donor slips, OCR details, and stage records for compliance review.
        </ComplianceCard>
        <ComplianceCard eyebrow="Bank" title="Monthly bank CSV discovery" href="/admin/compliance/imports/bank">
          Upload a bank CSV to detect date, memo, debit, credit, balance, check number, deposits, fees, transfers, and expenses.
          <p className="mt-2 font-semibold">{bank.length} analyzed batch(es).</p>
        </ComplianceCard>
        <ComplianceCard eyebrow="Reconciliation" title="Deposit matching preview" href="/admin/compliance/reconciliation">
          Compare staged GoodChange contributions to bank deposits using deterministic matching rules before human approval.
        </ComplianceCard>
        <ComplianceCard eyebrow="Reports" title="Pass 1 assessment outputs" href="/admin/compliance/reports">
          Review generated assessment docs and exact information still needed from real exports for Pass 2.
        </ComplianceCard>
      </section>
    </div>
  );
}
