import Link from "next/link";

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

const navClass =
  "block rounded-lg px-2 py-1.5 text-left text-sm text-deep-soil/90 hover:bg-deep-soil/5 aria-[current=true]:bg-red-dirt/10 aria-[current=true]:font-semibold";

type Props = {
  basePath: string;
  /** Current query to preserve (e.g. size, q) */
  preserved: Record<string, string | undefined>;
  /** Active param keys for aria-current (best-effort). */
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
    <aside className="w-full shrink-0 border-r border-deep-soil/10 bg-cream-canvas/80 pb-4 pr-2 pt-1 md:w-56">
      <h2 className="mb-2 px-2 font-body text-[10px] font-bold uppercase tracking-wider text-deep-soil/45">Library</h2>
      <nav className="space-y-0.5" aria-label="Media center views">
        <Link
          href={href(basePath, { ...p, unreviewed: "1" })}
          className={navClass}
          aria-current={activeHint?.key === "unreviewed" && activeHint.value === "1" ? "true" : undefined}
        >
          Unreviewed
        </Link>
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
          href={href(basePath, { ...p, fav: "1" })}
          className={navClass}
          aria-current={activeHint?.key === "fav" && activeHint.value === "1" ? "true" : undefined}
        >
          Favorites
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
          <h2 className="mb-2 mt-5 px-2 font-body text-[10px] font-bold uppercase tracking-wider text-deep-soil/45">
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

      <h2 className="mb-2 mt-5 px-2 font-body text-[10px] font-bold uppercase tracking-wider text-deep-soil/45">
        Import batches
      </h2>
      <nav className="max-h-48 space-y-0.5 overflow-y-auto">
        {batches.length === 0 ? (
          <p className="px-2 text-xs text-deep-soil/50">No batches yet</p>
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
