import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
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
  "manual_match",
];

export default async function ComplianceReconciliationPage() {
  const analysis = await buildReconciliationAnalysis();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Reconciliation"
        title="Bank reconciliation coverage preview"
        description="Preview deterministic matches across GoodChange, cash, checks, fees, expenses, travel reimbursements, staff payments, and manual review. No match is final without human approval."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="High confidence">{analysis.summary.highConfidence} candidate(s)</ComplianceCard>
        <ComplianceCard title="Medium confidence">{analysis.summary.mediumConfidence} candidate(s)</ComplianceCard>
        <ComplianceCard title="Low confidence">{analysis.summary.lowConfidence} candidate(s)</ComplianceCard>
        <ComplianceCard title="Manual review">{analysis.summary.manualRequired} candidate(s)</ComplianceCard>
      </section>
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Coverage match types</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {coverageMatchTypes.map((type) => (
            <span key={type} className="rounded-full border border-kelly-text/10 bg-kelly-wash px-3 py-1 font-body text-xs font-semibold text-kelly-text/70">{type}</span>
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
