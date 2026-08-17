import Link from "next/link";
import { KELLY_ABOUT_CHAPTERS } from "@/content/about/kelly-about-chapters";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";

export function MeetKellyChapterIndex() {
  return (
    <section aria-labelledby="meet-kelly-chapters" className="scroll-mt-24">
      <h2 id="meet-kelly-chapters" className="font-heading text-2xl font-bold text-kelly-text md:text-3xl">
        Go deeper — campaign chapters
      </h2>
      <ContentPendingBadge variant="draft" className="mt-4" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {KELLY_ABOUT_CHAPTERS.map((ch) => (
          <li key={ch.slug}>
            <Link
              href={`/about/${ch.slug}`}
              className="block rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)] transition hover:border-kelly-navy/25"
            >
              <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-muted">{ch.eyebrow}</p>
              <h3 className="mt-1 font-heading text-lg font-bold text-kelly-text">{ch.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/78">{ch.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
