import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { cashPolicyNotice } from "@/lib/compliance/cash/cash-policy";
import { loadCashDepositBatches, loadCashPolicy, loadStagedCashContributions } from "@/lib/compliance/cash/cash-storage";

export const dynamic = "force-dynamic";

export default async function CashContributionIntakePage() {
  const [policy, contributions, batches] = await Promise.all([
    loadCashPolicy(),
    loadStagedCashContributions(),
    loadCashDepositBatches(),
  ]);
  const needsReview = contributions.filter((item) => item.complianceStatus === "needs_review" || item.complianceStatus === "missing_required_fields").length;
  const overLimit = contributions.filter((item) => item.complianceStatus === "amount_over_cash_limit").length;
  const ready = contributions.filter((item) => item.complianceStatus === "ready_for_approval").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Cash"
        title="Cash Contribution Intake"
        description="Capture cash donations, donor slips, OCR details, and stage records for compliance review."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <div className="rounded-2xl border border-amber-700/20 bg-amber-50 p-4 font-body text-sm text-amber-950">
        {cashPolicyNotice} Current configured threshold: ${policy.maxCashContributionAmount}.
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard title="New Cash Contribution" href="/admin/compliance/cash/new">
          Mobile-first intake with reviewer initials, amount, evidence photos, donor slip fields, OCR fallback, and staging.
        </ComplianceCard>
        <ComplianceCard title="Review Queue" href="/admin/compliance/cash/review">
          Needs review: {needsReview}. Over limit: {overLimit}. Ready: {ready}.
        </ComplianceCard>
        <ComplianceCard title="Deposit Batches" href="/admin/compliance/cash/batches">
          {batches.length} cash deposit batch(es). Batch counted cash before bank reconciliation.
        </ComplianceCard>
        <ComplianceCard title="Printable Donor Slip" href="/admin/compliance/cash/slip">
          Print a donor information slip for cash events and field collection.
        </ComplianceCard>
      </section>
    </div>
  );
}
