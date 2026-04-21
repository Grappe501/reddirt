import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";
import { platformLabel, sourceTypeLabel } from "@/lib/orchestrator/public-feed";

export default async function AdminLiveFeedPage() {
  await ensurePlatformConnections();
  const items = await prisma.inboundContentItem
    .findMany({
      orderBy: { syncTimestamp: "desc" },
      take: 120,
      select: {
        id: true,
        title: true,
        sourcePlatform: true,
        sourceType: true,
        reviewStatus: true,
        syncTimestamp: true,
        publishedAt: true,
      },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Live inbound feed</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Chronological view of everything the orchestrator has ingested, newest sync first.
      </p>
      <ol className="mt-10 space-y-3 border-l-2 border-red-dirt/25 pl-6 font-body text-sm">
        {items.map((row) => (
          <li key={row.id} className="relative">
            <span className="absolute -left-[1.15rem] top-1.5 h-2 w-2 rounded-full bg-red-dirt" aria-hidden />
            <p className="font-semibold text-deep-soil">
              <Link href={`/admin/inbox/${row.id}`} className="text-red-dirt hover:underline">
                {row.title?.slice(0, 100) ?? row.id}
              </Link>
            </p>
            <p className="mt-1 text-xs text-deep-soil/60">
              {platformLabel(row.sourcePlatform)} · {sourceTypeLabel(row.sourceType)} · {row.reviewStatus} · synced{" "}
              {row.syncTimestamp.toLocaleString()}
              {row.publishedAt ? ` · published ${row.publishedAt.toLocaleString()}` : ""}
            </p>
          </li>
        ))}
      </ol>
      {items.length === 0 ? <p className="mt-10 text-sm text-deep-soil/55">No items yet.</p> : null}
    </div>
  );
}
