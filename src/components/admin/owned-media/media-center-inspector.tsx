import Link from "next/link";
import { socialEnumLabel } from "@/lib/social/enum-labels";
import { ownedMediaPreviewUrl } from "@/lib/media-library/public-urls";
import type { MediaLibraryInspectDetail } from "@/lib/media-library/dto";
import { MediaCenterWorkbenchAttach } from "@/components/admin/owned-media/media-center-workbench-attach";
import {
  addOwnedMediaToCollectionAction,
  setMediaCenterReviewedAction,
  updateMediaCenterTriageAction,
} from "@/app/admin/owned-media-actions";

type Col = { id: string; name: string; isSmart: boolean };

type Props = {
  asset: MediaLibraryInspectDetail | null;
  missing?: boolean;
  /** For collection membership control */
  collections: Col[];
};

/**
 * Right rail: Lightroom-style triage, governance, and workbench handoff. No raw `storageKey` in the DOM.
 */
export function MediaCenterInspector({ asset, missing, collections }: Props) {
  if (missing) {
    return (
      <aside className="hidden w-80 shrink-0 border-l border-kelly-text/10 bg-amber-50/40 p-3 text-sm text-amber-900 xl:block">
        <p>That asset was not found (wrong id or deleted).</p>
      </aside>
    );
  }
  if (!asset) {
    return (
      <aside className="hidden w-80 shrink-0 border-l border-kelly-text/10 bg-white/60 p-3 text-sm text-kelly-text/60 xl:block">
        <p className="font-body text-sm">Select an asset in the grid to triage, approve, and attach to social work items.</p>
        <p className="mt-2 text-xs text-kelly-text/45">TODO: smart collection rule preview (filter JSON) · full-text transcript search in library · server-side derivative rendering.</p>
        <p className="mt-2 text-xs">Author Studio and drawers reuse the same `MediaLibraryListItem` + preview URLs.</p>
      </aside>
    );
  }

  return (
    <aside className="hidden w-96 max-w-[100vw] shrink-0 border-l border-kelly-text/10 bg-white/95 p-3 shadow-sm xl:block">
      <div className="mb-2 aspect-video w-full overflow-hidden rounded-lg bg-kelly-text/5">
        {asset.kind === "IMAGE" ? (
          <img
            src={ownedMediaPreviewUrl(asset.id)}
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-kelly-text/50">{socialEnumLabel(asset.kind)}</div>
        )}
      </div>
      <h3 className="font-heading text-base font-bold leading-snug text-kelly-text">{asset.title}</h3>
      <p className="mt-0.5 font-mono text-[10px] text-kelly-text/55 break-all">{asset.fileName}</p>
      {asset.canonicalFileName && asset.canonicalFileName !== asset.fileName ? (
        <p className="mt-0.5 font-mono text-[9px] text-kelly-text/45 break-all">
          <span className="font-semibold">Canonical:</span> {asset.canonicalFileName}
        </p>
      ) : null}
      {asset.originalFileName && asset.originalFileName !== asset.fileName ? (
        <p className="mt-0.5 text-[10px] text-kelly-text/45">
          <span className="font-semibold">Original name:</span> {asset.originalFileName}
        </p>
      ) : null}
      {asset.reviewedAt ? (
        <p className="mt-1 text-[10px] text-emerald-800">Reviewed {new Date(asset.reviewedAt).toLocaleString()}</p>
      ) : (
        <p className="mt-1 text-[10px] text-kelly-text/45">Not marked reviewed in Media Center</p>
      )}

      <form action={setMediaCenterReviewedAction} className="mt-2">
        <input type="hidden" name="ownedMediaId" value={asset.id} />
        <input type="hidden" name="markReviewed" value={asset.reviewedAt ? "0" : "1"} />
        <button
          type="submit"
          className="w-full rounded-md border border-kelly-text/20 bg-kelly-page px-2 py-1 text-xs font-semibold text-kelly-text"
        >
          {asset.reviewedAt ? "Clear reviewed" : "Mark reviewed"}
        </button>
      </form>

      <form action={updateMediaCenterTriageAction} className="mt-3 space-y-2 border-t border-kelly-text/10 pt-3">
        <input type="hidden" name="ownedMediaId" value={asset.id} />
        <h4 className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Triage</h4>
        <label className="block text-[10px] text-kelly-text/70">
          Rating
          <select
            name="rating"
            defaultValue={asset.rating != null ? String(asset.rating) : ""}
            className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1 py-1 text-xs"
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] text-kelly-text/70">
          Pick
          <select
            name="pickStatus"
            defaultValue={asset.pickStatus}
            className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1 py-1 text-xs"
          >
            {(["UNRATED", "PICK", "REJECT"] as const).map((p) => (
              <option key={p} value={p}>
                {socialEnumLabel(p)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] text-kelly-text/70">
          Color
          <select
            name="colorLabel"
            defaultValue={asset.colorLabel}
            className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1 py-1 text-xs"
          >
            {(["NONE", "RED", "YELLOW", "GREEN", "BLUE", "PURPLE"] as const).map((c) => (
              <option key={c} value={c}>
                {c === "NONE" ? "—" : socialEnumLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[10px] text-kelly-text/80">
          <input type="checkbox" name="isFavorite" value="on" defaultChecked={asset.isFavorite} />
          Favorite
        </label>
        <div className="space-y-1.5 text-[10px]">
          <span className="block font-bold uppercase tracking-wider text-kelly-text/50">Approvals</span>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="approvedForSocial" value="on" defaultChecked={asset.approvedForSocial} />
            Social (workbench)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="approvedForPress" value="on" defaultChecked={asset.approvedForPress} />
            Press
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="approvedForPublicSite" value="on" defaultChecked={asset.approvedForPublicSite} />
            Public site
          </label>
        </div>
        <label className="block text-[10px] text-kelly-text/70">
          Review note
          <textarea
            name="reviewNotes"
            defaultValue={asset.reviewNotes ?? ""}
            rows={2}
            className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1.5 py-1 text-xs"
            placeholder="Short triage / handoff"
          />
        </label>
        <label className="block text-[10px] text-kelly-text/70">
          Staff review notes
          <textarea
            name="staffReviewNotes"
            defaultValue={asset.staffReviewNotes ?? ""}
            rows={3}
            className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1.5 py-1 text-xs"
            placeholder="Internal DAM / comms notes"
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-kelly-text py-1.5 text-xs font-semibold text-kelly-page">
          Save triage
        </button>
      </form>

      {collections.filter((c) => !c.isSmart).length > 0 ? (
        <form action={addOwnedMediaToCollectionAction} className="mt-3 border-t border-kelly-text/10 pt-3">
          <input type="hidden" name="ownedMediaId" value={asset.id} />
          <h4 className="mb-1 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Add to collection</h4>
          <div className="flex gap-1">
            <select name="collectionId" className="min-w-0 flex-1 rounded border border-kelly-text/15 bg-white px-1 py-1 text-xs" required>
              <option value="">Select…</option>
              {collections
                .filter((c) => !c.isSmart)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <button type="submit" className="shrink-0 rounded border border-kelly-text/20 bg-kelly-page px-2 text-xs font-semibold">
              Add
            </button>
          </div>
          {collections.some((c) => c.isSmart) ? (
            <p className="mt-1 text-[9px] text-kelly-text/45">TODO: smart collections (evaluate `filterJson` here).</p>
          ) : null}
        </form>
      ) : null}

      <dl className="mt-3 space-y-1 border-t border-kelly-text/10 pt-3 font-body text-xs text-kelly-text/80">
        {asset.parentAssetId ? (
          <div className="flex justify-between gap-2">
            <dt className="text-kelly-text/50">Parent</dt>
            <dd className="max-w-[12rem] truncate font-mono text-[10px]">
              <Link href={`/admin/owned-media/grid?inspect=${encodeURIComponent(asset.parentAssetId)}`} className="text-kelly-slate underline">
                {asset.parentAssetId}
              </Link>
            </dd>
          </div>
        ) : null}
        {asset.rootAssetId && asset.rootAssetId !== asset.id ? (
          <div className="flex justify-between gap-2">
            <dt className="text-kelly-text/50">Root</dt>
            <dd className="max-w-[12rem] truncate font-mono text-[10px]">
              <Link href={`/admin/owned-media/grid?inspect=${encodeURIComponent(asset.rootAssetId)}`} className="text-kelly-slate underline">
                {asset.rootAssetId}
              </Link>
            </dd>
          </div>
        ) : null}
        {asset.mediaIngestBatchId ? (
          <div className="flex justify-between gap-2">
            <dt className="text-kelly-text/50">Import batch</dt>
            <dd className="text-right text-[10px]">
              <Link href={`/admin/owned-media/batches/${asset.mediaIngestBatchId}`} className="text-kelly-slate underline break-all">
                {asset.mediaIngestBatchId.slice(0, 8)}…
              </Link>
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <dt className="text-kelly-text/50">Kind</dt>
          <dd>{socialEnumLabel(asset.kind)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-kelly-text/50">Source</dt>
          <dd>{socialEnumLabel(asset.sourceType)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-kelly-text/50">Derivative</dt>
          <dd>{socialEnumLabel(asset.derivativeType)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-kelly-text/50">Transcript</dt>
          <dd>{asset.hasTranscript ? "Yes" : "No"}</dd>
        </div>
        {asset.countyLabel ? (
          <div className="flex justify-between gap-2">
            <dt className="text-kelly-text/50">County</dt>
            <dd>{asset.countyLabel}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3 border-t border-kelly-text/10 pt-3">
        <h4 className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Derivative jobs</h4>
        {asset.derivativeJobs.length === 0 ? (
          <p className="mt-1 text-[10px] text-kelly-text/50">
            No queued jobs for this source asset. Workers will create rows here when rendering proxies and crops.
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1.5">
            {asset.derivativeJobs.map((job) => (
              <li
                key={job.id}
                className="rounded-md border border-kelly-text/10 bg-kelly-text/[0.02] px-2 py-1.5 text-[10px] text-kelly-text/85"
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-mono font-semibold">{socialEnumLabel(job.targetDerivativeType)}</span>
                  <span className="rounded bg-kelly-text/10 px-1 font-mono text-[9px] uppercase">{job.status}</span>
                </div>
                <div className="mt-0.5 text-[9px] text-kelly-text/55">
                  Updated {new Date(job.updatedAt).toLocaleString()}
                  {job.startedAt ? ` · Started ${new Date(job.startedAt).toLocaleString()}` : ""}
                  {job.finishedAt ? ` · Finished ${new Date(job.finishedAt).toLocaleString()}` : ""}
                </div>
                {job.lastError ? (
                  <p className="mt-1 text-[9px] text-red-800/90" title={job.lastError}>
                    {job.lastError.slice(0, 120)}
                    {job.lastError.length > 120 ? "…" : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[9px] text-kelly-text/45">
          When jobs finish, child rows link back via parent asset id and derivative type on the asset record.
        </p>
      </div>

      <MediaCenterWorkbenchAttach
        ownedMediaId={asset.id}
        approvedForSocial={asset.approvedForSocial}
        collections={collections.map((c) => ({ id: c.id, name: c.name }))}
      />

      <div className="mt-3 border-t border-kelly-text/10 pt-3">
        <Link
          href={`/admin/owned-media/${asset.id}`}
          className="inline-flex rounded-lg bg-kelly-text px-3 py-1.5 text-xs font-semibold text-kelly-page"
        >
          Open full detail
        </Link>
      </div>
    </aside>
  );
}
