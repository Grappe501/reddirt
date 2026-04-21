import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogDisplayMode, ContentHubKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { saveSyncedPostAction } from "@/app/admin/actions";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string }> };

export default async function AdminBlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const [post, media] = await Promise.all([
    prisma.syncedPost.findUnique({ where: { slug } }).catch(() => null),
    prisma.mediaAsset.findMany({ orderBy: { updatedAt: "desc" } }).catch(() => []),
  ]);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/blog" className="font-body text-sm font-semibold text-red-dirt">
        ← All posts
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-bold text-deep-soil">{post.title}</h1>
      <p className="mt-2 break-all font-mono text-xs text-deep-soil/55">{post.canonicalUrl}</p>
      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-field-green/35 bg-field-green/10 px-3 py-2 text-sm">Saved.</p>
      ) : null}

      <form action={saveSyncedPostAction} className="mt-8 space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
        <input type="hidden" name="slug" value={post.slug} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={post.featured} className="h-4 w-4 rounded border-deep-soil/30" />
          Featured in admin lists / future rails
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="hidden" defaultChecked={post.hidden} className="h-4 w-4 rounded border-deep-soil/30" />
          Hidden on public site
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showOnHomepage" defaultChecked={post.showOnHomepage} className="h-4 w-4 rounded border-deep-soil/30" />
          Eligible for homepage notebook rail
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showOnBlogLanding" defaultChecked={post.showOnBlogLanding} className="h-4 w-4 rounded border-deep-soil/30" />
          Show on /blog index
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featuredRoadPreview" defaultChecked={post.featuredRoadPreview} className="h-4 w-4 rounded border-deep-soil/30" />
          Pin for homepage “From the Road” preview
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Content hub kind</span>
          <select name="contentKind" defaultValue={post.contentKind ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
            <option value="">— Default (story) —</option>
            {Object.values(ContentHubKind).map((k) => (
              <option key={k} value={k}>
                {k.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Issue tags (comma)</span>
          <input name="issueTags" defaultValue={post.issueTags.join(", ")} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County slug</span>
            <input name="countySlug" defaultValue={post.countySlug ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County FIPS (optional)</span>
            <input name="countyFips" defaultValue={post.countyFips ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">City</span>
            <input name="city" defaultValue={post.city ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Campaign phase (optional)</span>
          <input name="campaignPhase" defaultValue={post.campaignPhase ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Content series slug (e.g. on_the_road)</span>
          <input name="contentSeries" defaultValue={post.contentSeries ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Playlist id (optional)</span>
          <input name="playlistId" defaultValue={post.playlistId ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 font-mono text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Display priority / featured weight</span>
          <input name="featuredWeight" type="number" defaultValue={post.featuredWeight ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Display mode</span>
          <select name="displayMode" defaultValue={post.displayMode} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
            {Object.values(BlogDisplayMode).map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Teaser override</span>
          <textarea name="teaserOverride" rows={3} defaultValue={post.teaserOverride ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Local categories (comma)</span>
          <input name="localCategories" defaultValue={post.localCategories.join(", ")} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Local tags (comma)</span>
          <input name="localTags" defaultValue={post.localTags.join(", ")} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Hero media override</span>
          <select name="heroMediaId" defaultValue={post.heroMediaId ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
            <option value="">— Use RSS / default image —</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.alt || m.url.slice(0, 48)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
          Save post controls
        </button>
      </form>
    </div>
  );
}
