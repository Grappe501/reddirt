import { ContentCollection } from "@prisma/client";
import { allStories } from "@/content/stories";
import { prisma } from "@/lib/db";
import { clearContentOverrideAction, saveContentOverrideAction } from "@/app/admin/actions";

export default async function AdminStoriesPage() {
  const [overrides, media] = await Promise.all([
    prisma.contentItemOverride
      .findMany({ where: { collection: ContentCollection.STORY }, include: { heroMedia: true } })
      .catch(() => []),
    prisma.mediaAsset.findMany({ orderBy: { updatedAt: "desc" } }).catch(() => []),
  ]);
  const map = new Map(overrides.map((o) => [o.slug, o]));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Stories · visibility & teasers</h1>
      <p className="mt-3 font-body text-sm text-kelly-text/75">
        Static long-form copy stays in the codebase. Use overrides to hide a story from the public site, feature it,
        adjust the summary/teaser, or point hero imagery at a media library asset.
      </p>

      <ul className="mt-10 space-y-4">
        {allStories.map((story) => {
          const o = map.get(story.slug);
          return (
            <li key={story.slug} className="rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
              <p className="font-heading text-lg font-bold text-kelly-text">{story.title}</p>
              <p className="mt-1 font-mono text-xs text-kelly-text/55">{story.slug}</p>
              <details className="mt-4">
                <summary className="cursor-pointer font-body text-sm font-semibold text-kelly-navy">Edit overrides</summary>
                <form action={saveContentOverrideAction} className="mt-4 space-y-3 border-t border-kelly-text/10 pt-4">
                  <input type="hidden" name="collection" value={ContentCollection.STORY} />
                  <input type="hidden" name="slug" value={story.slug} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="hidden" defaultChecked={o?.hidden} className="h-4 w-4 rounded border-kelly-text/30" />
                    Hidden on public site
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="featured" defaultChecked={o?.featured ?? story.featured} className="h-4 w-4 rounded border-kelly-text/30" />
                    Featured flag (merged with static)
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Teaser override</span>
                    <textarea
                      name="teaserOverride"
                      rows={2}
                      defaultValue={o?.teaserOverride ?? ""}
                      placeholder="Optional shorter teaser for cards"
                      className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Summary override</span>
                    <textarea
                      name="summaryOverride"
                      rows={2}
                      defaultValue={o?.summaryOverride ?? ""}
                      placeholder="Replaces summary when set"
                      className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Hero media</span>
                    <select name="heroMediaId" defaultValue={o?.heroMediaId ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
                      <option value="">— Default story art —</option>
                      {media.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.alt || m.url.slice(0, 48)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="rounded-btn bg-kelly-navy px-4 py-2 text-xs font-bold text-kelly-page">
                    Save override
                  </button>
                </form>
                {o ? (
                  <form action={clearContentOverrideAction} className="mt-3">
                    <input type="hidden" name="collection" value={ContentCollection.STORY} />
                    <input type="hidden" name="slug" value={story.slug} />
                    <button type="submit" className="text-xs font-semibold text-kelly-text/55 underline">
                      Clear override row
                    </button>
                  </form>
                ) : null}
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
