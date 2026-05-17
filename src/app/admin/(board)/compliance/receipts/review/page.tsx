import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";
import { approveReceipt, convertReceiptToMoneyMovement } from "@/lib/compliance/receipts/convert-receipt-to-money-movement";
import { loadStagedReceipts } from "@/lib/compliance/receipts/receipt-storage";

export const dynamic = "force-dynamic";

async function receiptAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const actorInitials = String(formData.get("actorInitials") ?? "REV");
  const action = String(formData.get("action") ?? "");
  if (action === "approve") await approveReceipt({ receiptId: id, actorInitials });
  if (action === "stage" || action === "stage_reimbursement") {
    await approveReceipt({ receiptId: id, actorInitials, note: "Human approved from receipt review queue." });
    await convertReceiptToMoneyMovement({
      receiptId: id,
      actorInitials,
      conversionMode: action === "stage_reimbursement" ? "reimbursement" : "expense",
    });
  }
}

export default async function ReceiptReviewPage() {
  const receipts = await loadStagedReceipts();
  const groups = [
    ["Needs review", receipts.filter((receipt) => receipt.reviewStatus === "needs_review")],
    ["Tip question needed", receipts.filter((receipt) => receipt.tipStatus === "not_sure")],
    ["Missing purpose", receipts.filter((receipt) => !receipt.businessPurpose)],
    ["Possible duplicate", receipts.filter((receipt) => receipt.warnings.some((warning) => warning.toLowerCase().includes("duplicate")))],
    ["Ready for approval", receipts.filter((receipt) => receipt.reviewStatus === "ready_for_approval")],
    ["Approved/staged", receipts.filter((receipt) => receipt.approvalStatus === "approved" || receipt.reviewStatus === "staged_to_money_movement")],
    ["Rejected", receipts.filter((receipt) => receipt.reviewStatus === "rejected")],
  ] as const;
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Receipt review" title="Receipt Review Queue" description="Review extracted data, tip status, payment method, business purpose, duplicates, approval, and bank reconciliation status." />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">{groups.slice(0, 4).map(([title, items]) => <ComplianceCard key={title} title={title}>{items.length} receipt(s)</ComplianceCard>)}</section>
      <section className="grid gap-3">
        {receipts.map((receipt) => (
          <article key={receipt.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm text-kelly-text/75">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Link className="font-semibold text-kelly-navy underline" href={`/admin/compliance/receipts/${receipt.id}`}>{receipt.vendorName ?? "Unknown vendor"}</Link>
                <p>${receipt.total.toFixed(2)} · {receipt.receiptDate ?? "date missing"} · {receipt.paymentMethod} · {receipt.category}</p>
                <p>Tip: {receipt.tipStatus}{receipt.tip ? ` ($${receipt.tip.toFixed(2)})` : ""} · Purpose: {receipt.businessPurpose ?? "missing"}</p>
                <p>Review: {receipt.reviewStatus} · Approval: {receipt.approvalStatus} · Reconciliation: {receipt.reconciliationStatus}</p>
                {receipt.warnings.length ? <p className="mt-1 text-amber-800">{receipt.warnings.join(" ")}</p> : null}
              </div>
              <form action={receiptAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={receipt.id} />
                <input className="w-20 rounded-full border px-3 py-2" name="actorInitials" placeholder="ABC" maxLength={3} />
                <button className="rounded-full border px-3 py-2 font-semibold" name="action" value="approve">Approve</button>
                <button className="rounded-full bg-kelly-navy px-3 py-2 font-semibold text-white" name="action" value="stage">Stage Expense</button>
                <button className="rounded-full border px-3 py-2 font-semibold" name="action" value="stage_reimbursement">Stage Reimbursement</button>
              </form>
            </div>
          </article>
        ))}
        {!receipts.length ? <p className="font-body text-sm text-kelly-text/70">No staged receipts yet.</p> : null}
      </section>
    </div>
  );
}
