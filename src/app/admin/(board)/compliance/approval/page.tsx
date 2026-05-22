import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { rebuildApprovalQueuesAction } from "./actions";
import { listAllQueues, loadApprovalQueueSummary } from "@/lib/compliance/approval/load-approval-queue";
import { APRIL_2026_QUEUE_ID } from "@/lib/compliance/approval/build-approval-queue";

export const dynamic = "force-dynamic";

export default async function ApprovalHubPage() {
  const queues = await listAllQueues();
  const primary = queues.find((queue) => queue.id === APRIL_2026_QUEUE_ID);
  const primaryStats = primary ? (await loadApprovalQueueSummary(APRIL_2026_QUEUE_ID)).stats : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Approval"
        title="Lightning Approval Workbench"
        description="Review AI-prepared compliance records one at a time, verify evidence, approve, reject, or request more information."
        actions={
          <form action={rebuildApprovalQueuesAction}>
            <button type="submit" className="rounded-full bg-kelly-text px-4 py-2 text-sm font-bold text-white">
              Rebuild queues
            </button>
          </form>
        }
      />
      <ComplianceNav />
      <ComplianceCard title="April 2026 review" href="/admin/compliance/april26">
        April26 dashboard — contributions, expenses, images, payout batches, and workbench links.
      </ComplianceCard>
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Start review" href={primary ? `/admin/compliance/approval/${APRIL_2026_QUEUE_ID}` : undefined}>
          {primaryStats
            ? `${primaryStats.remaining} item(s) remaining · ${primaryStats.approved} approved`
            : "Run rebuild queues to load April 2026 imports."}
        </ComplianceCard>
        <ComplianceCard title="Batch approval (low risk)" href="/admin/compliance/approval/batch">
          Approve only items with confidence ≥ 98%, low risk, evidence, and no blockers.
        </ComplianceCard>
        <ComplianceCard title="Approval history" href="/admin/compliance/approval/history">
          Audit log, reopen items, and export trail. Human review required — not legal certification.
        </ComplianceCard>
      </section>
      <section className="grid gap-3">
        {queues.map((queue) => (
          <QueueRow key={queue.id} queueId={queue.id} label={queue.label} description={queue.description} count={queue.itemIds.length} />
        ))}
        {!queues.length ? (
          <p className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 text-sm">
            No approval queues yet. Click <strong>Rebuild queues</strong> to ingest staged compliance records from GoodChange, bank, receipts, cash, vendors, and April26 imports.
          </p>
        ) : null}
      </section>
    </div>
  );
}

async function QueueRow({ queueId, label, description, count }: { queueId: string; label: string; description: string; count: number }) {
  const { stats } = await loadApprovalQueueSummary(queueId);
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-page p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-heading text-lg font-bold">{label}</h2>
        <p className="text-sm text-kelly-muted">{description}</p>
        <p className="mt-1 text-xs text-kelly-slate">
          {count} items · {stats.remaining} remaining · {stats.highRisk} high risk
        </p>
      </div>
      <Link href={`/admin/compliance/approval/${queueId}`} className="rounded-full bg-kelly-navy px-4 py-2 text-center text-sm font-semibold text-white">
        Open queue
      </Link>
    </article>
  );
}
