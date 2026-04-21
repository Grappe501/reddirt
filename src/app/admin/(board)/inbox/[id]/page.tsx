import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHubKind, InboundReviewStatus } from "@prisma/client";
import {
  updateInboundDistributionAction,
  updateInboundHubMetaAction,
  updateInboundReviewAction,
} from "@/app/admin/orchestrator-actions";
import { prisma } from "@/lib/db";
import { ensurePlatformConnections } from "@/lib/orchestrator/ensure-platforms";
import { platformLabel, sourceTypeLabel } from "@/lib/orchestrator/public-feed";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };

export default async function AdminInboundDetailPage({ params, searchParams }: Props) {
  await ensurePlatformConnections();
  const { id } = await params;
  const sp = await searchParams;

  const item = await prisma.inboundContentItem.findUnique({
    where: { id },
    include: {
      syncedPost: true,
      mediaAsset: true,
      decisions: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-body text-sm">
        <Link href="/admin/inbox" className="text-red-dirt hover:underline">
          ← Inbox
        </Link>
      </p>

      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-field-green/35 bg-field-green/10 px-3 py-2 text-sm">Saved.</p>
      ) : null}
      {sp.error ? (
        <p className="mt-4 rounded-lg border border-red-dirt/35 bg-red-dirt/10 px-3 py-2 text-sm text-red-dirt">
          Could not save: {sp.error}
        </p>
      ) : null}

      <h1 className="mt-6 font-heading text-3xl font-bold text-deep-soil">{item.title ?? "(untitled)"}</h1>
      <p className="mt-2 font-body text-sm text-deep-soil/70">
        {platformLabel(item.sourcePlatform)} · {sourceTypeLabel(item.sourceType)} · {item.reviewStatus}
      </p>
      {item.canonicalUrl ? (
        <p className="mt-2">
          <a
            href={item.canonicalUrl}
            target="_blank"
            rel="noreferrer"
            className="font-body text-sm font-semibold text-washed-denim underline-offset-2 hover:underline"
          >
            Canonical URL ↗
          </a>
        </p>
      ) : null}

      {item.excerpt ? (
        <p className="mt-6 font-body text-base leading-relaxed text-deep-soil/80">{item.excerpt}</p>
      ) : null}
      {item.body ? (
        <div className="mt-6 rounded-card border border-deep-soil/10 bg-white p-5 font-body text-sm leading-relaxed text-deep-soil/75">
          {item.body.slice(0, 4000)}
          {item.body.length > 4000 ? "…" : ""}
        </div>
      ) : null}

      <section className="mt-10 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Review</h2>
        <form action={updateInboundReviewAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Status</span>
            <select
              name="reviewStatus"
              defaultValue={item.reviewStatus}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm"
            >
              {Object.values(InboundReviewStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Notes</span>
            <textarea name="notes" rows={3} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Editor</span>
            <input name="editor" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm" />
          </label>
          <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
            Save review
          </button>
        </form>
      </section>

      <section
        id="distribution"
        className="mt-10 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-heading text-lg font-bold text-deep-soil">Distribution</h2>
        <p className="mt-2 font-body text-xs text-deep-soil/60">
          Approve via review first; routing to the public site works best when status is Reviewed or Featured.
        </p>
        <form action={updateInboundDistributionAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={item.id} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="visibleOnUpdatesPage" defaultChecked={item.visibleOnUpdatesPage} />
            <code className="text-xs">/updates</code> page
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="visibleOnHomepageRail" defaultChecked={item.visibleOnHomepageRail} />
            Homepage rail
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="routeToBlog" defaultChecked={item.routeToBlog} />
            Blog landing
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="storySeed" defaultChecked={item.storySeed} />
            Story seed
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="editorialSeed" defaultChecked={item.editorialSeed} />
            Editorial seed
          </label>
          <label className="flex items-center gap-2 text-sm text-deep-soil/60">
            <input type="checkbox" name="publishCandidate" defaultChecked={item.publishCandidate} />
            Publish candidate (future)
          </label>
          <label className="md:col-span-2 block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Notes</span>
            <textarea name="notes" rows={2} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="md:col-span-2 block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Editor</span>
            <input name="editor" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-btn bg-deep-soil px-5 py-2.5 text-sm font-bold text-cream-canvas">
              Save routing
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10 rounded-card border border-deep-soil/10 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Content hub tagging</h2>
        <p className="mt-2 font-body text-xs text-deep-soil/60">
          Used for /watch rails, future filters, and inbound memory. Substack-linked rows also update the synced post
          when you save here.
        </p>
        <form action={updateInboundHubMetaAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={item.id} />
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Content kind</span>
            <select name="contentKind" defaultValue={item.contentKind ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              <option value="">— Unset —</option>
              {Object.values(ContentHubKind).map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Issue tags (comma)</span>
            <input
              name="issueTags"
              defaultValue={item.issueTags.join(", ")}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County slug</span>
              <input
                name="countySlug"
                defaultValue={item.countySlug ?? ""}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County FIPS</span>
              <input
                name="countyFips"
                defaultValue={item.countyFips ?? ""}
                className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">City</span>
              <input name="city" defaultValue={item.city ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Campaign phase</span>
            <input
              name="campaignPhase"
              defaultValue={item.campaignPhase ?? ""}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Content series (e.g. why_im_running)</span>
            <input
              name="contentSeries"
              defaultValue={item.contentSeries ?? ""}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Playlist id</span>
            <input
              name="playlistId"
              defaultValue={item.playlistId ?? ""}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Featured weight</span>
            <input
              name="featuredWeight"
              type="number"
              defaultValue={item.featuredWeight ?? ""}
              className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="siteHidden"
              defaultChecked={item.syncedPost ? item.syncedPost.hidden : item.siteHidden}
            />
            Hidden from public site
          </label>
          <button type="submit" className="rounded-btn bg-washed-denim px-5 py-2.5 text-sm font-bold text-cream-canvas">
            Save hub tags
          </button>
        </form>
      </section>

      {item.syncedPost ? (
        <section className="mt-10 rounded-card border border-deep-soil/10 bg-white p-6 text-sm shadow-[var(--shadow-soft)]">
          <h2 className="font-heading text-lg font-bold text-deep-soil">Linked Substack post</h2>
          <p className="mt-2 text-deep-soil/75">
            Slug: <code className="text-xs">{item.syncedPost.slug}</code>
          </p>
          <Link href={`/admin/blog/${item.syncedPost.slug}`} className="mt-2 inline-block text-red-dirt hover:underline">
            Edit in blog sync →
          </Link>
        </section>
      ) : null}

      {item.mediaAsset ? (
        <section className="mt-6 font-body text-sm text-deep-soil/75">
          <h2 className="font-heading text-lg font-bold text-deep-soil">Media asset</h2>
          <p className="mt-2">{item.mediaAsset.url}</p>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Decision log</h2>
        <ul className="mt-4 space-y-2 font-body text-sm text-deep-soil/80">
          {item.decisions.map((d) => (
            <li key={d.id}>
              <span className="font-semibold">{d.status}</span> → {d.destination}
              {d.notes ? ` — ${d.notes}` : ""}{" "}
              <span className="text-xs text-deep-soil/55">({d.createdAt.toLocaleString()})</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
