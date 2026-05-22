import { notFound } from "next/navigation";
import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";
import { loadComplianceVendors, loadStagedMoneyMovements } from "@/lib/compliance/money/money-movement-storage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function VendorDetailPage({ params }: Params) {
  const { id } = await params;
  const [vendors, movements] = await Promise.all([loadComplianceVendors(), loadStagedMoneyMovements()]);
  const vendor = vendors.find((item) => item.id === id);
  if (!vendor) notFound();
  const payments = movements.filter((movement) => movement.name?.toLowerCase() === vendor.name.toLowerCase());
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Vendor detail" title={vendor.name} description="Coverage status for vendor/staff documentation, YTD payment tracking, and 1099 review." />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="W-9 status">{vendor.w9Status}</ComplianceCard>
        <ComplianceCard title="Contract status">{vendor.contractStatus}</ComplianceCard>
        <ComplianceCard title="YTD paid">${vendor.ytdPaid.toFixed(2)}</ComplianceCard>
        <ComplianceCard title="1099 review">{vendor.likely1099Required ? "Likely required" : "Not flagged yet"}</ComplianceCard>
      </section>
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Matched staged payments</h2>
        <div className="mt-3 grid gap-2">
          {payments.map((payment) => <p key={payment.id} className="font-body text-sm text-kelly-text/75">{payment.category} · ${payment.amount.toFixed(2)} · {payment.reviewStatus}</p>)}
          {!payments.length ? <p className="font-body text-sm text-kelly-muted">No staged payments matched by exact name yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
