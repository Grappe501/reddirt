import Link from "next/link";
import { redirect } from "next/navigation";
import { enableSiteEditModeAction } from "@/app/admin/site-edit-actions";
import { canUseSiteEditMode, isSiteEditMode } from "@/lib/site-edit/edit-mode";
import { PUBLIC_EDIT_PAGE_LINKS } from "@/lib/site-edit/public-edit-pages";

/**
 * Website edit hub — enables edit cookie, then lets operators open any public page.
 * Basic: copy + media slots. Full website workbench later.
 */
export default async function SiteEditEntryPage() {
  if (!(await canUseSiteEditMode())) {
    redirect("/admin/login?next=%2Fedit");
  }

  const editing = await isSiteEditMode();
  let enableError: string | null = null;
  if (!editing) {
    const res = await enableSiteEditModeAction();
    if (res.ok) {
      redirect("/edit");
    }
    enableError = res.message;
  }

  return (
    <div className="bg-kelly-cream pb-16 pt-8 text-[#12124a]">
      <div className="mx-auto max-w-4xl px-4">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Website edit mode
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[#000066]">
          Edit the public site
        </h1>
        {enableError ? (
          <p className="mt-3 max-w-2xl rounded-md border-2 border-red-700/40 bg-red-50 px-3 py-2 font-body text-sm text-red-900">
            Could not enable edit mode: {enableError}
          </p>
        ) : (
          <p className="mt-3 max-w-2xl font-body text-sm text-[#364272]">
            You are in edit mode across the whole public site. Open any page below — outlined copy is
            editable; media slots show <strong>Change media</strong> (owned placements). Prefer
            Unknown. No invented claims. A fuller website workbench comes later.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-md border-2 border-[#000066] bg-[#000066] px-4 py-2 font-body text-sm font-bold text-white"
          >
            Open homepage →
          </Link>
          <Link
            href="/admin/owned-media/public-placements"
            className="rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066]"
          >
            Media placements
          </Link>
          <Link
            href="/admin/pages"
            className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a]"
          >
            Admin page heroes
          </Link>
          <Link
            href="/admin/evidence-workbench?tab=publish"
            className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a]"
          >
            Evidence Publish
          </Link>
        </div>

        <h2 className="mt-10 font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
          Public pages
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {PUBLIC_EDIT_PAGE_LINKS.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="block rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-3 transition hover:border-[#000066]"
              >
                <span className="font-body text-sm font-bold text-[#000066]">{p.label}</span>
                <span className="mt-0.5 block font-body text-[11px] text-[#364272]">{p.hint}</span>
                <span className="mt-1 block font-mono text-[10px] text-[#364272]">{p.href}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-lg border-2 border-[#ca913d]/40 bg-[#fff8ef] p-4">
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">Basic tools now</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 font-body text-xs text-[#364272]">
            <li>Change hero / section copy (outlined text)</li>
            <li>Change images or video on public media slots</li>
            <li>Browse the full public site while the edit banner stays on</li>
          </ul>
          <p className="mt-3 font-body text-[11px] text-[#364272]">
            Later: website workbench for richer blocks, draft/publish, and page composition.
          </p>
        </div>
      </div>
    </div>
  );
}
