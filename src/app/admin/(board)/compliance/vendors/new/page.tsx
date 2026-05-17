import { redirect } from "next/navigation";
import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { createComplianceVendor } from "@/lib/compliance/money/money-movement-storage";
import type { ComplianceVendor } from "@/lib/compliance/money/money-movement-types";

export const dynamic = "force-dynamic";

async function createVendorAction(formData: FormData) {
  "use server";
  await createComplianceVendor({
    name: String(formData.get("name") ?? ""),
    entityType: String(formData.get("entityType") ?? "vendor") as ComplianceVendor["entityType"],
    address1: String(formData.get("address1") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    zip: String(formData.get("zip") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    w9Status: String(formData.get("w9Status") ?? "missing") as ComplianceVendor["w9Status"],
    contractStatus: String(formData.get("contractStatus") ?? "missing") as ComplianceVendor["contractStatus"],
    ytdPaid: Number(formData.get("ytdPaid") ?? 0),
    notes: String(formData.get("notes") ?? ""),
    actorInitials: String(formData.get("actorInitials") ?? ""),
  });
  redirect("/admin/compliance/vendors");
}

export default function NewVendorPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Vendors" title="New Vendor / 1099 Profile" description="Store vendor coverage status only. Do not enter SSNs or full tax IDs in this app." />
      <ComplianceNav />
      <StorageModeNotice />
      <form action={createVendorAction} className="grid gap-4 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 font-body text-sm">
        <input className="rounded-xl border p-3" name="actorInitials" placeholder="Staff initials" required />
        <input className="rounded-xl border p-3" name="name" placeholder="Vendor/staff name" required />
        <select className="rounded-xl border p-3" name="entityType">{["individual", "business", "staff", "vendor"].map((item) => <option key={item}>{item}</option>)}</select>
        <input className="rounded-xl border p-3" name="address1" placeholder="Address" />
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-xl border p-3" name="city" placeholder="City" />
          <input className="rounded-xl border p-3" name="state" placeholder="State" />
          <input className="rounded-xl border p-3" name="zip" placeholder="ZIP" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border p-3" name="email" placeholder="Email" />
          <input className="rounded-xl border p-3" name="phone" placeholder="Phone" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <select className="rounded-xl border p-3" name="w9Status">{["missing", "requested", "received", "not_required"].map((item) => <option key={item}>{item}</option>)}</select>
          <select className="rounded-xl border p-3" name="contractStatus">{["missing", "received", "not_required"].map((item) => <option key={item}>{item}</option>)}</select>
          <input className="rounded-xl border p-3" name="ytdPaid" type="number" step="0.01" placeholder="YTD paid" />
        </div>
        <textarea className="rounded-xl border p-3" name="notes" placeholder="Notes, contract/W-9 follow-up, payment context" rows={4} />
        <button className="rounded-full bg-kelly-navy px-5 py-3 font-bold text-white" type="submit">Create Vendor Profile</button>
      </form>
    </div>
  );
}
