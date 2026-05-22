import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { loadComplianceVendors, loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const [vendors, movements] = await Promise.all([loadComplianceVendors(), loadStagedMoneyMovements()]);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Vendors"
        title="1099 Staff / Vendor Tracking"
        description="Track W-9 status, contract status, year-to-date payment coverage, and 1099 review risk without storing SSNs/TINs."
      />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="New Vendor" href="/admin/compliance/vendors/new">Create vendor/staff profile.</ComplianceCard>
        <ComplianceCard title="1099 Review" href="/admin/compliance/1099">{vendors.filter((vendor) => vendor.likely1099Required).length} likely required.</ComplianceCard>
        <ComplianceCard title="Missing W-9">{vendors.filter((vendor) => vendor.w9Status === "missing" && vendor.likely1099Required).length} vendor(s).</ComplianceCard>
        <ComplianceCard title="Payments">{movements.filter((movement) => movement.category === "staff_1099_payment" || movement.category === "vendor_payment").length} staged payment(s).</ComplianceCard>
      </section>
      <section className="grid gap-3">
        {vendors.map((vendor) => (
          <a key={vendor.id} href={`/admin/compliance/vendors/${vendor.id}`} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm text-kelly-text/75">
            <strong className="text-kelly-text">{vendor.name}</strong> · {vendor.entityType} · W-9 {vendor.w9Status} · YTD ${vendor.ytdPaid.toFixed(2)}
          </a>
        ))}
        {!vendors.length ? <p className="font-body text-sm text-kelly-muted">No compliance vendors yet.</p> : null}
      </section>
    </div>
  );
}
