import Link from "next/link";
import { BIOGRAPHY_CHAPTERS } from "@/content/biography/biography-config";
import { BIOGRAPHY_NARRATIVE_PILLARS } from "@/content/biography/biography-narrative-pillars";
import { cn } from "@/lib/utils";

type Props = {
  /** List manuscript chapter links under each arc (About drill-down). */
  showPerPillarChapterLinks?: boolean;
  /** Hub page hosts anchors — hide redundant biography jump row. */
  variant?: "hub" | "about";
  className?: string;
};

function chapterRangeLabel(orders: readonly number[]): string {
  const lo = orders[0]!;
  const hi = orders[orders.length - 1]!;
  return lo === hi ? `${lo}` : `${lo}–${hi}`;
}

export function BiographyPillarSection({
  showPerPillarChapterLinks = false,
  variant = "about",
  className,
}: Props) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", className)}>
      {BIOGRAPHY_NARRATIVE_PILLARS.map((p) => {
        const chapters = p.chapterOrders
          .map((order) => BIOGRAPHY_CHAPTERS.find((c) => c.order === order))
          .filter((c): c is NonNullable<typeof c> => Boolean(c));

        return (
          <article
            key={p.id}
            id={`pillar-${p.id}`}
            className="scroll-mt-28 rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]"
          >
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-navy/80">
              Chapters {chapterRangeLabel(p.chapterOrders)}
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold text-kelly-text">{p.title}</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{p.summary}</p>
            {variant === "about" ? (
              <p className="mt-4 font-body text-xs font-semibold text-kelly-text/70">
                <Link href={`/biography#pillar-${p.id}`} className="text-kelly-navy underline-offset-2 hover:underline">
                  Open arc on biography hub →
                </Link>
              </p>
            ) : null}
            {showPerPillarChapterLinks && chapters.length > 0 ? (
              <ul className="mt-3 space-y-1.5 border-t border-kelly-text/10 pt-3 font-body text-sm text-kelly-text/85">
                {chapters.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/about/deep-dive/${c.slug}`}
                      className="font-medium text-kelly-navy underline-offset-2 hover:underline"
                    >
                      {c.shortTitle ?? c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
