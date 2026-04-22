import Link from "next/link";
import { Suspense } from "react";
import { OwnedMediaKind, OwnedMediaReviewStatus, OwnedMediaStorageBackend, type Prisma } from "@prisma/client";
import {
  bulkUpdateOwnedMediaByIngestBatchExtendedAction,
  quickReviewOwnedMediaAction,
} from "@/app/admin/owned-media-actions";
import { prisma } from "@/lib/db";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";
import { MediaBatchFilterBar } from "./media-batch-filter-bar";

type Props = {
  params: Promise<{ batchId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

function buildWhere(
  batchId: string,
  sp: Record<string, string | undefined>
): Prisma.OwnedMediaAssetWhereInput {
  const w: Prisma.OwnedMediaAssetWhereInput = { mediaIngestBatchId: batchId };
  const kind = sp.kind;
  if (kind && Object.values(OwnedMediaKind).includes(kind as OwnedMediaKind)) {
    w.kind = kind as OwnedMediaKind;
  }
  const review = sp.review;
  if (review && Object.values(OwnedMediaReviewStatus).includes(review as OwnedMediaReviewStatus)) {
    w.reviewStatus = review as OwnedMediaReviewStatus;
  }
  if (sp.public === "1") w.isPublic = true;
  if (sp.public === "0") w.isPublic = false;
  if (sp.untagged === "1") {
    w.AND = [{ countySlug: null }, { linkedCampaignEventId: null }];
  }
  return w;
}

export default async function MediaIngestBatchDetailPage({ params, searchParams }: Props) {
  const { batchId } = await params;
  const sp = await searchParams;

  const [batch, events] = await Promise.all([
    prisma.mediaIngestBatch.findUnique({
      where: { id: batchId },
      include: { _count: { select: { assets: true } } },
    }),
    prisma.campaignEvent.findMany({
      orderBy: { startAt: "desc" },
      take: 200,
      select: { id: true, title: true, startAt: true, slug: true },
    }),
  ]);

  if (!batch) {
    return (
      <div>
        <p>Batch not found.</p>
        <Link href="/admin/owned-media/batches" className="text-civic-slate underline">
          Back
        </Link>
      </div>
    );
  }

  const where = buildWhere(batchId, sp);
  const assets = await prisma.ownedMediaAsset.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-1 pb-10">
      <div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/owned-media/batches" className="text-civic-slate hover:underline">
            ← Batches
          </Link>
          <Link href="/admin/owned-media" className="text-civic-slate hover:underline">
            Owned media
          </Link>
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold text-deep-soil">Review batch</h1>
        <p className="mt-1 font-mono text-xs text-deep-soil/50">{batch.id}</p>
        <p className="mt-1 text-sm text-deep-soil/75">
          <strong>{batch.sourceType}</strong> · {batch.sourceLabel} · {batch._count.assets} total assets
        </p>
        {batch.ingestPath ? (
          <p className="mt-0.5 break-all font-mono text-[10px] text-deep-soil/45">{batch.ingestPath}</p>
        ) : null}
        {sp.bulk || sp.reviewed ? (
          <p className="mt-2 rounded-md border border-emerald-600/20 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900">Updated.</p>
        ) : null}
      </div>

      <section className="rounded-card border border-deep-soil/10 bg-cream-canvas p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <h2 className="font-heading text-base font-bold text-deep-soil">Bulk actions (this batch)</h2>
        <p className="mt-1 text-xs text-deep-soil/60">Applies to every asset in this batch, ignoring filters above.</p>
        <form action={bulkUpdateOwnedMediaByIngestBatchExtendedAction} className="mt-4 space-y-4">
          <input type="hidden" name="mediaIngestBatchId" value={batchId} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Review</span>
              <select name="reviewStatus" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
                {Object.values(OwnedMediaReviewStatus).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Public</span>
              <select name="isPublic" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
                <option value="false">Private</option>
                <option value="true">Public (still needs review policy)</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 border-t border-deep-soil/10 pt-4 md:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="applyCounty" className="h-4 w-4" />
                <span>Apply county fields</span>
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-xs text-deep-soil/55">County slug</span>
                  <input name="countySlug" className="mt-1 w-full rounded border border-deep-soil/15 bg-white px-2 py-1 text-sm" />
                </label>
                <label className="block text-sm">
                  <span className="text-xs text-deep-soil/55">FIPS</span>
                  <input name="countyFips" className="mt-1 w-full rounded border border-deep-soil/15 bg-white px-2 py-1 text-sm" />
                </label>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="applyEvent" className="h-4 w-4" />
                <span>Link to campaign event</span>
              </label>
              <label className="mt-2 block text-sm">
                <span className="text-xs text-deep-soil/55">Event</span>
                <select name="linkedCampaignEventId" className="mt-1 w-full rounded border border-deep-soil/15 bg-white px-2 py-1 text-sm">
                  <option value="">— None —</option>
                  <option value="__clear__">— Clear event link —</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.startAt.toLocaleDateString()} — {e.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-btn bg-red-dirt px-4 py-2.5 text-sm font-bold text-cream-canvas"
          >
            Apply to entire batch
          </button>
        </form>
      </section>

      <Suspense fallback={<div className="h-16 rounded-lg border border-deep-soil/10 bg-white/50" />}>
        <MediaBatchFilterBar
          current={{
            kind: sp.kind,
            review: sp.review,
            public: sp.public,
            untagged: sp.untagged,
          }}
          batchId={batchId}
        />
      </Suspense>

      <p className="text-sm text-deep-soil/60">
        Showing {assets.length} asset{assets.length === 1 ? "" : "s"} (max 500) with current filters.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((a) => {
          const thumb =
            a.storageBackend === OwnedMediaStorageBackend.LOCAL_DISK ? getOwnedFilePublicPath(a.id) : a.publicUrl || "#";
          const isImage = a.kind === "IMAGE" || a.mimeType.startsWith("image/");
          return (
            <li
              key={a.id}
              className="flex flex-col overflow-hidden rounded-lg border border-deep-soil/10 bg-white/90 shadow-sm"
            >
              <Link
                href={`/admin/owned-media/${a.id}?batch=${encodeURIComponent(batchId)}`}
                className="relative block aspect-video bg-deep-soil/5"
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-xs text-deep-soil/60">
                    {a.kind} · {a.fileName}
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3 text-xs">
                <p className="line-clamp-2 font-medium text-deep-soil">{a.title}</p>
                <p className="font-mono text-[10px] text-deep-soil/45">{a.reviewStatus} · {a.isPublic ? "public" : "private"}</p>
                <div className="mt-auto flex flex-wrap gap-1">
                  <form action={quickReviewOwnedMediaAction} className="contents">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="returnBatchId" value={batchId} />
                    <input type="hidden" name="reviewStatus" value={OwnedMediaReviewStatus.APPROVED} />
                    <input type="hidden" name="isPublic" value="on" />
                    <button
                      type="submit"
                      className="rounded bg-emerald-700/15 px-2 py-1 text-[11px] font-semibold text-emerald-900"
                    >
                      Approve + public
                    </button>
                  </form>
                  <form action={quickReviewOwnedMediaAction} className="contents">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="returnBatchId" value={batchId} />
                    <input type="hidden" name="reviewStatus" value={OwnedMediaReviewStatus.PENDING_REVIEW} />
                    <input type="hidden" name="isPublic" value="off" />
                    <button type="submit" className="rounded bg-deep-soil/10 px-2 py-1 text-[11px] font-semibold text-deep-soil">
                      Keep private
                    </button>
                  </form>
                </div>
                <Link
                  href={`/admin/owned-media/${a.id}?batch=${encodeURIComponent(batchId)}`}
                  className="text-[11px] text-civic-slate underline"
                >
                  Open detail
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
