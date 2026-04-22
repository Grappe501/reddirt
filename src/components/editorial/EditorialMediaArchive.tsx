import type { ExternalMediaItem } from "@/content/editorial/external-media";
import { formatEditorialDate } from "@/content/editorial/external-media";

type Props = {
  sinceNov2025: ExternalMediaItem[];
  earlier: ExternalMediaItem[];
};

function ItemBlock({ item, nested }: { item: ExternalMediaItem; nested?: boolean }) {
  return (
    <li
      className={nested ? "ml-0 border-l-2 border-red-dirt/30 pl-4" : "rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-[var(--shadow-soft)] md:p-6"}
    >
      <p className="font-body text-[11px] font-bold uppercase tracking-wider text-deep-soil/50">
        {formatEditorialDate(item.publishedAt)} ·{" "}
        {item.kind === "op-ed" ? "Op-ed" : item.kind === "interview" ? "Interview" : item.kind === "note" ? "Press" : item.kind}
      </p>
      <h3
        className={nested ? "mt-2 font-heading text-lg font-bold text-deep-soil" : "mt-2 font-heading text-xl font-bold text-deep-soil md:text-2xl"}
      >
        {item.title}
      </h3>
      <p className="mt-1 font-body text-sm font-medium text-civic-slate">{item.outlet}</p>
      <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/80">{item.summary}</p>
      {item.links.length > 1 ? (
        <div className="mt-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Read the full piece</p>
          <ul className="mt-2 space-y-1.5 pl-0">
            {item.links.map((l) => (
              <li key={l.href} className="list-none">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm font-semibold text-red-dirt underline-offset-2 hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <a
          href={item.links[0]?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex font-body text-sm font-semibold text-red-dirt underline-offset-2 hover:underline"
        >
          {item.links[0]?.label ?? "Read full article →"}
        </a>
      )}
    </li>
  );
}

export function EditorialMediaArchive({ sinceNov2025, earlier }: Props) {
  return (
    <div className="space-y-12">
      <div>
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-red-dirt/90">Published commentary</p>
        <h2 id="arkansas-newspaper-editorials" className="mt-2 font-heading text-2xl font-bold text-deep-soil md:text-3xl">
          In Arkansas’s newspapers
        </h2>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-deep-soil/75">
          Bylined pieces that ran in <strong className="font-semibold text-deep-soil/90">state and regional papers</strong>. We
          list each edition that carried the same column when it was syndicated, so you can use either link.
        </p>
        {sinceNov2025.length > 0 ? (
          <p className="mt-2 font-body text-xs text-deep-soil/60">Showing op-eds with publication dates on or after November 1, 2025.</p>
        ) : null}
      </div>

      {sinceNov2025.length > 0 ? (
        <ol className="list-none space-y-6 p-0">
          {sinceNov2025.map((item) => (
            <li key={item.id} className="list-none">
              <ItemBlock item={item} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-lg border border-dashed border-deep-soil/25 bg-white/50 p-5 font-body text-sm text-deep-soil/75" role="status">
          No additional bylined op-eds in that date range are listed here yet. When new columns appear, we&rsquo;ll add them
          in code—check the same papers&rsquo; opinion sections, or the campaign&rsquo;s Substack, for the latest.
        </p>
      )}

      {earlier.length > 0 ? (
        <div className="border-t border-deep-soil/10 pt-10">
          <h3 className="font-heading text-lg font-bold text-deep-soil">Earlier bylines, interviews &amp; press</h3>
          <p className="mt-2 max-w-3xl font-body text-sm text-deep-soil/70">
            Opinion columns, interviews, and press coverage from state and regional outlets, published before the November
            2025 window above.
          </p>
          <ul className="mt-6 list-none space-y-4 p-0">
            {earlier.map((item) => (
              <li key={item.id} className="list-none">
                <ItemBlock item={item} nested />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
