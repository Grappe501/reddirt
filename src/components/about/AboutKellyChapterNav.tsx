import Link from "next/link";
import {
  KELLY_ABOUT_CHAPTERS,
  kellyAboutChapterIndex,
  type KellyAboutSlug,
} from "@/content/about/kelly-about-chapters";

const linkClass =
  "font-body text-sm font-semibold text-red-dirt underline decoration-red-dirt/30 underline-offset-2 transition hover:decoration-red-dirt sm:text-base";

type Props = { slug: KellyAboutSlug };

export function AboutKellyChapterNav({ slug }: Props) {
  const i = kellyAboutChapterIndex(slug);
  const prev = i > 0 ? KELLY_ABOUT_CHAPTERS[i - 1]! : null;
  const next = i >= 0 && i < KELLY_ABOUT_CHAPTERS.length - 1 ? KELLY_ABOUT_CHAPTERS[i + 1]! : null;

  return (
    <nav
      className="mt-12 flex flex-col gap-4 border-t border-deep-soil/10 pt-8 sm:flex-row sm:items-start sm:justify-between"
      aria-label="Previous and next chapter"
    >
      <div>
        {prev ? (
          <Link href={`/about/${prev.slug}`} className={linkClass}>
            ← {prev.navLabel}
          </Link>
        ) : (
          <Link href="/about" className={linkClass}>
            ← All chapters
          </Link>
        )}
      </div>
      <div className="sm:text-right">
        {next ? (
          <Link href={`/about/${next.slug}`} className={linkClass}>
            {next.navLabel} →
          </Link>
        ) : (
          <Link href="/get-involved" className={linkClass}>
            Get involved →
          </Link>
        )}
      </div>
    </nav>
  );
}
