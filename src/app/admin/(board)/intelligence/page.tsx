import Link from "next/link";
import { OppositionEntityType, OppositionReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";

const REVIEW_QUEUE_STATUSES: OppositionReviewStatus[] = [
  OppositionReviewStatus.DRAFT,
  OppositionReviewStatus.NEEDS_REVIEW,
];

export default async function OppositionIntelligenceAdminPage() {
  const reviewFilter = { reviewStatus: { in: REVIEW_QUEUE_STATUSES } };

  const [
    entities,
    entityTypeGroups,
    sourceTotal,
    sourcesInReview,
    billsQ,
    votesQ,
    financeQ,
    messagesQ,
    videosQ,
    newsQ,
    patternsQ,
    accountabilityQ,
  ] = await Promise.all([
    prisma.oppositionEntity.findMany({
      orderBy: [{ name: "asc" }],
      take: 200,
      select: { id: true, name: true, type: true, updatedAt: true },
    }),
    prisma.oppositionEntity.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.oppositionSource.count(),
    prisma.oppositionSource.count({ where: reviewFilter }),
    prisma.oppositionBillRecord.count({ where: reviewFilter }),
    prisma.oppositionVoteRecord.count({ where: reviewFilter }),
    prisma.oppositionFinanceRecord.count({ where: reviewFilter }),
    prisma.oppositionMessageRecord.count({ where: reviewFilter }),
    prisma.oppositionVideoRecord.count({ where: reviewFilter }),
    prisma.oppositionNewsMention.count({ where: reviewFilter }),
    prisma.oppositionElectionPattern.count({ where: reviewFilter }),
    prisma.oppositionAccountabilityItem.count({ where: reviewFilter }),
  ]);

  const countsByType = Object.fromEntries(
    entityTypeGroups.map((g) => [g.type, g._count._all])
  ) as Partial<Record<OppositionEntityType, number>>;

  const recordReviewQueue =
    billsQ +
    votesQ +
    financeQ +
    messagesQ +
    videosQ +
    newsQ +
    patternsQ +
    accountabilityQ;

  return (
    <div className="mx-auto max-w-5xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">
          Campaign intelligence
        </p>
        <h1 className="font-heading text-2xl font-bold">Opposition intelligence</h1>
        <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/70">
          Source-backed internal intelligence only. Human review required before external use. No automated scraping,
          publication, or AI conclusions in this surface — see{" "}
          <Link href="/admin/media-monitor" className="text-kelly-slate underline">
            Press monitor
          </Link>{" "}
          for earned-media tooling.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Entities</p>
          <p className="mt-1 font-heading text-2xl font-bold">{entities.length}</p>
          <p className="mt-1 text-xs text-kelly-text/60">Listed below (max 200)</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Sources</p>
          <p className="mt-1 font-heading text-2xl font-bold">{sourceTotal}</p>
          <p className="mt-1 text-xs text-kelly-text/60">In review queue: {sourcesInReview}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Intel rows in review</p>
          <p className="mt-1 font-heading text-2xl font-bold">{recordReviewQueue}</p>
          <p className="mt-1 text-xs text-kelly-text/60">DRAFT + NEEDS_REVIEW (all record tables)</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">INTEL-3</p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-kelly-text/70">
            Schema + helpers; INTEL-4 = parsers; INTEL-5 = analysis UI.
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">
          Entities by type
        </h2>
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-text/55">
                <th className="py-1.5 pr-3 font-semibold">Type</th>
                <th className="py-1.5 font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(OppositionEntityType).map((t) => (
                <tr key={t} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3 font-mono">{t}</td>
                  <td className="py-1.5">{countsByType[t] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">
          Review queue by record kind (DRAFT / NEEDS_REVIEW)
        </h2>
        <ul className={`${card} grid gap-1 font-mono text-xs sm:grid-cols-2`}>
          <li>Bills: {billsQ}</li>
          <li>Votes: {votesQ}</li>
          <li>Finance: {financeQ}</li>
          <li>Messages: {messagesQ}</li>
          <li>Videos: {videosQ}</li>
          <li>News: {newsQ}</li>
          <li>Election patterns: {patternsQ}</li>
          <li>Accountability: {accountabilityQ}</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider text-kelly-text/55">Entity list</h2>
        {entities.length === 0 ? (
          <p className={card}>No opposition entities yet. Use Prisma Studio or INTEL-3 helpers to add rows.</p>
        ) : (
          <div className={`${card} overflow-x-auto p-0`}>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-kelly-text/10 bg-kelly-text/[0.03] text-kelly-text/55">
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                  <th className="px-3 py-2 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((e) => (
                  <tr key={e.id} className="border-b border-kelly-text/5">
                    <td className="px-3 py-2 font-medium">{e.name}</td>
                    <td className="px-3 py-2 font-mono text-kelly-text/75">{e.type}</td>
                    <td className="px-3 py-2 font-mono text-kelly-text/60">{e.updatedAt.toISOString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
