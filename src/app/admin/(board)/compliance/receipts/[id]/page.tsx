import { notFound } from "next/navigation";
import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";
import { loadReceiptAuditLog, loadStagedReceipts } from "@/lib/compliance/receipts/receipt-storage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function ReceiptDetailPage({ params }: Params) {
  const { id } = await params;
  const [receipts, audit] = await Promise.all([loadStagedReceipts(), loadReceiptAuditLog()]);
  const receipt = receipts.find((item) => item.id === id);
  if (!receipt) notFound();
  const entries = audit.filter((entry) => entry.receiptId === receipt.id);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Receipt detail" title={receipt.vendorName ?? "Receipt detail"} description="Human review record for extraction, tip, payment method, purpose, approval, money movement link, and audit history." />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Total">${receipt.total.toFixed(2)}</ComplianceCard>
        <ComplianceCard title="Tip">{receipt.tipStatus}{receipt.tip ? ` · $${receipt.tip.toFixed(2)}` : ""}</ComplianceCard>
        <ComplianceCard title="Payment">{receipt.paymentMethod}</ComplianceCard>
        <ComplianceCard title="Bank match">{receipt.reconciliationStatus}</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard title="Extracted / verified fields">
          <p>Date: {receipt.receiptDate ?? "missing"}</p>
          <p>Subtotal: {receipt.subtotal?.toFixed(2) ?? "n/a"} · Tax: {receipt.tax?.toFixed(2) ?? "n/a"}</p>
          <p>Category: {receipt.category}</p>
          <p>Purpose: {receipt.businessPurpose ?? "missing"}</p>
          <p>Card last four: {receipt.cardLastFour ? `****${receipt.cardLastFour}` : "not stored"}</p>
        </ComplianceCard>
        <ComplianceCard title="Review status">
          <p>Review: {receipt.reviewStatus}</p>
          <p>Approval: {receipt.approvalStatus}</p>
          <p>Documentation: {receipt.documentationStatus}</p>
          <p>Money movement: {receipt.moneyMovementId ?? "not staged"}</p>
        </ComplianceCard>
      </section>
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Audit trail</h2>
        <div className="mt-3 grid gap-2">
          {entries.map((entry) => <p key={entry.id} className="font-body text-sm text-kelly-text/75">{entry.createdAt} · {entry.actorInitials} · {entry.action} · {entry.note ?? ""}</p>)}
          {!entries.length ? <p className="font-body text-sm text-kelly-text/70">No audit entries found.</p> : null}
        </div>
      </section>
    </div>
  );
}
