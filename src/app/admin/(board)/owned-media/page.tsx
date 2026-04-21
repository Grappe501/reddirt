import Link from "next/link";
import {
  OwnedMediaKind,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
  OwnedMediaStorageBackend,
  TranscriptionJobStatus,
} from "@prisma/client";
import {
  bulkUpdateOwnedMediaByIdsAction,
  bulkUpdateOwnedMediaByIngestBatchAction,
  uploadOwnedMediaAction,
} from "@/app/admin/owned-media-actions";
import { prisma } from "@/lib/db";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";

type Props = {
  searchParams: Promise<{
    kind?: string;
    status?: string;
    county?: string;
    error?: string;
  }>;
};

export default async function AdminOwnedMediaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const kindFilter =
    sp.kind && Object.values(OwnedMediaKind).includes(sp.kind as OwnedMediaKind)
      ? (sp.kind as OwnedMediaKind)
      : null;
  const statusFilter =
    sp.status && Object.values(OwnedMediaReviewStatus).includes(sp.status as OwnedMediaReviewStatus)
      ? (sp.status as OwnedMediaReviewStatus)
      : null;
  const countyFilter = sp.county?.trim() || null;

  const [all, batches] = await Promise.all([
    prisma.ownedMediaAsset
      .findMany({
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { transcripts: true, quoteCandidates: true } } },
      })
      .catch(() => []),
    prisma.mediaIngestBatch.findMany({ orderBy: { createdAt: "desc" }, take: 30 }).catch(() => []),
  ]);

  const assets = all.filter((a) => {
    if (kindFilter && a.kind !== kindFilter) return false;
    if (statusFilter && a.reviewStatus !== statusFilter) return false;
    if (countyFilter && (a.countySlug ?? "") !== countyFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Campaign-owned media</h1>
      <p className="mt-3 max-w-2xl font-body text-sm text-deep-soil/75">
        Uploads are stored on disk (see <code className="rounded bg-deep-soil/5 px-1">data/owned-campaign-media</code> by
        default) with metadata in Postgres. This is the memory layer for photos, A/V, speeches, and transcripts — not
        the URL-first <Link href="/admin/media">media register</Link>.{" "}
        <Link href="/admin/owned-media/batches" className="text-washed-denim underline">
          Ingest batch history
        </Link>{" "}
        (folder and device runs).
      </p>

      {sp.error === "upload" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          Choose a file to upload.
        </p>
      ) : sp.error === "date" ? (
        <p className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-800">
          Invalid event date.
        </p>
      ) : null}

      <form action={uploadOwnedMediaAction} className="mt-8 space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]" encType="multipart/form-data">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Upload</h2>
        <p className="text-xs text-deep-soil/60">Max size defaults to 500MB (override with OWNED_MEDIA_MAX_BYTES).</p>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">File</span>
          <input
            name="file"
            type="file"
            required
            className="mt-1 w-full text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
          <input name="title" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" placeholder="Optional — defaults to filename" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Kind</span>
            <select name="kind" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(OwnedMediaKind).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Role</span>
            <select name="role" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(OwnedMediaRole).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Description</span>
          <textarea name="description" rows={2} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Event date</span>
            <input name="eventDate" type="date" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County slug</span>
            <input name="countySlug" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" placeholder="e.g. pulaski" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">FIPS</span>
            <input name="countyFips" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" placeholder="05051" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">City</span>
            <input name="city" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Speaker</span>
            <input name="speakerName" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Issue tags (comma)</span>
            <input name="issueTags" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" placeholder="labor, education" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Source type</span>
            <select name="sourceType" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(OwnedMediaSourceType).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Campaign phase</span>
            <input name="campaignPhase" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Content series</span>
            <input name="contentSeries" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Editor / uploader (label)</span>
          <input name="createdBy" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" placeholder="Free text; no user accounts in this app yet" />
        </label>
        <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
          Upload and save
        </button>
      </form>

      <div className="mt-10 grid gap-6 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 md:grid-cols-2">
        <form action={bulkUpdateOwnedMediaByIngestBatchAction} className="space-y-3 text-sm">
          <h2 className="font-heading text-base font-bold text-deep-soil">Bulk: by ingest batch</h2>
          <p className="text-xs text-deep-soil/60">
            Updates every asset that shares a folder / device `MediaIngestBatch` (from `npm run ingest:folder`). Finance rows
            should stay private until reviewed.
          </p>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Batch</span>
            <select name="mediaIngestBatchId" required className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              <option value="">— choose batch —</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.sourceLabel} · {b.startedAt.toLocaleString()} · {b.importedCount} new
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Review status</span>
            <select name="reviewStatus" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" defaultValue="APPROVED">
              {Object.values(OwnedMediaReviewStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublic" value="true" className="rounded border-deep-soil/25" />
            Public on site (record room / downloads)
          </label>
          <button type="submit" className="rounded-btn border border-deep-soil/20 bg-white px-4 py-2 text-sm font-semibold text-deep-soil">
            Apply to whole batch
          </button>
        </form>
        <form action={bulkUpdateOwnedMediaByIdsAction} className="space-y-3 text-sm">
          <h2 className="font-heading text-base font-bold text-deep-soil">Bulk: by asset IDs</h2>
          <p className="text-xs text-deep-soil/60">One ID per line or comma-separated (from the list below).</p>
          <textarea
            name="ids"
            rows={5}
            required
            placeholder="cuid…"
            className="w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-xs"
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Review status</span>
            <select name="reviewStatus" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" defaultValue="APPROVED">
              {Object.values(OwnedMediaReviewStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublic" value="true" className="rounded border-deep-soil/25" />
            Public on site
          </label>
          <button type="submit" className="rounded-btn border border-deep-soil/20 bg-white px-4 py-2 text-sm font-semibold text-deep-soil">
            Apply to listed IDs
          </button>
        </form>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-deep-soil/55">Filters</span>
        <Link
          href="/admin/owned-media"
          className={`rounded-full px-3 py-1 ${!kindFilter && !statusFilter && !countyFilter ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 text-deep-soil"}`}
        >
          All
        </Link>
        {(["IMAGE", "VIDEO", "AUDIO"] as const).map((k) => (
          <Link
            key={k}
            href={`/admin/owned-media?kind=${k}`}
            className={`rounded-full px-3 py-1 ${kindFilter === k ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 text-deep-soil"}`}
          >
            {k}
          </Link>
        ))}
        <Link
          href="/admin/owned-media?status=PENDING_REVIEW"
          className={`rounded-full px-3 py-1 ${statusFilter === "PENDING_REVIEW" ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 text-deep-soil"}`}
        >
          Needs review
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-xl font-bold text-deep-soil">Library ({assets.length})</h2>
        <ul className="mt-4 space-y-3">
          {assets.map((a) => {
            const hrefFile =
              a.publicUrl ||
              (a.storageBackend === OwnedMediaStorageBackend.LOCAL_DISK ? getOwnedFilePublicPath(a.id) : "/admin/owned-media/" + a.id);
            return (
              <li key={a.id} className="rounded-lg border border-deep-soil/10 bg-white/80 px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/admin/owned-media/${a.id}`} className="font-heading text-base font-semibold text-washed-denim hover:underline">
                    {a.title}
                  </Link>
                  <span className="font-mono text-[10px] text-deep-soil/45">{a.id}</span>
                </div>
                <p className="mt-1 font-body text-xs text-deep-soil/65">
                  {a.kind} · {a.role} · {a.reviewStatus}
                  {a.transcriptJobStatus && a.transcriptJobStatus !== TranscriptionJobStatus.NOT_REQUESTED
                    ? ` · ASR: ${a.transcriptJobStatus}`
                    : ""}
                </p>
                <p className="mt-1 font-mono text-[11px] text-deep-soil/55">
                  T: {a._count.transcripts} · Quotes: {a._count.quoteCandidates} · {a.fileSizeBytes} bytes · {a.storageKey}
                </p>
                <a href={hrefFile} className="mt-1 inline-block text-xs text-washed-denim underline" target="_blank" rel="noreferrer">
                  Open file (admin or public-approved)
                </a>
              </li>
            );
          })}
        </ul>
        {assets.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-deep-soil/20 p-6 text-center text-sm text-deep-soil/60">
            No campaign-owned assets yet. Upload a file to create the first row.
          </p>
        ) : null}
      </div>
    </div>
  );
}
