import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { loadComplianceVendors, loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

export default async function DocumentationCoveragePage() {
  const [movements, vendors] = await Promise.all([loadStagedMoneyMovements(), loadComplianceVendors()]);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Documentation"
        title="Compliance Documentation Coverage"
        description="Universal view of missing receipts, W-9s, donor info, bank matches, purposes, cash limits, and unmatched fees."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Missing receipts">{movements.filter((item) => item.documentationStatus === "missing_receipt" || item.documentationStatus === "missing_invoice").length} item(s)</ComplianceCard>
        <ComplianceCard title="Missing W-9">{vendors.filter((vendor) => vendor.w9Status === "missing" && vendor.likely1099Required).length} vendor(s)</ComplianceCard>
        <ComplianceCard title="Missing donor info">{movements.filter((item) => item.documentationStatus === "missing_donor_info").length} item(s)</ComplianceCard>
        <ComplianceCard title="Missing bank match">{movements.filter((item) => !item.bankTransactionId).length} item(s)</ComplianceCard>
        <ComplianceCard title="Missing purpose">{movements.filter((item) => item.direction === "out" && !item.purpose).length} item(s)</ComplianceCard>
        <ComplianceCard title="Unmatched fees">{movements.filter((item) => (item.category === "processor_fee" || item.category === "bank_fee") && !item.bankTransactionId).length} item(s)</ComplianceCard>
      </section>
    </div>
  );
}
