import { revalidatePath } from "next/cache";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import { createCashDepositBatch, loadCashDepositBatches, loadStagedCashContributions } from "@/lib/compliance/cash/cash-storage";

export const dynamic = "force-dynamic";

export default async function CashBatchesPage() {
  const [contributions, batches] = await Promise.all([loadStagedCashContributions(), loadCashDepositBatches()]);
  const batchable = contributions.filter((item) => item.approvalStatus === "approved" && !item.intakeBatchId);

  async function createBatch(formData: FormData) {
    "use server";
    await createCashDepositBatch({
      contributionIds: String(formData.get("contributionIds") ?? "").split(",").map((id) => id.trim()).filter(Boolean),
      countedCashTotal: Number(formData.get("countedCashTotal") ?? 0),
      preparedByInitials: String(formData.get("preparedByInitials") ?? "UNK"),
      batchDate: String(formData.get("batchDate") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    });
    revalidatePath("/admin/compliance/cash/batches");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Cash batches"
        title="Cash Deposit Batches"
        description="Batch approved cash before deposit, record counted cash, and prepare for later bank reconciliation."
      />
      <ComplianceNav />
      <form action={createBatch} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Create batch</h2>
        <p className="mt-2 font-body text-sm text-kelly-text/70">Approved unbatched contributions: {batchable.length}</p>
        <input type="hidden" name="contributionIds" value={batchable.map((item) => item.id).join(",")} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input name="preparedByInitials" label="Prepared by initials" required />
          <Input name="batchDate" label="Batch date" type="date" />
          <Input name="countedCashTotal" label="Total cash counted" type="number" step="0.01" required />
          <Input name="notes" label="Notes" />
        </div>
        <button className="mt-4 rounded-full bg-kelly-navy px-4 py-2 font-bold text-white">Create Deposit Batch</button>
      </form>
      <section className="grid gap-3">
        {batches.map((batch) => (
          <article key={batch.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 font-body text-sm text-kelly-text/75">
            <h2 className="font-heading text-xl font-bold text-kelly-text">{batch.batchDate} · {batch.status}</h2>
            <p>Contributions: {batch.contributionIds.length} · Counted: ${batch.countedCashTotal.toFixed(2)} · System: ${batch.systemCashTotal.toFixed(2)} · Variance: ${batch.variance.toFixed(2)}</p>
            <p>Prepared by: {batch.preparedByInitials}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function Input(props: { name: string; label: string; type?: string; step?: string; required?: boolean }) {
  return (
    <label className="font-body text-sm font-semibold text-kelly-text">
      {props.label}
      <input name={props.name} type={props.type ?? "text"} step={props.step} required={props.required} className="mt-2 block w-full rounded-xl border border-kelly-text/20 bg-white p-3" />
    </label>
  );
}
