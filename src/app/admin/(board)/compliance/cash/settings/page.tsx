import { revalidatePath } from "next/cache";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import { cashPolicyNotice } from "@/lib/compliance/cash/cash-policy";
import { loadCashPolicy, saveCashPolicy } from "@/lib/compliance/cash/cash-storage";

export const dynamic = "force-dynamic";

export default async function CashSettingsPage() {
  const policy = await loadCashPolicy();

  async function save(formData: FormData) {
    "use server";
    await saveCashPolicy({
      maxCashContributionAmount: Number(formData.get("maxCashContributionAmount") ?? 100),
      idRequired: formData.get("idRequired") === "on",
      contributorInfoRequired: formData.get("contributorInfoRequired") === "on",
      requireHumanReview: formData.get("requireHumanReview") === "on",
      sourceNote: String(formData.get("sourceNote") ?? ""),
      verifiedBy: String(formData.get("verifiedBy") ?? "") || undefined,
      verifiedAt: String(formData.get("verifiedAt") ?? "") || undefined,
    });
    revalidatePath("/admin/compliance/cash/settings");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Cash policy" title="Cash Intake Settings" description={cashPolicyNotice} />
      <ComplianceNav />
      <form action={save} className="grid gap-4 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <label className="font-body text-sm font-semibold text-kelly-text">
          Max cash contribution amount
          <input name="maxCashContributionAmount" type="number" step="0.01" defaultValue={policy.maxCashContributionAmount} className="mt-2 block w-full rounded-xl border border-kelly-text/20 bg-white p-3" />
        </label>
        <Checkbox name="idRequired" label="ID required" defaultChecked={policy.idRequired} />
        <Checkbox name="contributorInfoRequired" label="Contributor information required" defaultChecked={policy.contributorInfoRequired} />
        <Checkbox name="requireHumanReview" label="Human review required" defaultChecked={policy.requireHumanReview} />
        <label className="font-body text-sm font-semibold text-kelly-text">
          Source note
          <textarea name="sourceNote" defaultValue={policy.sourceNote} className="mt-2 min-h-28 w-full rounded-xl border border-kelly-text/20 bg-white p-3" />
        </label>
        <label className="font-body text-sm font-semibold text-kelly-text">
          Verified by
          <input name="verifiedBy" defaultValue={policy.verifiedBy ?? ""} className="mt-2 block w-full rounded-xl border border-kelly-text/20 bg-white p-3" />
        </label>
        <label className="font-body text-sm font-semibold text-kelly-text">
          Verified at
          <input name="verifiedAt" type="date" defaultValue={policy.verifiedAt ?? ""} className="mt-2 block w-full rounded-xl border border-kelly-text/20 bg-white p-3" />
        </label>
        <button className="rounded-full bg-kelly-navy px-4 py-2 font-bold text-white">Save Policy</button>
      </form>
    </div>
  );
}

function Checkbox(props: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 font-body text-sm font-semibold text-kelly-text">
      <input name={props.name} type="checkbox" defaultChecked={props.defaultChecked} className="h-5 w-5" />
      {props.label}
    </label>
  );
}
