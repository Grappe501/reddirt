import Link from "next/link";
import { MEDIA_CENTER_VIEW_QUERY_KEYS } from "@/lib/owned-media/media-center-smart-views";

type BatchOpt = { id: string; label: string; started: string };
type Col = { id: string; slug: string; name: string; isSmart: boolean; isPinned: boolean };

function href(base: string, next: Record<string, string | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v) u.set(k, v);
  }
  const s = u.toString();
  return s ? `${base}?${s}` : base;
}

function hrefSmartView(
  base: string,
  preserved: Record<string, string | undefined>,
  viewKey: (typeof MEDIA_CENTER_VIEW_QUERY_KEYS)[number]
) {
  const p = { ...preserved };
  for (const k of MEDIA_CENTER_VIEW_QUERY_KEYS) {
    delete p[k];
  }
  p[viewKey] = "1";
  return href(base, p);
}

const navClass =
  "block rounded-lg px-2 py-1.5 text-left text-sm text-kelly-text/90 hover:bg-kelly-text/5 aria-[current=true]:bg-kelly-navy/10 aria-[current=true]:font-semibold";

type Props = {
  basePath: string;
  /** Current query to preserve (e.g. size, q) */
  preserved: Record<string, string | undefined>;
  /** Active param keys for aria-current (smart views use `view*` keys). */
  activeHint?: { key: string; value?: string };
  collections: Col[];
  batches: BatchOpt[];
};

/**
 * Left rail: smart views, collections, and ingest batches (Lightroom-style).
 */
export function MediaCenterSidebar({ basePath, preserved, activeHint, collections, batches }: Props) {
  const p = { ...preserved };
  return (
    <aside className="w-full shrink-0 border-r border-kelly-text/10 bg-kelly-page/80 pb-4 pr-2 pt-1 md:w-56">
      <h2 className="mb-2 px-2 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">Library</h2>
      <nav className="space-y-0.5" aria-label="Media center views">
        <p className="px-2 pb-1 font-body text-[9px] font-bold uppercase tracking-wide text-kelly-text/40">Smart views</p>
        <Link
          href={hrefSmartView(basePath, p, "viewUnreviewed")}
          className={navClass}
          aria-current={activeHint?.key === "viewUnreviewed" ? "true" : undefined}
        >
          Unreviewed
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewFav")}
          className={navClass}
          aria-current={activeHint?.key === "viewFav" ? "true" : undefined}
        >
          Favorites
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewNeedPress")}
          className={navClass}
          aria-current={activeHint?.key === "viewNeedPress" ? "true" : undefined}
        >
          Needs press approval
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewNeedSite")}
          className={navClass}
          aria-current={activeHint?.key === "viewNeedSite" ? "true" : undefined}
        >
          Needs public site approval
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewApPress")}
          className={navClass}
          aria-current={activeHint?.key === "viewApPress" ? "true" : undefined}
        >
          Approved for press
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewApSite")}
          className={navClass}
          aria-current={activeHint?.key === "viewApSite" ? "true" : undefined}
        >
          Approved for public site
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewImport")}
          className={navClass}
          aria-current={activeHint?.key === "viewImport" ? "true" : undefined}
        >
          Import / duplicate notes
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewDeriv")}
          className={navClass}
          aria-current={activeHint?.key === "viewDeriv" ? "true" : undefined}
        >
          Pending derivative jobs
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewVidNoTr")}
          className={navClass}
          aria-current={activeHint?.key === "viewVidNoTr" ? "true" : undefined}
        >
          Video · no transcript
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewLowPick")}
          className={navClass}
          aria-current={activeHint?.key === "viewLowPick" ? "true" : undefined}
        >
          Low-rated picks
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewRevNoAp")}
          className={navClass}
          aria-current={activeHint?.key === "viewRevNoAp" ? "true" : undefined}
        >
          Reviewed · not approved anywhere
        </Link>
        <Link
          href={hrefSmartView(basePath, p, "viewPickQueue")}
          className={navClass}
          aria-current={activeHint?.key === "viewPickQueue" ? "true" : undefined}
        >
          Unrated pick queue
        </Link>
        <p className="mt-3 px-2 pb-1 font-body text-[9px] font-bold uppercase tracking-wide text-kelly-text/40">Shortcuts</p>
        <Link
          href={href(basePath, { ...p, approvedForSocial: "1" })}
          className={navClass}
          aria-current={activeHint?.key === "approvedForSocial" && activeHint.value === "1" ? "true" : undefined}
        >
          Approved for social
        </Link>
        <Link
          href={href(basePath, { ...p, pick: "PICK" })}
          className={navClass}
          aria-current={activeHint?.key === "pick" && activeHint.value === "PICK" ? "true" : undefined}
        >
          Picks
        </Link>
        <Link
          href={href(basePath, { ...p, pick: "REJECT" })}
          className={navClass}
          aria-current={activeHint?.key === "pick" && activeHint.value === "REJECT" ? "true" : undefined}
        >
          Rejects
        </Link>
        <Link
          href={href(basePath, { ...p, reviewed: "1" })}
          className={navClass}
          aria-current={activeHint?.key === "reviewed" && activeHint.value === "1" ? "true" : undefined}
        >
          Reviewed (at)
        </Link>
        <a href="/admin/workbench/social" className={navClass}>
          Social workbench →
        </a>
      </nav>
      {/* TODO: smart collections: evaluate `OwnedMediaCollection.filterJson` in-app (transcript + rule builder). */}

      {collections.length > 0 ? (
        <>
          <h2 className="mb-2 mt-5 px-2 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">
            Collections
          </h2>
          <nav className="space-y-0.5">
            {collections.map((c) => (
              <Link key={c.id} href={href(basePath, { ...p, collection: c.id })} className={navClass}>
                {c.isPinned ? "★ " : ""}
                {c.name}
                {c.isSmart ? " (smart)" : ""}
              </Link>
            ))}
          </nav>
        </>
      ) : null}

      <h2 className="mb-2 mt-5 px-2 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">
        Import batches
      </h2>
      <nav className="max-h-48 space-y-0.5 overflow-y-auto">
        {batches.length === 0 ? (
          <p className="px-2 text-xs text-kelly-text/50">No batches yet</p>
        ) : (
          batches.map((b) => (
            <Link
              key={b.id}
              href={href(basePath, { ...p, batch: b.id })}
              className={navClass}
              title={b.started}
              aria-current={activeHint?.key === "batch" && activeHint.value === b.id ? "true" : undefined}
            >
              <span className="line-clamp-2">{b.label}</span>
            </Link>
          ))
        )}
      </nav>
    </aside>
  );
}
