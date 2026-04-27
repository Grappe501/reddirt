import { notFound } from "next/navigation";
import { PageHeroEditor } from "@/components/admin/page-hero/PageHeroEditor";
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
      <h1 className="font-heading text-2xl font-bold capitalize text-kelly-text">{pageKey.replace(/-/g, " ")}</h1>
      <p className="mt-2 font-body text-sm text-kelly-text/70">
        Hero text only (database) · public path: <span className="font-mono">/{pageKey}</span>
      </p>
      <p className="mt-1 font-body text-xs text-kelly-text/60">
        Final authority for what goes live: Kelly. Staff can help you find this screen; nothing here auto-pulls from Ask Kelly feedback.
      </p>

      <div className="mt-4 rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-3 py-2.5 text-xs text-kelly-text/85">
        <p className="font-semibold text-kelly-navy/90">If you’re looking for something else</p>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 pl-0.5">
          <li>
            All page hero editors → <span className="font-mono">/admin/pages</span>
          </li>
          <li>
            Ask Kelly beta feedback (triage) → <span className="font-mono">/admin/workbench/ask-kelly-beta</span>
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <PageHeroEditor pageKey={pageKey} initial={hero} showSaved={sp.saved === "1"} />
      </div>
    </div>
  );
}
