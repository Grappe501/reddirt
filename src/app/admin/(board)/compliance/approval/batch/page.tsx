import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader, ComplianceWarningPanel } from "../../components";
import { ComplianceWhatThisMeans } from "../../compliance-ux";
import { APRIL_2026_QUEUE_ID } from "@/lib/compliance/approval/build-approval-queue";
import { buildBatchReadinessReport } from "@/lib/compliance/approval/batch-readiness";
import { getBatchEligibleItems, getQueueItems } from "@/lib/compliance/approval/load-approval-queue";
import { batchApproveAction } from "../actions";

export const dynamic = "force-dynamic";

const REASON_LABELS: Record<string, string> = {
  confidence_low: "Confidence below 98%",
  evidence_missing: "Evidence missing",
  blockers: "Active blockers",
  source_update_pending: "Source update pending",
  missing_required_field: "Required field missing",
  rule_review_required: "Rule review item",
  high_risk: "Not low risk",
  not_open_status: "Already decided",
};

export default async function ApprovalBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ queueId?: string }>;
}) {
  const { queueId: requested } = await searchParams;
  const queueId = requested ?? APRIL_2026_QUEUE_ID;
  const [eligible, items] = await Promise.all([getBatchEligibleItems(queueId), getQueueItems(queueId)]);
  const report = await buildBatchReadinessReport(queueId, items);
  const totalAmount = eligible.reduce((sum, item) => sum + (item.amount ?? 0), 0);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Batch approval"
        title="Batch readiness report"
        description="Strict low-risk batch only. Human initials and audit note required. Not legal certification."
      />
      <ComplianceNav />
      <ComplianceWhatThisMeans title="Why zero batch eligible is normal">
        <p>
          Batch is intentionally strict: confidence ≥ 98%, low risk, evidence present, no blockers, no source-update pending.{" "}
          <strong>Rule review items are never batch-eligible.</strong> Zero eligible does not mean the app is broken — it means safety gates are working.
        </p>
        <p className="mt-2">Use near-eligible list below or filter the April queue by &quot;Near batch eligible&quot;.</p>
      </ComplianceWhatThisMeans>
      <section className="grid gap-3 sm:grid-cols-3">
        <ComplianceCard title="Eligible now">{report.eligible}</ComplianceCard>
        <ComplianceCard title="Close to eligible">{report.closeToEligible}</ComplianceCard>
        <ComplianceCard title="Ineligible (open)">{report.ineligible}</ComplianceCard>
      </section>
      <ComplianceWarningPanel title="Safety gates (unchanged)">
        <p className="text-sm">
          Batch requires confidence ≥ 98%, low risk, evidence, no blockers, no source-update pending.{" "}
          <strong>Rule review items are never batch-eligible.</strong>
        </p>
      </ComplianceWarningPanel>
      {report.eligible === 0 ? (
        <ComplianceWarningPanel title="Why no batch eligible items?">
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(report.reasonCounts)
              .filter(([, count]) => count > 0)
              .map(([reason, count]) => (
                <li key={reason}>
                  {REASON_LABELS[reason] ?? reason}: {count} item(s)
                </li>
              ))}
          </ul>
        </ComplianceWarningPanel>
      ) : null}
      {report.topBlockers.length ? (
        <ComplianceCard title="Top fixable blockers">
          <ul className="space-y-1 text-sm">
            {report.topBlockers.map((row) => (
              <li key={row.reason}>
                {row.reason} ({row.count})
              </li>
            ))}
          </ul>
        </ComplianceCard>
      ) : null}
      {report.nearEligible.length ? (
        <ComplianceCard title="Near eligible (fix 1–2 issues)">
          <ul className="space-y-2 text-sm">
            {report.nearEligible.map((row) => (
              <li key={row.id}>
                <Link href={`/admin/compliance/approval/${queueId}/item/${row.id}`} className="font-semibold text-[#0f2744] underline">
                  {row.title}
                </Link>
                <p className="text-xs text-slate-600">{row.fixes.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </ComplianceCard>
      ) : null}
      <form action={batchApproveAction} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="queueId" value={queueId} />
        {eligible.map((item) => (
          <input key={item.id} type="hidden" name="itemIds" value={item.id} />
        ))}
        <p className="text-sm">
          Eligible: {eligible.length} · Total ${totalAmount.toFixed(2)}
        </p>
        {eligible.length ? (
          <ul className="mt-3 max-h-40 overflow-y-auto rounded-lg border p-3 text-xs">
            {eligible.map((item) => (
              <li key={item.id}>
                {item.title} · {item.confidenceScore}%
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-kelly-muted">No items eligible for batch approval in this queue.</p>
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
          className="mt-4 w-full rounded-full bg-[#0f2744] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          Approve selected batch
        </button>
      </form>
      <Link href={`/admin/compliance/approval/${queueId}`} className="text-sm font-semibold text-[#0f2744] underline">
        ← Back to queue
      </Link>
    </div>
  );
}
