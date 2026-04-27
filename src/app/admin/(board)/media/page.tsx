import Link from "next/link";
import { ContentPlatform, MediaKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createMediaAssetAction } from "@/app/admin/actions";

type Props = { searchParams: Promise<{ kind?: string; tag?: string }> };

export default async function AdminMediaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const kindFilter =
    sp.kind && Object.values(MediaKind).includes(sp.kind as MediaKind) ? (sp.kind as MediaKind) : null;
  const tagFilter = sp.tag?.trim().toLowerCase() || null;

  const allAssets = await prisma.mediaAsset.findMany({ orderBy: { updatedAt: "desc" } }).catch(() => []);
  const assets = allAssets.filter((a) => {
    if (kindFilter && a.kind !== kindFilter) return false;
    if (tagFilter && !a.tags.some((t) => t.toLowerCase().includes(tagFilter))) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Media library</h1>
      <p className="mt-3 max-w-2xl font-body text-sm text-kelly-text/75">
        URL-first registration: images and video embed URLs share one library. Filter by kind or tag; dimensions help
        layout stability when known.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 font-body text-xs">
        <span className="self-center font-semibold text-kelly-text/55">Filter:</span>
        <Link
          href="/admin/media"
          className={`rounded-full px-3 py-1 ${!kindFilter && !tagFilter ? "bg-kelly-text text-kelly-page" : "border border-kelly-text/20 text-kelly-text"}`}
        >
          All
        </Link>
        <Link
          href="/admin/media?kind=IMAGE"
          className={`rounded-full px-3 py-1 ${kindFilter === "IMAGE" ? "bg-kelly-text text-kelly-page" : "border border-kelly-text/20 text-kelly-text"}`}
        >
          Images
        </Link>
        <Link
          href="/admin/media?kind=VIDEO_EMBED"
          className={`rounded-full px-3 py-1 ${kindFilter === "VIDEO_EMBED" ? "bg-kelly-text text-kelly-page" : "border border-kelly-text/20 text-kelly-text"}`}
        >
          Video embeds
        </Link>
      </div>

      <form action={createMediaAssetAction} className="mt-8 space-y-4 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Register asset</h2>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Kind</span>
          <select name="kind" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
            <option value="IMAGE">Image URL</option>
            <option value="VIDEO_EMBED">Video embed URL (YouTube/Vimeo page URL or iframe src)</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">URL</span>
          <input name="url" required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-mono text-sm" placeholder="https://..." />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Width (px, optional)</span>
            <input name="width" type="number" min={1} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Height (px, optional)</span>
            <input name="height" type="number" min={1} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Alt text</span>
            <input name="alt" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Tags (comma-separated)</span>
            <input name="tags" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" placeholder="homepage, hero, story" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Caption</span>
          <textarea name="caption" rows={2} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Usage notes</span>
          <textarea name="usageNotes" rows={2} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">
              Origin platform (connector lineage)
            </span>
            <select
              name="originPlatform"
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
            >
              <option value="">— none —</option>
              {Object.values(ContentPlatform).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">
              External id (e.g. video id)
            </span>
            <input
              name="originExternalId"
              className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-mono text-sm"
              placeholder="youtube:video:…"
            />
          </label>
        </div>
        <p className="font-body text-xs text-kelly-text/55">
          Tag filter in URL: <code className="rounded bg-kelly-text/5 px-1">/admin/media?tag=hero</code> (substring match).
        </p>
        <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
          Add to library
        </button>
      </form>

      <div className="mt-12">
        <h2 className="font-heading text-xl font-bold text-kelly-text">
          Library ({assets.length}
          {kindFilter || tagFilter ? ` of ${allAssets.length}` : ""})
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {assets.map((a) => (
            <article key={a.id} className="overflow-hidden rounded-card border border-kelly-text/10 bg-kelly-page shadow-[var(--shadow-soft)]">
              {a.kind === "VIDEO_EMBED" ? (
                <div className="flex aspect-video w-full items-center justify-center bg-kelly-text/15 px-4">
                  <p className="text-center font-body text-sm font-semibold text-kelly-text/70">Video embed</p>
                </div>
              ) : (
                <div className="aspect-video w-full overflow-hidden bg-kelly-text/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.alt ?? ""} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="space-y-2 p-4">
                <p className="font-mono text-[10px] text-kelly-text/50">
                  {a.id} · {a.kind}
                  {a.width && a.height ? ` · ${a.width}×${a.height}` : ""}
                </p>
                <p className="break-all font-body text-xs text-kelly-text/80">{a.url}</p>
                {a.alt ? <p className="font-body text-sm text-kelly-text/70">Alt: {a.alt}</p> : null}
                {a.caption ? <p className="font-body text-sm text-kelly-text/70">Caption: {a.caption}</p> : null}
                {a.tags.length ? (
                  <p className="font-body text-xs text-kelly-text/55">Tags: {a.tags.join(", ")}</p>
                ) : null}
                {a.originPlatform || a.originExternalId ? (
                  <p className="font-body text-xs text-kelly-slate">
                    Origin: {a.originPlatform ?? "—"}
                    {a.originExternalId ? ` · ${a.originExternalId}` : ""}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {assets.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-kelly-text/20 bg-white/50 p-6 text-center text-sm text-kelly-text/60">
            No assets match this filter. Register a URL or clear filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}

