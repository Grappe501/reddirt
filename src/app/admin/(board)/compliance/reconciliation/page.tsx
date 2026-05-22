import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { buildReconciliationWorkbench } from "@/lib/compliance/reconciliation/reconciliation-workbench-storage";
import { loadStagedReceipts } from "@/lib/compliance/receipts/receipt-storage";
import { buildReconciliationAnalysis } from "@/lib/compliance/storage";

export const dynamic = "force-dynamic";

const coverageMatchTypes = [
  "goodchange_net_to_bank_deposit",
  "cash_batch_to_bank_deposit",
  "check_batch_to_bank_deposit",
  "expense_to_bank_debit",
  "fee_to_bank_fee",
  "travel_reimbursement_to_bank_payment",
  "staff_payment_to_bank_debit",
  "receipt_expense_to_bank_debit",
  "manual_match",
];

export default async function ComplianceReconciliationPage() {
  const [analysis, receipts, workbench] = await Promise.all([buildReconciliationAnalysis(), loadStagedReceipts(), buildReconciliationWorkbench()]);
  const unmatchedReceipts = receipts.filter((receipt) => receipt.reconciliationStatus === "awaiting_bank_match" && receipt.approvalStatus === "approved");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Reconciliation"
        title="Bank reconciliation coverage preview"
        description="Preview deterministic matches across GoodChange, cash, checks, fees, expenses, travel reimbursements, staff payments, and manual review. No match is final without human approval."
      />
      <ComplianceNav />
      <ComplianceCard title="April 2026 reconciliation" href="/admin/compliance/april26">
        GoodChange payout batches, bank CSV status, and April26 reconciliation candidates.
      </ComplianceCard>
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="High confidence">{analysis.summary.highConfidence} candidate(s)</ComplianceCard>
        <ComplianceCard title="Medium confidence">{analysis.summary.mediumConfidence} candidate(s)</ComplianceCard>
        <ComplianceCard title="Low confidence">{analysis.summary.lowConfidence} candidate(s)</ComplianceCard>
        <ComplianceCard title="Manual review">{analysis.summary.manualRequired} candidate(s)</ComplianceCard>
        <ComplianceCard title="Unmatched receipts">{unmatchedReceipts.length} awaiting bank debit</ComplianceCard>
        <ComplianceCard title="Saved matches">{workbench.matches.length} saved</ComplianceCard>
        <ComplianceCard title="Locked matches">{workbench.lockedCount} locked</ComplianceCard>
        <ComplianceCard title="Unmatched bank">{workbench.unmatchedBankTransactions.length} transaction(s)</ComplianceCard>
        <ComplianceCard title="Unmatched ledger">{workbench.unmatchedMoneyMovements.length} movement(s)</ComplianceCard>
      </section>
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Receipt expense bank matching</h2>
        <div className="mt-3 grid gap-2">
          {unmatchedReceipts.slice(0, 10).map((receipt) => (
            <p key={receipt.id} className="rounded-lg border border-kelly-text/10 bg-kelly-wash px-3 py-2 font-body text-sm text-kelly-text/75">
              {receipt.vendorName ?? "Unknown vendor"} · ${receipt.total.toFixed(2)} · {receipt.receiptDate ?? "date missing"} · match rules: date 0-5 days, exact total, vendor memo, card last four, manual match
            </p>
          ))}
          {!unmatchedReceipts.length ? <p className="font-body text-sm text-kelly-muted">No approved receipt expenses awaiting bank match yet.</p> : null}
        </div>
      </section>
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Coverage match types</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {coverageMatchTypes.map((type) => (
            <span key={type} className="rounded-full border border-kelly-text/10 bg-kelly-wash px-3 py-1 font-body text-xs font-semibold text-kelly-muted">{type}</span>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Candidates</h2>
        {analysis.candidates.length ? (
          <div className="mt-4 grid gap-3">
            {analysis.candidates.map((candidate) => (
              <article key={candidate.id} className="rounded-xl border border-kelly-text/10 bg-kelly-wash p-4 font-body text-sm text-kelly-text/75">
                <p className="font-semibold text-kelly-text">{candidate.matchType} · {candidate.confidence}</p>
                <p className="mt-1">{candidate.explanation}</p>
                <p className="mt-1">Bank amount: ${candidate.bankAmount.toFixed(2)} · GoodChange net: {candidate.goodChangeNetTotal?.toFixed(2) ?? "n/a"}</p>
                <a className="mt-2 inline-block text-kelly-navy underline" href={`/admin/compliance/reconciliation/${candidate.id}`}>Review match detail</a>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 font-body text-sm text-kelly-text/75">No candidates yet. Upload real GoodChange and bank CSV samples to preview matches.</p>
        )}
      </section>
    </div>
  );
}
