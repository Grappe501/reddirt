import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { buildMoneyCoverageSummary, loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

export default async function MoneyMovementCenterPage() {
  const [summary, movements] = await Promise.all([buildMoneyCoverageSummary(), loadStagedMoneyMovements()]);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Money movement"
        title="Money Movement Center"
        description="Coverage dashboard for all money in, all money out, documentation, review, reconciliation, and filing-readiness staging."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Money In">${summary.totalMoneyInStaged.toFixed(2)} staged</ComplianceCard>
        <ComplianceCard title="Money Out">${summary.totalMoneyOutStaged.toFixed(2)} staged</ComplianceCard>
        <ComplianceCard title="Needs Review">{summary.needsReviewCount} item(s)</ComplianceCard>
        <ComplianceCard title="Reconciliation">{summary.unreconciledDeposits + summary.unreconciledExpenses} unmatched</ComplianceCard>
        <ComplianceCard title="Fees">{summary.processorFees} processor/bank fee item(s)</ComplianceCard>
        <ComplianceCard title="1099 Staff/Vendors">{summary.missingW9} missing W-9 review(s)</ComplianceCard>
        <ComplianceCard title="Missing Documentation">{summary.missingReceipts + summary.missingDonorInfo} item(s)</ComplianceCard>
        <ComplianceCard title="Filing Readiness">{summary.readyForFilingCount} ready-for-approval item(s)</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Receipt Intake Wizard" href="/admin/compliance/receipts/new">Upload a receipt, verify tip/payment/purpose, approve, and stage for bank reconciliation.</ComplianceCard>
        <ComplianceCard title="Check Contributions" href="/admin/compliance/checks/new">Stage check contributions and flag donor/check/deposit gaps.</ComplianceCard>
        <ComplianceCard title="Expense Payments" href="/admin/compliance/expenses/new">Stage vendor, staff, bank fee, processor fee, and reimbursement payments.</ComplianceCard>
        <ComplianceCard title="Vendors / 1099" href="/admin/compliance/vendors">Track W-9, contract, and year-to-date payment coverage.</ComplianceCard>
      </section>
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Recent staged movements</h2>
        <div className="mt-3 grid gap-2">
          {movements.slice(0, 10).map((movement) => (
            <p key={movement.id} className="rounded-lg border border-kelly-text/10 bg-kelly-wash px-3 py-2 font-body text-sm text-kelly-text/75">
              {movement.category} · {movement.direction} · ${movement.amount.toFixed(2)} · {movement.name ?? "unnamed"} · {movement.reviewStatus}
            </p>
          ))}
          {!movements.length ? <p className="font-body text-sm text-kelly-text/70">No staged money movements yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
