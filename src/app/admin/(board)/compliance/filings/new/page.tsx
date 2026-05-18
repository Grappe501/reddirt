import { redirect } from "next/navigation";
import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { createDraftFilingSnapshot } from "@/lib/compliance/filings/filing-storage";

export const dynamic = "force-dynamic";

async function createFilingAction(formData: FormData) {
  "use server";
  const filing = await createDraftFilingSnapshot({
    label: String(formData.get("label") ?? "Draft filing package"),
    createdByInitials: String(formData.get("createdByInitials") ?? "UNK"),
  });
  redirect(`/admin/compliance/filings/${filing.id}`);
}

export default function NewComplianceFilingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Filing package" title="Create Draft Filing Package" description="Creates an immutable draft package from approved records. Certification and filing remain human actions." />
      <ComplianceNav />
      <StorageModeNotice />
      <form action={createFilingAction} className="grid gap-4 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 font-body text-sm">
        <input name="createdByInitials" className="rounded-xl border p-3" placeholder="Reviewer initials" required maxLength={3} />
        <input name="label" className="rounded-xl border p-3" placeholder="Filing label / period" required />
        <div className="rounded-xl border border-amber-700/20 bg-amber-50 p-3 text-amber-950">
          The package will remain draft unless every readiness category is green. Do not certify without treasurer/candidate/compliance officer review.
        </div>
        <button className="rounded-full bg-kelly-navy px-5 py-3 font-bold text-white" type="submit">Create Draft Package</button>
      </form>
    </div>
  );
}
