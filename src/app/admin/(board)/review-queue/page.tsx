import Link from "next/link";
import { InboundReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";
import { platformLabel, sourceTypeLabel } from "@/lib/orchestrator/public-feed";

export default async function AdminReviewQueuePage() {
  await ensurePlatformConnections();
  const items = await prisma.inboundContentItem
    .findMany({
      where: { reviewStatus: InboundReviewStatus.PENDING },
      orderBy: [{ publishedAt: "desc" }, { syncTimestamp: "desc" }],
      take: 100,
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Review queue</h1>
      <p className="mt-3 font-body text-sm text-kelly-text/75">
        Items awaiting human review ({items.length} pending). Approve, feature, suppress, or route from each detail
        page.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/admin/inbox" className="text-sm font-semibold text-kelly-navy hover:underline">
          Full inbox with filters →
        </Link>
      </div>

      <ul className="mt-10 space-y-4">
        {items.map((row) => (
          <li
            key={row.id}
            className="rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/admin/inbox/${row.id}`} className="font-heading text-lg font-bold text-kelly-navy hover:underline">
                  {row.title ?? "(untitled)"}
                </Link>
                <p className="mt-1 font-body text-xs text-kelly-text/55">
                  {platformLabel(row.sourcePlatform)} · {sourceTypeLabel(row.sourceType)} ·{" "}
                  {(row.publishedAt ?? row.syncTimestamp).toLocaleString()}
                </p>
                {row.excerpt ? (
                  <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{row.excerpt.slice(0, 280)}</p>
                ) : null}
              </div>
              <Link
                href={`/admin/inbox/${row.id}`}
                className="shrink-0 rounded-btn bg-kelly-navy px-4 py-2 text-xs font-bold text-kelly-page"
              >
                Review
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 ? (
        <p className="mt-10 text-center font-body text-sm text-kelly-text/55">Queue is clear.</p>
      ) : null}
    </div>
  );
}
