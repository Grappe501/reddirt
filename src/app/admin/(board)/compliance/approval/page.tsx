import Link from "next/link";
import { ComplianceCard, ComplianceNav, ComplianceOperatorChecklist, CompliancePageHeader } from "../components";
import { rebuildApprovalQueuesAction } from "./actions";
import { listAllQueues, loadApprovalQueueSummary } from "@/lib/compliance/approval/load-approval-queue";
import { APRIL_2026_QUEUE_ID } from "@/lib/compliance/approval/build-approval-queue";

export const dynamic = "force-dynamic";

const OPERATOR_STEPS = [
  "Rebuild queue (ingests April26 + staged records)",
  "Open April 2026 Compliance Review queue",
  "Review high-risk and blocked items first",
  "Approve clean items with initials (or batch when eligible)",
  "Send needs-info records to the task list",
  "Reconcile bank matches after bank CSV is present",
  "Check filing readiness before export",
];

export default async function ApprovalHubPage() {
  const queues = await listAllQueues();
  const primary = queues.find((queue) => queue.id === APRIL_2026_QUEUE_ID);
  const primaryStats = primary ? (await loadApprovalQueueSummary(APRIL_2026_QUEUE_ID)).stats : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Approval"
        title="Lightning Approval Workbench"
        description="Review AI-prepared compliance records one at a time, verify evidence, approve, reject, or request more information. Human review required — not legal certification."
        actions={
          <form action={rebuildApprovalQueuesAction}>
            <button type="submit" className="rounded-full bg-[#0f2744] px-5 py-3 text-sm font-bold text-white hover:bg-[#163a61]">
              Rebuild queues
            </button>
          </form>
        }
      />
      <ComplianceNav />
      <ComplianceOperatorChecklist steps={OPERATOR_STEPS} />
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceCard title="Start review" href={primary ? `/admin/compliance/approval/${APRIL_2026_QUEUE_ID}` : undefined}>
          {primaryStats
            ? `${primaryStats.remaining} remaining · ${primaryStats.blockerCount} blocked · ~${Math.max(1, Math.ceil(primaryStats.remaining * 0.75))} min est.`
            : "Run rebuild queues to load April 2026 imports."}
        </ComplianceCard>
        <ComplianceCard title="April26 import desk" href="/admin/compliance/april26">
          Verify GoodChange CSV, bank file, receipts, checks, and in-kind images before reconciliation.
        </ComplianceCard>
        <ComplianceCard title="Batch approval (low risk)" href="/admin/compliance/approval/batch">
          See why items are not batch-eligible and approve only safe low-risk items.
        </ComplianceCard>
        <ComplianceCard title="Approval history" href="/admin/compliance/approval/history">
          Audit log, reopen items, and export trail.
        </ComplianceCard>
      </section>
      <section className="grid gap-3">
        {queues.map((queue) => (
          <QueueRow key={queue.id} queueId={queue.id} label={queue.label} description={queue.description} count={queue.itemIds.length} />
        ))}
        {!queues.length ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            No approval queues yet. Click <strong>Rebuild queues</strong> to ingest staged compliance records.
          </p>
        ) : null}
      </section>
    </div>
  );
}

async function QueueRow({ queueId, label, description, count }: { queueId: string; label: string; description: string; count: number }) {
  const { stats } = await loadApprovalQueueSummary(queueId);
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-heading text-lg font-bold text-[#0f2744]">{label}</h2>
        <p className="text-sm text-slate-600">{description}</p>
        <p className="mt-1 text-xs text-slate-500">
          {count} items · {stats.remaining} remaining · {stats.highRisk} high risk · ${stats.dollarsRemaining.toFixed(2)} awaiting
        </p>
      </div>
      <Link href={`/admin/compliance/approval/${queueId}`} className="rounded-full bg-[#0f2744] px-5 py-2.5 text-center text-sm font-bold text-white">
        Open queue
      </Link>
    </article>
  );
}
