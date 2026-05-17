import { redirect } from "next/navigation";
import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { createCheckContribution } from "@/lib/compliance/checks/check-storage";

export const dynamic = "force-dynamic";

async function createCheckAction(formData: FormData) {
  "use server";
  await createCheckContribution({
    contributorName: String(formData.get("contributorName") ?? ""),
    address1: String(formData.get("address1") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    zip: String(formData.get("zip") ?? ""),
    employer: String(formData.get("employer") ?? ""),
    occupation: String(formData.get("occupation") ?? ""),
    amount: Number(formData.get("amount") ?? 0),
    checkNumber: String(formData.get("checkNumber") ?? ""),
    checkDate: String(formData.get("checkDate") ?? ""),
    receivedDate: String(formData.get("receivedDate") ?? ""),
    depositedDate: String(formData.get("depositedDate") ?? ""),
    staffInitials: String(formData.get("staffInitials") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  redirect("/admin/compliance/checks/review");
}

export default function NewCheckContributionPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Check intake"
        title="New Check Contribution"
        description="Stage a check contribution for human review. This does not finalize legal filing records."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <form action={createCheckAction} className="grid gap-4 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 font-body text-sm">
        <input className="rounded-xl border p-3" name="staffInitials" placeholder="Staff initials" required />
        <input className="rounded-xl border p-3" name="contributorName" placeholder="Contributor full name" required />
        <input className="rounded-xl border p-3" name="address1" placeholder="Mailing address" />
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-xl border p-3" name="city" placeholder="City" />
          <input className="rounded-xl border p-3" name="state" placeholder="State" />
          <input className="rounded-xl border p-3" name="zip" placeholder="ZIP" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border p-3" name="employer" placeholder="Employer" />
          <input className="rounded-xl border p-3" name="occupation" placeholder="Occupation" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-xl border p-3" name="amount" type="number" step="0.01" placeholder="Check amount" required />
          <input className="rounded-xl border p-3" name="checkNumber" placeholder="Check number" />
          <input className="rounded-xl border p-3" name="checkDate" type="date" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border p-3" name="receivedDate" type="date" />
          <input className="rounded-xl border p-3" name="depositedDate" type="date" />
        </div>
        <textarea className="rounded-xl border p-3" name="notes" placeholder="Notes / bank deposit batch / duplicate context" rows={4} />
        <button className="rounded-full bg-kelly-navy px-5 py-3 font-bold text-white" type="submit">Stage Check Contribution</button>
      </form>
    </div>
  );
}
