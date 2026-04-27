import { ContentPlatform, InboundReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";

export default async function AdminContentGraphPage() {
  await ensurePlatformConnections();
  const [byPlatform, byStatus, decisionsCount, withBlogRoute, storySeeds, editorialSeeds] = await Promise.all([
    prisma.inboundContentItem.groupBy({ by: ["sourcePlatform"], _count: { _all: true } }).catch(() => []),
    prisma.inboundContentItem.groupBy({ by: ["reviewStatus"], _count: { _all: true } }).catch(() => []),
    prisma.contentDecision.count().catch(() => 0),
    prisma.inboundContentItem.count({ where: { routeToBlog: true } }).catch(() => 0),
    prisma.inboundContentItem.count({ where: { storySeed: true } }).catch(() => 0),
    prisma.inboundContentItem.count({ where: { editorialSeed: true } }).catch(() => 0),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Content graph</h1>
      <p className="mt-3 font-body text-sm text-kelly-text/75">
        High-level counts across the normalized layer. This is the backbone for search, assistants, and editorial
        tooling later — not an AI surface yet.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">By platform</h2>
          <ul className="mt-4 space-y-2 font-body text-sm">
            {Object.values(ContentPlatform).map((p) => {
              const row = byPlatform.find((b) => b.sourcePlatform === p);
              return (
                <li key={p} className="flex justify-between gap-4">
                  <span>{p}</span>
                  <span className="font-semibold tabular-nums">{row?._count._all ?? 0}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">By review status</h2>
          <ul className="mt-4 space-y-2 font-body text-sm">
            {Object.values(InboundReviewStatus).map((s) => {
              const row = byStatus.find((b) => b.reviewStatus === s);
              return (
                <li key={s} className="flex justify-between gap-4">
                  <span>{s}</span>
                  <span className="font-semibold tabular-nums">{row?._count._all ?? 0}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">Routing buckets</h2>
        <ul className="mt-4 space-y-2 font-body text-sm text-kelly-text/85">
          <li className="flex justify-between">
            <span>Audit decisions logged</span>
            <span className="font-semibold">{decisionsCount}</span>
          </li>
          <li className="flex justify-between">
            <span>Flagged for blog landing (synced posts)</span>
            <span className="font-semibold">{withBlogRoute}</span>
          </li>
          <li className="flex justify-between">
            <span>Story seeds</span>
            <span className="font-semibold">{storySeeds}</span>
          </li>
          <li className="flex justify-between">
            <span>Editorial seeds</span>
            <span className="font-semibold">{editorialSeeds}</span>
          </li>
        </ul>
      </div>

      <p className="mt-8 font-body text-sm text-kelly-text/60">
        See <code className="rounded bg-kelly-text/10 px-1.5 py-0.5 text-xs">docs/content-graph.md</code> in the repo
        for the full model narrative.
      </p>
    </div>
  );
}
