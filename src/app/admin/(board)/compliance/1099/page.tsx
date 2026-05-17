import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { loadComplianceVendors, loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

export default async function Compliance1099Page() {
  const [vendors, movements] = await Promise.all([loadComplianceVendors(), loadStagedMoneyMovements()]);
  const payments = movements.filter((movement) => movement.category === "staff_1099_payment" || movement.category === "vendor_payment");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="1099"
        title="1099 Staff / Vendor Review"
        description="Review vendor payment coverage, W-9 status, contract status, and year-to-date thresholds. No tax IDs are stored here."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Likely 1099 required">{vendors.filter((vendor) => vendor.likely1099Required).length} vendor(s)</ComplianceCard>
        <ComplianceCard title="Missing W-9">{vendors.filter((vendor) => vendor.w9Status === "missing" && vendor.likely1099Required).length} vendor(s)</ComplianceCard>
        <ComplianceCard title="Missing contract">{vendors.filter((vendor) => vendor.contractStatus === "missing" && vendor.likely1099Required).length} vendor(s)</ComplianceCard>
        <ComplianceCard title="Staged payments">{payments.length} payment(s)</ComplianceCard>
      </section>
    </div>
  );
}
