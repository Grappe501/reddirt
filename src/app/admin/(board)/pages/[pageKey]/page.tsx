import { notFound } from "next/navigation";
import { savePageHeroAction } from "@/app/admin/actions";
import { getPageBlockPayload, parsePageKey, type HeroBlockPayload } from "@/lib/content/page-blocks";

type Props = { params: Promise<{ pageKey: string }>; searchParams: Promise<{ saved?: string }> };

export default async function AdminPageKeyEditorPage({ params, searchParams }: Props) {
  const { pageKey: raw } = await params;
  const sp = await searchParams;
  const pageKey = parsePageKey(raw);
  if (!pageKey) notFound();

  const hero = await getPageBlockPayload<HeroBlockPayload>(pageKey, "hero");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-2xl font-bold capitalize text-deep-soil">{pageKey.replace(/-/g, " ")}</h1>
      <p className="mt-2 font-body text-sm text-deep-soil/70">Hero block only · public path: /{pageKey}</p>
      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-field-green/35 bg-field-green/10 px-3 py-2 text-sm">Saved.</p>
      ) : null}

      <form action={savePageHeroAction} className="mt-8 space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
        <input type="hidden" name="pageKey" value={pageKey} />
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Eyebrow</span>
          <input
            name="eyebrow"
            defaultValue={hero?.eyebrow ?? ""}
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
          <input
            name="title"
            defaultValue={hero?.title ?? ""}
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Subtitle</span>
          <textarea
            name="subtitle"
            rows={4}
            defaultValue={hero?.subtitle ?? ""}
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
          Save hero
        </button>
      </form>
    </div>
  );
}
