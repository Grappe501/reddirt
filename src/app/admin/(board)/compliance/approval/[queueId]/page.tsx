import Link from "next/link";
import { notFound } from "next/navigation";
import { ComplianceNav, CompliancePageHeader } from "../../components";
import {
  filterQueueItems,
  getBestNextQueueItem,
  loadApprovalQueueSummary,
  QUEUE_FILTER_OPTIONS,
  QUEUE_SORT_OPTIONS,
  sortQueueItems,
} from "@/lib/compliance/approval/load-approval-queue";

export const dynamic = "force-dynamic";

export default async function ApprovalQueueDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ queueId: string }>;
  searchParams: Promise<{ filter?: string; sort?: string }>;
}) {
  const { queueId } = await params;
  const { filter: filterKey = "all", sort: sortKey = "risk_desc" } = await searchParams;
  const { queue, items, stats } = await loadApprovalQueueSummary(queueId);
  if (!queue) notFound();

  const filtered = filterKey === "all" ? items : filterQueueItems(items, filterKey);
  const sorted = sortQueueItems(filtered, sortKey);
  const nextItem = await getBestNextQueueItem(queueId);
  const minutesLeft = Math.max(1, Math.ceil(stats.remaining * 0.75));
  const readyCount = items.filter(
    (item) => !item.blockers.length && !item.missingFields.length && item.evidence.length > 0,
  ).length;
  const blockedCount = items.filter((item) => item.blockers.length > 0).length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Approval queue"
        title={queue.label}
        description={queue.description}
        actions={
          nextItem ? (
            <Link
              href={`/admin/compliance/approval/${queueId}/item/${nextItem.id}`}
              className="rounded-full bg-[#0f2744] px-5 py-3 text-sm font-bold text-white"
            >
              Review next best item
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
            <li>Needs info: {stats.needsInfo}</li>
            <li>Rejected: {stats.rejected}</li>
          </ul>
        </section>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Remaining" value={stats.remaining} />
        <Stat label="Ready (clean)" value={readyCount} />
        <Stat label="Blocked" value={blockedCount} />
        <Stat label="Est. review time" value={`~${minutesLeft} min`} />
        <Stat label="$ reviewed" value={`$${stats.dollarsReviewed.toFixed(2)}`} />
        <Stat label="$ awaiting" value={`$${stats.dollarsRemaining.toFixed(2)}`} />
        <Stat label="High risk" value={stats.highRisk} />
        <Stat label="Needs info" value={stats.needsInfo} />
      </section>
      <div>
        <p className="text-xs font-bold uppercase text-slate-500">Filter</p>
        <nav className="mt-2 flex flex-wrap gap-2">
          {QUEUE_FILTER_OPTIONS.map(([key, label]) => (
            <FilterLink key={key} queueId={queueId} filterKey={key} sortKey={sortKey} active={filterKey === key} label={label} />
          ))}
        </nav>
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-slate-500">Sort</p>
        <nav className="mt-2 flex flex-wrap gap-2">
          {QUEUE_SORT_OPTIONS.map(([key, label]) => (
            <FilterLink key={key} queueId={queueId} filterKey={filterKey} sortKey={key} active={sortKey === key} label={label} mode="sort" />
          ))}
        </nav>
      </div>
      <section className="grid gap-2">
        {sorted.slice(0, 120).map((item) => (
          <Link
            key={item.id}
            href={`/admin/compliance/approval/${queueId}/item/${item.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#0f2744]/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-[#0f2744]">{item.title}</p>
              <span className="text-xs font-bold uppercase text-slate-600">
                {item.status} · {item.riskLevel} · {item.confidenceScore}%
              </span>
            </div>
            {item.amount != null ? <p className="text-sm text-slate-600">${item.amount.toFixed(2)} · {item.source.replace(/_/g, " ")}</p> : null}
            {item.blockers.length ? <p className="text-xs font-semibold text-red-800">Blocked: {item.blockers[0]}</p> : null}
          </Link>
        ))}
      </section>
      <Link href="/admin/compliance/approval" className="text-sm font-semibold text-[#0f2744] underline">
        ← All queues
      </Link>
    </div>
  );
}

function FilterLink({
  queueId,
  filterKey,
  sortKey,
  active,
  label,
  mode,
}: {
  queueId: string;
  filterKey: string;
  sortKey: string;
  active: boolean;
  label: string;
  mode?: "sort" | "filter";
}) {
  const href = `/admin/compliance/approval/${queueId}?filter=${encodeURIComponent(filterKey)}&sort=${encodeURIComponent(sortKey)}`;
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-2 text-xs font-semibold ${active ? "border-[#0f2744] bg-[#0f2744] text-white" : "border-slate-200 bg-white text-slate-700"}`}
    >
      {label}
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="font-heading text-xl font-bold text-[#0f2744]">{value}</p>
    </div>
  );
}
