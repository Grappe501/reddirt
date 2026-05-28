import Link from "next/link";
import type { KimHammerNarrativeSection } from "@/lib/opposition/kimHammerNarrativeBriefings";

type KimHammerNarrativePanelProps = {
  section: KimHammerNarrativeSection;
  variant?: "default" | "hero" | "compact";
};

export function KimHammerNarrativePanel({ section, variant = "default" }: KimHammerNarrativePanelProps) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  return (
    <article
      id={section.id}
      className={
        isHero
          ? "mb-8 rounded-2xl border border-kelly-navy/20 bg-gradient-to-br from-kelly-page via-white to-kelly-page p-6 shadow-sm lg:p-8"
          : isCompact
            ? "rounded-xl border border-kelly-text/10 bg-white p-4"
            : "rounded-xl border border-kelly-text/10 bg-white p-5 lg:p-6"
      }
    >
      <header className={isHero ? "mb-5 max-w-4xl" : "mb-3"}>
        <h2
          className={
            isHero
              ? "font-heading text-xl font-bold text-kelly-navy lg:text-2xl"
              : "text-sm font-bold uppercase tracking-wider text-kelly-navy"
          }
        >
          {section.title}
        </h2>
        {section.subtitle ? (
          <p className={`mt-1 ${isHero ? "text-sm text-kelly-muted" : "text-[11px] text-kelly-subtle"}`}>
            {section.subtitle}
          </p>
        ) : null}
      </header>

      <div className={`space-y-4 ${isHero ? "max-w-4xl text-sm leading-relaxed" : "text-xs leading-relaxed"} text-kelly-text`}>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="text-kelly-muted">
            {paragraph}
          </p>
        ))}
      </div>

      {section.pullQuotes && section.pullQuotes.length > 0 ? (
        <div className={`mt-5 grid gap-3 ${section.pullQuotes.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {section.pullQuotes.map((quote) => (
            <blockquote
              key={quote.text.slice(0, 40)}
              className="rounded-lg border-l-4 border-kelly-gold bg-kelly-page/80 px-4 py-3 text-xs italic text-kelly-navy"
            >
              {quote.label ? (
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle not-italic">
                  {quote.label}
                </p>
              ) : null}
              “{quote.text}”
            </blockquote>
          ))}
        </div>
      ) : null}

      {section.crossLinks && section.crossLinks.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {section.crossLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded border border-kelly-text/15 bg-kelly-page px-2.5 py-1 text-[11px] font-semibold text-kelly-navy hover:bg-white"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      ) : null}

      {section.evidenceNote ? (
        <p className="mt-4 text-[10px] uppercase tracking-wider text-kelly-subtle">
          Evidence status: {section.evidenceNote}
        </p>
      ) : null}
    </article>
  );
}

type KimHammerNarrativeIndexProps = {
  sections: KimHammerNarrativeSection[];
  primaryIds: string[];
};

export function KimHammerNarrativeIndex({ sections, primaryIds }: KimHammerNarrativeIndexProps) {
  const items = sections.filter((s) => primaryIds.includes(s.id));

  return (
    <nav className="mb-6 flex flex-wrap gap-2 text-[11px]">
      {items.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="rounded-full border border-kelly-text/15 bg-white px-3 py-1 font-semibold text-kelly-navy hover:bg-kelly-page"
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
