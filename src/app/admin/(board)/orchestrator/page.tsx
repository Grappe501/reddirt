import Link from "next/link";
import { ContentPlatform, InboundReviewStatus, PlatformConnectionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";

export default async function AdminOrchestratorHomePage() {
  await ensurePlatformConnections();

  const [
    connections,
    pendingCount,
    byPlatform,
    featuredVisible,
    recentItems,
    recentDecisions,
  ] = await Promise.all([
    prisma.platformConnection.findMany({ orderBy: { platform: "asc" } }).catch(() => []),
    prisma.inboundContentItem.count({ where: { reviewStatus: InboundReviewStatus.PENDING } }).catch(() => 0),
    prisma.inboundContentItem
      .groupBy({ by: ["sourcePlatform"], _count: { _all: true } })
      .catch(() => [] as { sourcePlatform: ContentPlatform; _count: { _all: number } }[]),
    prisma.inboundContentItem
      .count({
        where: {
          reviewStatus: { in: [InboundReviewStatus.REVIEWED, InboundReviewStatus.FEATURED] },
          OR: [{ visibleOnUpdatesPage: true }, { visibleOnHomepageRail: true }],
        },
      })
      .catch(() => 0),
    prisma.inboundContentItem
      .findMany({
        orderBy: { syncTimestamp: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          sourcePlatform: true,
          reviewStatus: true,
          syncTimestamp: true,
        },
      })
      .catch(() => []),
    prisma.contentDecision
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          inboundItem: { select: { title: true, sourcePlatform: true } },
        },
      })
      .catch(() => []),
  ]);

  const inboundByPlatform = new Map(
    byPlatform.map((r) => [r.sourcePlatform, r._count._all] as const),
  );

  function healthLabel(s: PlatformConnectionStatus): string {
    switch (s) {
      case PlatformConnectionStatus.OK:
        return "Healthy";
      case PlatformConnectionStatus.SYNCING:
        return "Syncing";
      case PlatformConnectionStatus.ERROR:
        return "Error";
      case PlatformConnectionStatus.CONFIGURED:
        return "Configured";
      default:
        return "Inactive";
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Content orchestrator</h1>
      <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
        Intake, normalization, and human routing for public-facing content. Outbound publishing stays off until this
        pipeline is trusted.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-deep-soil/50">Awaiting review</p>
          <p className="mt-2 font-heading text-3xl font-bold text-red-dirt">{pendingCount}</p>
        </div>
        <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-deep-soil/50">Routed to site</p>
          <p className="mt-2 font-heading text-3xl font-bold text-deep-soil">{featuredVisible}</p>
          <p className="mt-1 font-body text-xs text-deep-soil/55">Campaign trail or homepage rail</p>
        </div>
        <div className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)] sm:col-span-2">
          <p className="font-body text-xs font-bold uppercase tracking-wider text-deep-soil/50">Inbound by platform</p>
          <ul className="mt-3 space-y-1 font-body text-sm text-deep-soil/80">
            {Object.values(ContentPlatform).map((p) => (
              <li key={p} className="flex justify-between gap-4">
                <span>{p}</span>
                <span className="font-semibold tabular-nums">{inboundByPlatform.get(p) ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Sync health by platform</h2>
        <ul className="mt-4 divide-y divide-deep-soil/10 font-body text-sm">
          {connections.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-semibold text-deep-soil">{c.accountName ?? c.platform}</p>
                <p className="text-xs text-deep-soil/55">
                  {healthLabel(c.status)}
                  {c.lastSyncedAt
                    ? ` · Last sync ${c.lastSyncedAt.toLocaleString()}`
                    : c.lastSyncError
                      ? ` · ${c.lastSyncError.slice(0, 120)}`
                      : ""}
                </p>
              </div>
              <span className="rounded-full bg-deep-soil/8 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-deep-soil/70">
                {c.platform}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/platforms"
            className="rounded-btn bg-red-dirt px-4 py-2 text-sm font-bold text-cream-canvas"
          >
            Platforms & sync
          </Link>
          <Link
            href="/admin/inbox"
            className="rounded-btn border border-deep-soil/20 px-4 py-2 text-sm font-semibold text-deep-soil"
          >
            Open inbox
          </Link>
          <Link
            href="/admin/review-queue"
            className="rounded-btn border border-deep-soil/20 px-4 py-2 text-sm font-semibold text-deep-soil"
          >
            Review queue
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-deep-soil">Recent sync activity</h2>
          <ul className="mt-4 space-y-2 font-body text-sm text-deep-soil/85">
            {recentItems.map((row) => (
              <li key={row.id}>
                <Link href={`/admin/inbox/${row.id}`} className="font-semibold text-red-dirt hover:underline">
                  {row.title?.slice(0, 80) ?? row.id}
                </Link>
                <span className="text-deep-soil/55">
                  {" "}
                  · {row.sourcePlatform} · {row.reviewStatus} · {row.syncTimestamp.toLocaleString()}
                </span>
              </li>
            ))}
            {recentItems.length === 0 ? <li className="text-deep-soil/55">No inbound items yet.</li> : null}
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-deep-soil">Recent decisions</h2>
          <ul className="mt-4 space-y-2 font-body text-sm text-deep-soil/85">
            {recentDecisions.map((d) => (
              <li key={d.id}>
                <span className="font-semibold">{d.status}</span>
                <span className="text-deep-soil/55">
                  {" "}
                  → {d.destination} · {d.inboundItem.title?.slice(0, 60) ?? d.inboundItemId} ·{" "}
                  {d.createdAt.toLocaleString()}
                </span>
              </li>
            ))}
            {recentDecisions.length === 0 ? <li className="text-deep-soil/55">No audit trail yet.</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
