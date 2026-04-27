import Link from "next/link";
import {
  GeoMetadataSource,
  OwnedMediaKind,
  OwnedMediaNoteType,
  OwnedMediaReviewStatus,
  OwnedMediaRole,
  OwnedMediaSourceType,
  OwnedMediaStorageBackend,
  QuoteCandidateType,
  QuoteReviewStatus,
  TranscriptReviewStatus,
  TranscriptSource,
} from "@prisma/client";
import {
  addOwnedMediaAnnotationAction,
  addQuoteCandidateAction,
  addTranscriptAction,
  deleteOwnedMediaAnnotationAction,
  quickReviewOwnedMediaAction,
  requestTranscriptionAction,
  updateOwnedMediaAction,
  updateQuoteReviewAction,
  updateTranscriptReviewAction,
} from "@/app/admin/owned-media-actions";
import { prisma } from "@/lib/db";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

function dateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function datetimeLocalValue(d: Date | null | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminOwnedMediaDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const [asset, events, siblingIds] = await Promise.all([
    prisma.ownedMediaAsset.findUnique({
      where: { id },
      include: {
        transcripts: { orderBy: { createdAt: "desc" } },
        quoteCandidates: { orderBy: { createdAt: "desc" } },
        annotations: { orderBy: { createdAt: "asc" } },
        linkedCampaignEvent: { select: { id: true, title: true, startAt: true, slug: true } },
        mediaIngestBatch: { select: { id: true, sourceLabel: true, sourceType: true } },
      },
    }),
    prisma.campaignEvent.findMany({
      orderBy: { startAt: "desc" },
      take: 200,
      select: { id: true, title: true, startAt: true, slug: true },
    }),
    (async () => {
      const row = await prisma.ownedMediaAsset.findUnique({
        where: { id },
        select: { mediaIngestBatchId: true },
      });
      if (!row?.mediaIngestBatchId) return { prev: null as string | null, next: null as string | null, batchId: null as string | null };
      const sibs = await prisma.ownedMediaAsset.findMany({
        where: { mediaIngestBatchId: row.mediaIngestBatchId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      const i = sibs.findIndex((s) => s.id === id);
      return {
        batchId: row.mediaIngestBatchId,
        prev: i > 0 ? sibs[i - 1]!.id : null,
        next: i >= 0 && i < sibs.length - 1 ? sibs[i + 1]!.id : null,
      };
    })(),
  ]);
  if (!asset) {
    return (
      <div>
        <p>Not found.</p>
        <Link href="/admin/owned-media" className="text-kelly-slate underline">
          Back
        </Link>
      </div>
    );
  }

  const fileUrl =
    asset.publicUrl ||
    (asset.storageBackend === OwnedMediaStorageBackend.LOCAL_DISK ? getOwnedFilePublicPath(asset.id) : "#");

  const returnBatch = sp.batch ?? sp.returnBatch;
  const batchIdForNav = returnBatch ?? siblingIds.batchId ?? undefined;
  const meta = asset.metadataJson as { deviceIngestMirror?: string } | null;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin/owned-media" className="text-kelly-slate hover:underline">
            ← Campaign-owned media
          </Link>
          {batchIdForNav ? (
            <Link
              href={`/admin/owned-media/batches/${batchIdForNav}`}
              className="text-kelly-slate hover:underline"
            >
              ← Ingest batch
            </Link>
          ) : asset.mediaIngestBatch ? (
            <Link
              href={`/admin/owned-media/batches/${asset.mediaIngestBatch.id}`}
              className="text-kelly-slate hover:underline"
            >
              Open batch
            </Link>
          ) : null}
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">{asset.title}</h1>
        <p className="mt-1 font-mono text-[11px] text-kelly-text/50">{asset.id}</p>
        {sp.uploaded || sp.saved || sp.transcript || sp.quote || sp.note || sp.reviewed ? (
          <p className="mt-2 rounded-md border border-emerald-600/20 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900">Saved.</p>
        ) : null}
        {sp.error ? (
          <p className="mt-2 rounded-md border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-800">Check required fields and try again.</p>
        ) : null}
        {sp.asr === "0" ? (
          <p className="mt-2 rounded-md border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Transcription job finished without a machine transcript (stub). See error on the asset or add a human transcript below.
          </p>
        ) : null}
        {sp.asr === "1" ? (
          <p className="mt-2 rounded-md border border-emerald-600/20 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900">
            A machine transcript row was created (pending review).
          </p>
        ) : null}
        {siblingIds.batchId && (siblingIds.prev || siblingIds.next) ? (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {siblingIds.prev ? (
              <Link
                href={`/admin/owned-media/${siblingIds.prev}?batch=${encodeURIComponent(siblingIds.batchId)}`}
                className="rounded-md border border-kelly-text/20 bg-white px-3 py-1.5 font-medium text-kelly-text"
              >
                ← Previous in batch
              </Link>
            ) : null}
            {siblingIds.next ? (
              <Link
                href={`/admin/owned-media/${siblingIds.next}?batch=${encodeURIComponent(siblingIds.batchId)}`}
                className="rounded-md border border-kelly-text/20 bg-white px-3 py-1.5 font-medium text-kelly-text"
              >
                Next in batch →
              </Link>
            ) : null}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <form action={quickReviewOwnedMediaAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={asset.id} />
            {siblingIds.batchId ? <input type="hidden" name="returnBatchId" value={siblingIds.batchId} /> : null}
            {siblingIds.next ? <input type="hidden" name="nextId" value={siblingIds.next} /> : null}
            <input type="hidden" name="reviewStatus" value="APPROVED" />
            <input type="hidden" name="isPublic" value="on" />
            <button type="submit" className="rounded-md bg-emerald-800 px-3 py-1.5 text-xs font-bold text-kelly-page">
              Approve + public
            </button>
          </form>
          <form action={quickReviewOwnedMediaAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={asset.id} />
            {siblingIds.batchId ? <input type="hidden" name="returnBatchId" value={siblingIds.batchId} /> : null}
            {siblingIds.next ? <input type="hidden" name="nextId" value={siblingIds.next} /> : null}
            <input type="hidden" name="reviewStatus" value="PENDING_REVIEW" />
            <button type="submit" className="rounded-md border border-kelly-text/25 bg-white px-3 py-1.5 text-xs font-semibold text-kelly-text">
              Keep private
            </button>
          </form>
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-kelly-slate underline"
        >
          Open file
        </a>
        {asset.thumbPublicUrl ? (
          <p className="mt-1 text-xs text-kelly-text/60">
            Thumbnail:{" "}
            <a href={asset.thumbPublicUrl} className="text-kelly-slate underline" target="_blank" rel="noreferrer">
              preview
            </a>
          </p>
        ) : null}
        <div className="mt-4 rounded-md border border-kelly-text/10 bg-white/60 p-4 text-sm text-kelly-text/80">
          <h3 className="font-body text-xs font-bold uppercase tracking-wider text-kelly-text/55">Ingest &amp; storage</h3>
          <p className="mt-1 font-mono text-[11px]">storageBackend: {asset.storageBackend}</p>
          <p className="mt-0.5 break-all font-mono text-[11px]">storageKey: {asset.storageKey}</p>
          {asset.publicUrl ? (
            <p className="mt-0.5 break-all font-mono text-[11px]">publicUrl: {asset.publicUrl}</p>
          ) : null}
          {asset.localIngestRelativePath ? (
            <p className="mt-1 text-xs">Folder ingest path: {asset.localIngestRelativePath}</p>
          ) : null}
          {meta?.deviceIngestMirror ? (
            <p className="mt-1 break-all text-xs">Device mirror: {meta.deviceIngestMirror}</p>
          ) : null}
          {asset.ingestContentSha256 ? (
            <p className="mt-0.5 font-mono text-[10px]">sha256: {asset.ingestContentSha256}</p>
          ) : null}
        </div>
        <div className="mt-4 rounded-md border border-amber-200/50 bg-amber-50/40 p-4 text-sm text-kelly-text/85">
          <h3 className="font-body text-xs font-bold uppercase tracking-wider text-kelly-text/55">Geo snapshot (read-only)</h3>
          <p className="text-xs">
            <strong>needsGeoReview:</strong> {String(asset.needsGeoReview)} · <strong>source:</strong> {asset.geoSource} ·
            {asset.geoConfidence != null ? ` confidence: ${asset.geoConfidence}` : " confidence: —"}
          </p>
          <p className="text-xs text-kelly-text/65">
            Edit location fields in the form below. Check &quot;Confirm location…&quot; to mark <code className="rounded bg-amber-100/80 px-1">MANUAL</code> and
            clear the review flag for public county use. Raw extraction stays in <strong>metadata.json</strong>.
          </p>
        </div>
        {asset.uploaderName || asset.uploaderEmail || asset.consentCampaignUse != null ? (
          <div className="mt-4 rounded-md border border-kelly-text/10 p-3 text-sm">
            <h3 className="font-body text-xs font-bold uppercase tracking-wider text-kelly-text/55">Supporter (future)</h3>
            <p>
              {asset.uploaderName ?? "—"} · {asset.uploaderEmail ?? "—"} · consent: {String(asset.consentCampaignUse)}
            </p>
          </div>
        ) : null}
        {asset.metadataJson != null ? (
          <div className="mt-4">
            <h3 className="font-body text-xs font-bold uppercase tracking-wider text-kelly-text/55">metadata.json (raw)</h3>
            <pre className="mt-1 max-h-48 overflow-auto rounded border border-kelly-text/10 bg-white/80 p-2 font-mono text-[10px] text-kelly-text/80">
              {JSON.stringify(asset.metadataJson, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>

      <form action={updateOwnedMediaAction} className="space-y-4 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Metadata</h2>
        <input type="hidden" name="id" value={asset.id} />
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Title</span>
          <input name="title" required defaultValue={asset.title} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Description</span>
          <textarea name="description" rows={3} defaultValue={asset.description ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Operator notes (internal)</span>
          <textarea name="operatorNotes" rows={2} defaultValue={asset.operatorNotes ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Caption draft</span>
          <textarea name="captionDraft" rows={2} defaultValue={asset.captionDraft ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Shoot date override</span>
            <input
              name="shootDateOverride"
              type="datetime-local"
              defaultValue={datetimeLocalValue(asset.shootDateOverride)}
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Linked campaign event</span>
            <select name="linkedCampaignEventId" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" defaultValue={asset.linkedCampaignEventId ?? ""}>
              <option value="">— None —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.startAt.toLocaleDateString()} — {e.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Kind</span>
            <select name="kind" defaultValue={asset.kind} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(OwnedMediaKind).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Role</span>
            <select name="role" defaultValue={asset.role} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(OwnedMediaRole).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Event date (editorial)</span>
            <input
              name="eventDate"
              type="date"
              defaultValue={dateInputValue(asset.eventDate)}
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Captured (device/EXIF)</span>
            <input
              name="capturedAt"
              type="date"
              defaultValue={dateInputValue(asset.capturedAt)}
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Duration (sec)</span>
            <input
              name="durationSeconds"
              type="number"
              min={0}
              defaultValue={asset.durationSeconds ?? ""}
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Source type</span>
            <select name="sourceType" defaultValue={asset.sourceType} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(OwnedMediaSourceType).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">GPS latitude</span>
            <input
              name="gpsLat"
              type="text"
              inputMode="decimal"
              defaultValue={asset.gpsLat ?? ""}
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-mono text-sm"
              placeholder="e.g. 34.7465"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">GPS longitude</span>
            <input
              name="gpsLng"
              type="text"
              inputMode="decimal"
              defaultValue={asset.gpsLng ?? ""}
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-mono text-sm"
              placeholder="e.g. -92.2896"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">County slug</span>
            <input name="countySlug" defaultValue={asset.countySlug ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">FIPS</span>
            <input name="countyFips" defaultValue={asset.countyFips ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">City</span>
            <input name="city" defaultValue={asset.city ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Geo source</span>
            <select name="geoSource" defaultValue={asset.geoSource} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(GeoMetadataSource).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Geo confidence (0–1)</span>
            <input
              name="geoConfidence"
              type="text"
              inputMode="decimal"
              defaultValue={asset.geoConfidence ?? ""}
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm">
            <input name="needsGeoReview" type="checkbox" defaultChecked={asset.needsGeoReview} className="h-4 w-4" />
            <span>Needs geo review (block public location claims until cleared)</span>
          </label>
        </div>
        <div className="rounded-md border border-emerald-200/60 bg-emerald-50/50 p-3 text-sm text-kelly-text/85">
          <label className="flex items-start gap-2">
            <input name="confirmGeo" type="checkbox" className="mt-0.5 h-4 w-4" />
            <span>
              <strong>Confirm these location values for public use</strong> — sets source to <code className="rounded bg-white px-1">MANUAL</code>, clears
              &quot;needs geo review&quot; above, and records confidence 1.0 if left blank.
            </span>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Issue tags (comma)</span>
          <input name="issueTags" defaultValue={asset.issueTags.join(", ")} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Campaign phase</span>
            <input name="campaignPhase" defaultValue={asset.campaignPhase ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Content series</span>
            <input name="contentSeries" defaultValue={asset.contentSeries ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Speaker</span>
          <input name="speakerName" defaultValue={asset.speakerName ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Review</span>
            <select name="reviewStatus" defaultValue={asset.reviewStatus} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(OwnedMediaReviewStatus).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-6 flex items-center gap-2 text-sm">
            <input name="isPublic" type="checkbox" defaultChecked={asset.isPublic} className="h-4 w-4" />
            <span>Visible on public site (file route allows read when also approved in review — see API)</span>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Editor label</span>
          <input name="createdBy" defaultValue={asset.createdBy ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <p className="text-xs text-kelly-text/55">
          Storage: {asset.storageKey} · {asset.mimeType} · job {asset.transcriptJobStatus}
          {asset.transcriptionLastError ? ` — ${asset.transcriptionLastError}` : ""}
        </p>
        <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
          Save metadata
        </button>
      </form>

      <section className="rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Field notes and recall</h2>
        <p className="mt-1 text-sm text-kelly-text/70">
          Structured context for search and storytelling (separate from the public description). Searchable notes can feed assistant recall later.
        </p>
        <ul className="mt-4 space-y-4">
          {asset.annotations.map((a) => (
            <li key={a.id} className="border-t border-kelly-text/10 pt-3 first:border-0 first:pt-0">
              <p className="font-mono text-[10px] text-kelly-text/45">
                {a.noteType} · {a.isSearchable ? "searchable" : "hidden from search"}{" "}
                · {a.createdAt.toLocaleString()}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-kelly-text/90">{a.noteText}</p>
              <form action={deleteOwnedMediaAnnotationAction} className="mt-2">
                <input type="hidden" name="annotationId" value={a.id} />
                <input type="hidden" name="ownedMediaId" value={asset.id} />
                {batchIdForNav ? <input type="hidden" name="returnBatchId" value={batchIdForNav} /> : null}
                <button type="submit" className="text-xs text-red-800 underline">
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addOwnedMediaAnnotationAction} className="mt-4 space-y-2 border-t border-kelly-text/10 pt-4">
          <input type="hidden" name="ownedMediaId" value={asset.id} />
          {batchIdForNav ? <input type="hidden" name="returnBatchId" value={batchIdForNav} /> : null}
          <div className="grid gap-2 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs text-kelly-text/55">Type</span>
              <select name="noteType" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm">
                {Object.values(OwnedMediaNoteType).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input type="checkbox" name="isSearchable" defaultChecked className="h-4 w-4" />
              <span>Searchable (for recall / assistant context)</span>
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-xs text-kelly-text/55">Note</span>
            <textarea name="noteText" required rows={3} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="rounded-btn bg-kelly-navy px-4 py-2 text-sm font-bold text-kelly-page">
            Add note
          </button>
        </form>
      </section>

      <section className="rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Transcription pipeline</h2>
        <p className="mt-2 text-sm text-kelly-text/70">
          Provider: stub (fails closed until you wire an ASR in <code className="rounded bg-kelly-text/5 px-1">get-provider.ts</code>). Add human
          transcripts below; they stay separate from the original file.
        </p>
        <form action={requestTranscriptionAction} className="mt-4">
          <input type="hidden" name="id" value={asset.id} />
          <button
            type="submit"
            className="rounded-md border border-kelly-text/20 bg-white px-4 py-2 text-sm font-semibold text-kelly-text"
            disabled={!["VIDEO", "AUDIO"].includes(asset.kind) && !asset.mimeType.startsWith("video/") && !asset.mimeType.startsWith("audio/")}
          >
            Run transcript job (video/audio)
          </button>
        </form>
      </section>

      <section className="rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Transcripts</h2>
        <ul className="mt-4 space-y-4">
          {asset.transcripts.map((t) => (
            <li key={t.id} className="border-t border-kelly-text/10 pt-4 first:border-0 first:pt-0">
              <p className="font-mono text-[10px] text-kelly-text/45">{t.id}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-kelly-text/85">{t.transcriptText}</p>
              <p className="mt-1 text-xs text-kelly-text/55">
                {t.source} · {t.reviewStatus}
                {t.language ? ` · ${t.language}` : ""}
              </p>
              <form action={updateTranscriptReviewAction} className="mt-2 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="ownedMediaId" value={asset.id} />
                <label className="text-xs">
                  Set review
                  <select
                    name="reviewStatus"
                    defaultValue={t.reviewStatus}
                    className="ml-1 rounded border border-kelly-text/15 bg-white px-2 py-1 text-xs"
                  >
                    {Object.values(TranscriptReviewStatus).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="rounded bg-kelly-text/10 px-2 py-1 text-xs">
                  Update
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addTranscriptAction} className="mt-6 space-y-2 border-t border-kelly-text/10 pt-6">
          <h3 className="font-body text-sm font-bold text-kelly-text">Add transcript (human or import)</h3>
          <input type="hidden" name="ownedMediaId" value={asset.id} />
          <label className="block text-sm">
            <span className="text-xs text-kelly-text/55">Text</span>
            <textarea name="transcriptText" required rows={4} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="text-sm">
              <span className="text-xs text-kelly-text/55">Source</span>
              <select name="transcriptSource" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm">
                {Object.values(TranscriptSource).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-xs text-kelly-text/55">Language</span>
              <input name="language" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm" placeholder="en" />
            </label>
            <label className="text-sm">
              <span className="text-xs text-kelly-text/55">Review</span>
              <select name="transcriptReviewStatus" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm">
                {Object.values(TranscriptReviewStatus).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="rounded-btn bg-kelly-navy px-4 py-2 text-sm font-bold text-kelly-page">Add transcript</button>
        </form>
      </section>

      <section className="rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Quote candidates</h2>
        <ul className="mt-4 space-y-4">
          {asset.quoteCandidates.map((q) => (
            <li key={q.id} className="border-t border-kelly-text/10 pt-4 first:border-0 first:pt-0">
              <p className="font-mono text-[10px] text-kelly-text/45">{q.id}</p>
              <p className="mt-1 text-sm text-kelly-text/90">{q.quoteText}</p>
              <p className="text-xs text-kelly-text/55">
                {q.quoteType} · {q.reviewStatus}
                {q.startSeconds != null ? ` · ${q.startSeconds}s` : ""}
                {q.endSeconds != null ? `–${q.endSeconds}s` : ""}
              </p>
              <form action={updateQuoteReviewAction} className="mt-2 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={q.id} />
                <input type="hidden" name="ownedMediaId" value={asset.id} />
                <label className="text-xs">
                  Set review
                  <select
                    name="reviewStatus"
                    defaultValue={q.reviewStatus}
                    className="ml-1 rounded border border-kelly-text/15 bg-white px-2 py-1 text-xs"
                  >
                    {Object.values(QuoteReviewStatus).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="rounded bg-kelly-text/10 px-2 py-1 text-xs">
                  Update
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addQuoteCandidateAction} className="mt-6 space-y-2 border-t border-kelly-text/10 pt-6">
          <h3 className="font-body text-sm font-bold text-kelly-text">Add quote</h3>
          <input type="hidden" name="ownedMediaId" value={asset.id} />
          <label className="block text-sm">
            <span className="text-xs text-kelly-text/55">Quote</span>
            <textarea name="quoteText" required rows={2} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-kelly-text/55">Link to transcript (optional)</span>
            <select name="transcriptId" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm">
              <option value="">—</option>
              {asset.transcripts.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id.slice(0, 8)}…
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 md:grid-cols-4">
            <label className="text-sm">
              <span className="text-xs">Start s</span>
              <input name="startSeconds" type="number" step="0.1" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm" />
            </label>
            <label className="text-sm">
              <span className="text-xs">End s</span>
              <input name="endSeconds" type="number" step="0.1" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm" />
            </label>
            <label className="text-sm">
              <span className="text-xs">Type</span>
              <select name="quoteType" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm">
                {Object.values(QuoteCandidateType).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-xs">Weight</span>
              <input name="featuredWeight" type="number" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-xs">Issue tags (comma)</span>
            <input name="issueTags" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs">County slug</span>
            <input name="quoteCountySlug" className="mt-1 w-full rounded border border-kelly-text/15 bg-white px-2 py-1 text-sm" />
          </label>
          <input type="hidden" name="quoteReviewStatus" value="PENDING" />
          <button type="submit" className="rounded-btn bg-kelly-navy px-4 py-2 text-sm font-bold text-kelly-page">Add quote</button>
        </form>
      </section>
    </div>
  );
}
