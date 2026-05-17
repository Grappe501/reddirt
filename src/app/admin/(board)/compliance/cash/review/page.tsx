import { revalidatePath } from "next/cache";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import { loadStagedCashContributions, updateCashContributionStatus } from "@/lib/compliance/cash/cash-storage";

export const dynamic = "force-dynamic";

export default async function CashReviewPage() {
  const contributions = await loadStagedCashContributions();

  async function act(formData: FormData) {
    "use server";
    await updateCashContributionStatus({
      id: String(formData.get("id") ?? ""),
      actorInitials: String(formData.get("actorInitials") ?? "UNK"),
      action: String(formData.get("action") ?? "") as "approved" | "rejected" | "converted_to_contribution",
      note: String(formData.get("note") ?? "") || undefined,
    });
    revalidatePath("/admin/compliance/cash/review");
  }

  const groups = [
    ["Needs review", contributions.filter((item) => item.complianceStatus === "needs_review")],
    ["Missing info", contributions.filter((item) => item.complianceStatus === "missing_required_fields")],
    ["Over limit", contributions.filter((item) => item.complianceStatus === "amount_over_cash_limit")],
    ["Ready for approval", contributions.filter((item) => item.complianceStatus === "ready_for_approval")],
    ["Approved", contributions.filter((item) => item.complianceStatus === "approved")],
    ["Rejected", contributions.filter((item) => item.complianceStatus === "rejected")],
    ["Converted to ledger", contributions.filter((item) => item.complianceStatus === "converted_to_contribution")],
  ] as const;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Cash review"
        title="Cash Contribution Review"
        description="Review staged cash contributions before approval, batching, conversion, or rejection."
      />
      <ComplianceNav />
      <section className="grid gap-4">
        {groups.map(([title, items]) => (
          <div key={title} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
            <h2 className="font-heading text-xl font-bold text-kelly-text">{title} ({items.length})</h2>
            <div className="mt-4 grid gap-3">
              {items.length ? items.map((item) => (
                <article key={item.id} className="rounded-xl border border-kelly-text/10 bg-kelly-wash p-4 font-body text-sm text-kelly-text/80">
                  <p className="font-heading text-lg font-bold text-kelly-text">{item.donorFullName || `${item.donorFirstName ?? ""} ${item.donorLastName ?? ""}`.trim() || "Unnamed donor"} · ${item.amount.toFixed(2)}</p>
                  <p>Date: {item.contributionDate} · ID checked: {item.idChecked ? "yes" : "no"} · OCR: {item.ocrExtraction?.confidence ?? "not run"}</p>
                  <p>Employer: {item.employer || "missing"} · Occupation: {item.occupation || "missing"}</p>
                  <p>Address: {[item.donorAddress1, item.donorCity, item.donorState, item.donorZip].filter(Boolean).join(", ") || "missing"}</p>
                  {item.warnings.length ? <p className="mt-2 text-amber-900">Warnings: {item.warnings.join("; ")}</p> : null}
                  <form action={act} className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="actorInitials" placeholder="Initials" className="rounded-lg border border-kelly-text/20 bg-white p-2" required />
                    <input name="note" placeholder="Review note / override reason" className="rounded-lg border border-kelly-text/20 bg-white p-2" />
                    <button name="action" value="approved" className="rounded-full bg-kelly-navy px-3 py-2 font-bold text-white">Approve</button>
                    <button name="action" value="converted_to_contribution" className="rounded-full border border-kelly-navy px-3 py-2 font-bold text-kelly-navy">Convert</button>
                    <button name="action" value="rejected" className="rounded-full border border-red-900 px-3 py-2 font-bold text-red-900">Reject</button>
                  </form>
                </article>
              )) : <p className="font-body text-sm text-kelly-text/65">No items in this bucket.</p>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
