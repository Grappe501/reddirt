import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { loadStagedReceipts } from "@/lib/compliance/receipts/receipt-storage";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const receipts = await loadStagedReceipts();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Receipts"
        title="Receipt Intake Wizard"
        description="Upload receipts, extract details, verify tip and payment method, approve, and stage for bank reconciliation."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Upload Receipt" href="/admin/compliance/receipts/new">Start a new receipt wizard.</ComplianceCard>
        <ComplianceCard title="Needs Review">{receipts.filter((receipt) => receipt.reviewStatus === "needs_review").length} receipt(s)</ComplianceCard>
        <ComplianceCard title="Ready for Approval">{receipts.filter((receipt) => receipt.reviewStatus === "ready_for_approval").length} receipt(s)</ComplianceCard>
        <ComplianceCard title="Awaiting Bank Match">{receipts.filter((receipt) => receipt.reconciliationStatus === "awaiting_bank_match").length} receipt(s)</ComplianceCard>
      </section>
    </div>
  );
}
