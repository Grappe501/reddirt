import { ContentCollection } from "@prisma/client";
import { allEditorial } from "@/content/editorial";
import { prisma } from "@/lib/db";
import { clearContentOverrideAction, saveContentOverrideAction } from "@/app/admin/actions";

export default async function AdminEditorialPage() {
  const [overrides, media] = await Promise.all([
    prisma.contentItemOverride
      .findMany({ where: { collection: ContentCollection.EDITORIAL }, include: { heroMedia: true } })
      .catch(() => []),
    prisma.mediaAsset.findMany({ orderBy: { updatedAt: "desc" } }).catch(() => []),
  ]);
  const map = new Map(overrides.map((o) => [o.slug, o]));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Editorial overrides</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Essays remain authored in static content files. Overrides handle visibility, featuring, teasers, and hero
        imagery registration.
      </p>

      <ul className="mt-10 space-y-4">
        {allEditorial.map((piece) => {
          const o = map.get(piece.slug);
          return (
            <li key={piece.slug} className="rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)]">
              <p className="font-heading text-lg font-bold text-deep-soil">{piece.title}</p>
              <p className="mt-1 font-mono text-xs text-deep-soil/55">{piece.slug}</p>
              <details className="mt-4">
                <summary className="cursor-pointer font-body text-sm font-semibold text-red-dirt">Edit overrides</summary>
                <form action={saveContentOverrideAction} className="mt-4 space-y-3 border-t border-deep-soil/10 pt-4">
                  <input type="hidden" name="collection" value={ContentCollection.EDITORIAL} />
                  <input type="hidden" name="slug" value={piece.slug} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="hidden" defaultChecked={o?.hidden} className="h-4 w-4 rounded border-deep-soil/30" />
                    Hidden
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="featured" defaultChecked={o?.featured ?? piece.featured} className="h-4 w-4 rounded border-deep-soil/30" />
                    Featured
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Teaser</span>
                    <textarea name="teaserOverride" rows={2} defaultValue={o?.teaserOverride ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Summary override</span>
                    <textarea name="summaryOverride" rows={2} defaultValue={o?.summaryOverride ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
                  </label>
                  <label className="block text-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Hero media</span>
                    <select name="heroMediaId" defaultValue={o?.heroMediaId ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
                      <option value="">— Default —</option>
                      {media.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.alt || m.url.slice(0, 48)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="rounded-btn bg-red-dirt px-4 py-2 text-xs font-bold text-cream-canvas">
                    Save
                  </button>
                </form>
                {o ? (
                  <form action={clearContentOverrideAction} className="mt-3">
                    <input type="hidden" name="collection" value={ContentCollection.EDITORIAL} />
                    <input type="hidden" name="slug" value={piece.slug} />
                    <button type="submit" className="text-xs font-semibold text-deep-soil/55 underline">
                      Clear override
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
