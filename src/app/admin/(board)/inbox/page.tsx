import Link from "next/link";
import { ContentPlatform, InboundReviewStatus, InboundSourceType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";
import { platformLabel, sourceTypeLabel } from "@/lib/orchestrator/public-feed";

type Props = {
  searchParams: Promise<{
    platform?: string;
    sourceType?: string;
    reviewStatus?: string;
  }>;
};

function parsePlatform(raw: string | undefined): ContentPlatform | undefined {
  if (!raw?.trim()) return undefined;
  return Object.values(ContentPlatform).includes(raw as ContentPlatform) ? (raw as ContentPlatform) : undefined;
}

function parseSourceType(raw: string | undefined): InboundSourceType | undefined {
  if (!raw?.trim()) return undefined;
  return Object.values(InboundSourceType).includes(raw as InboundSourceType)
    ? (raw as InboundSourceType)
    : undefined;
}

function parseReviewStatus(raw: string | undefined): InboundReviewStatus | undefined {
  if (!raw?.trim()) return undefined;
  return Object.values(InboundReviewStatus).includes(raw as InboundReviewStatus)
    ? (raw as InboundReviewStatus)
    : undefined;
}

export default async function AdminInboxPage({ searchParams }: Props) {
  await ensurePlatformConnections();
  const sp = await searchParams;
  const platform = parsePlatform(sp.platform);
  const sourceType = parseSourceType(sp.sourceType);
  const reviewStatus = parseReviewStatus(sp.reviewStatus);

  const where: Prisma.InboundContentItemWhereInput = {};
  if (platform) where.sourcePlatform = platform;
  if (sourceType) where.sourceType = sourceType;
  if (reviewStatus) where.reviewStatus = reviewStatus;

  const items = await prisma.inboundContentItem
    .findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { syncTimestamp: "desc" }],
      take: 80,
      select: {
        id: true,
        title: true,
        excerpt: true,
        sourcePlatform: true,
        sourceType: true,
        reviewStatus: true,
        canonicalUrl: true,
        publishedAt: true,
        syncTimestamp: true,
        visibleOnUpdatesPage: true,
        visibleOnHomepageRail: true,
      },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-kelly-text">Inbound inbox</h1>
          <p className="mt-2 font-body text-sm text-kelly-text/75">
            All normalized items from connectors. Review and route from detail pages.
          </p>
        </div>
        <Link
          href="/admin/review-queue"
          className="rounded-btn border border-kelly-text/20 px-4 py-2 text-sm font-semibold text-kelly-text"
        >
          Pending only →
        </Link>
      </div>

      <form
        method="get"
        className="mt-8 grid gap-4 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)] sm:grid-cols-3"
      >
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Platform</span>
          <select
            name="platform"
            defaultValue={platform ?? ""}
            className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
          >
            <option value="">All</option>
            {Object.values(ContentPlatform).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Content type</span>
          <select
            name="sourceType"
            defaultValue={sourceType ?? ""}
            className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
          >
            <option value="">All</option>
            {Object.values(InboundSourceType).map((t) => (
              <option key={t} value={t}>
                {sourceTypeLabel(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Review status</span>
          <select
            name="reviewStatus"
            defaultValue={reviewStatus ?? ""}
            className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
          >
            <option value="">All</option>
            {Object.values(InboundReviewStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-3">
          <button type="submit" className="rounded-btn bg-kelly-text px-4 py-2 text-sm font-semibold text-kelly-page">
            Apply filters
          </button>
          <Link href="/admin/inbox" className="rounded-btn border border-kelly-text/20 px-4 py-2 text-sm text-kelly-text">
            Clear
          </Link>
        </div>
      </form>

      <div className="mt-8 overflow-x-auto rounded-card border border-kelly-text/10 bg-white shadow-[var(--shadow-soft)]">
        <table className="min-w-full divide-y divide-kelly-text/10 font-body text-sm">
          <thead className="bg-kelly-text/[0.04] text-left text-xs font-bold uppercase tracking-wider text-kelly-text/55">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kelly-text/10 text-kelly-text/85">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-kelly-navy/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/admin/inbox/${row.id}`} className="font-semibold text-kelly-navy hover:underline">
                    {row.title?.slice(0, 72) ?? "(untitled)"}
                  </Link>
                  {row.excerpt ? (
                    <p className="mt-1 line-clamp-2 text-xs text-kelly-text/60">{row.excerpt}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{platformLabel(row.sourcePlatform)}</td>
                <td className="px-4 py-3">{sourceTypeLabel(row.sourceType)}</td>
                <td className="px-4 py-3">{row.reviewStatus}</td>
                <td className="px-4 py-3 text-xs">
                  {row.visibleOnUpdatesPage ? "Updates " : ""}
                  {row.visibleOnHomepageRail ? "Home " : ""}
                  {!row.visibleOnUpdatesPage && !row.visibleOnHomepageRail ? "—" : ""}
                </td>
                <td className="px-4 py-3 text-xs text-kelly-text/65">
                  {(row.publishedAt ?? row.syncTimestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-kelly-text/55">No items match these filters.</p>
        ) : null}
      </div>
    </div>
  );
}
