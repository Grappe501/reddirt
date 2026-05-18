import Link from "next/link";
import { notFound } from "next/navigation";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import { filterQueueItems, loadApprovalQueueSummary, getNextQueueItem } from "@/lib/compliance/approval/load-approval-queue";

export const dynamic = "force-dynamic";

const FILTERS = [
  ["all", "All"],
  ["ready", "Ready"],
  ["high_risk", "High risk"],
  ["needs_info", "Needs info"],
  ["missing_fields", "Missing fields"],
  ["no_evidence", "No evidence"],
  ["duplicates", "Duplicates"],
] as const;

export default async function ApprovalQueueDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ queueId: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { queueId } = await params;
  const { filter: filterKey = "all" } = await searchParams;
  const { queue, items, stats } = await loadApprovalQueueSummary(queueId);
  if (!queue) notFound();

  const filtered = filterKey === "all" ? items : filterQueueItems(items, filterKey);
  const nextItem = await getNextQueueItem(queueId);
  const minutesLeft = Math.max(1, Math.ceil(stats.remaining * 0.75));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Approval queue"
        title={queue.label}
        description={queue.description}
        actions={
          nextItem ? (
            <Link href={`/admin/compliance/approval/${queueId}/item/${nextItem.id}`} className="rounded-full bg-kelly-text px-5 py-2 text-sm font-bold text-white">
              Start reviewing
            </Link>
          ) : null
        }
      />
      <ComplianceNav />
      {stats.remaining === 0 ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="font-heading text-xl font-bold text-emerald-950">Queue complete</h2>
          <ul className="mt-4 grid gap-2 text-sm text-emerald-900 sm:grid-cols-2">
            <li>Reviewed: {stats.total}</li>
            <li>Approved: {stats.approved}</li>
            <li>Approved with changes: {stats.approvedWithChanges}</li>
            <li>Needs info: {stats.needsInfo}</li>
            <li>Rejected: {stats.rejected}</li>
            <li>Duplicates: {stats.duplicate}</li>
            <li>Skipped: {stats.skipped}</li>
            <li>Remaining: {stats.remaining}</li>
          </ul>
        </section>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Remaining" value={stats.remaining} />
        <Stat label="High risk" value={stats.highRisk} />
        <Stat label="Blockers" value={stats.blockerCount} />
        <Stat label="Est. time" value={`~${minutesLeft} min`} />
        <Stat label="$ reviewed" value={`$${stats.dollarsReviewed.toFixed(2)}`} />
        <Stat label="$ remaining" value={`$${stats.dollarsRemaining.toFixed(2)}`} />
        <Stat label="Approved" value={stats.approved} />
        <Stat label="Needs info" value={stats.needsInfo} />
      </section>
      <nav className="flex flex-wrap gap-2">
        {FILTERS.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/compliance/approval/${queueId}?filter=${key}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filterKey === key ? "border-kelly-navy bg-kelly-navy text-white" : "border-kelly-text/15"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="grid gap-2">
        {filtered.slice(0, 100).map((item) => (
          <Link
            key={item.id}
            href={`/admin/compliance/approval/${queueId}/item/${item.id}`}
            className="rounded-xl border border-kelly-text/10 bg-kelly-page p-3 transition hover:border-kelly-navy/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{item.title}</p>
              <span className="text-xs uppercase">{item.status} · {item.riskLevel}</span>
            </div>
            {item.amount != null ? <p className="text-sm text-kelly-text/70">${item.amount.toFixed(2)}</p> : null}
            {item.blockers.length ? <p className="text-xs text-red-800">Approval blocked: {item.blockers[0]}</p> : null}
          </Link>
        ))}
      </section>
      <Link href="/admin/compliance/approval" className="text-sm font-semibold text-kelly-navy underline">
        ← All queues
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-kelly-text/10 bg-kelly-page p-3">
      <p className="text-xs font-bold uppercase text-kelly-slate">{label}</p>
      <p className="font-heading text-xl font-bold">{value}</p>
    </div>
  );
}
