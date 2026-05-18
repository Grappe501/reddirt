import Link from "next/link";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import { APRIL_2026_QUEUE_ID } from "@/lib/compliance/approval/build-approval-queue";
import { getBatchEligibleItems } from "@/lib/compliance/approval/load-approval-queue";
import { batchApproveAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ApprovalBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ queueId?: string }>;
}) {
  const { queueId: requested } = await searchParams;
  const queueId = requested ?? APRIL_2026_QUEUE_ID;
  const eligible = await getBatchEligibleItems(queueId);
  const totalAmount = eligible.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const sourceTypes = [...new Set(eligible.map((item) => item.source))];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Batch approval"
        title="Low-risk batch approval"
        description="Only items with confidence ≥ 98%, low risk, no blockers, evidence present, and source update path. Human initials and audit note required."
      />
      <ComplianceNav />
      <form action={batchApproveAction} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-6">
        <input type="hidden" name="queueId" value={queueId} />
        {eligible.map((item) => (
          <input key={item.id} type="hidden" name="itemIds" value={item.id} />
        ))}
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="font-semibold">Eligible items</dt>
            <dd>{eligible.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-semibold">Total amount</dt>
            <dd>${totalAmount.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Source types</dt>
            <dd>{sourceTypes.join(", ") || "none"}</dd>
          </div>
        </dl>
        {eligible.length ? (
          <ul className="mt-4 max-h-48 overflow-y-auto rounded-lg border p-3 text-xs">
            {eligible.map((item) => (
              <li key={item.id}>
                {item.title} · {item.confidenceScore}% · ${(item.amount ?? 0).toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-kelly-text/70">No items eligible for batch approval in this queue.</p>
        )}
        <label className="mt-4 block text-sm">
          <span className="font-semibold">Initials *</span>
          <input name="initials" required className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="mt-2 block text-sm">
          <span className="font-semibold">Audit note *</span>
          <textarea name="note" required rows={2} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <button
          type="submit"
          disabled={!eligible.length}
          className="mt-4 w-full rounded-full bg-kelly-text px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          Approve Selected Batch
        </button>
      </form>
      <p className="text-xs text-kelly-slate">
        High-risk items, missing fields, and items without evidence are excluded automatically.
      </p>
      <Link href={`/admin/compliance/approval/${queueId}`} className="text-sm font-semibold text-kelly-navy underline">
        ← Back to queue
      </Link>
    </div>
  );
}
