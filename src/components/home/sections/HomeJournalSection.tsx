import Link from "next/link";
import Image from "next/image";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { JOURNAL_SECTION, type JournalCardVM } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";

export type HomeJournalSectionProps = {
  cards: JournalCardVM[];
};

export function HomeJournalSection({ cards }: HomeJournalSectionProps) {
  return (
    <section className="bg-civic-mist/40 py-section-y lg:py-section-y-lg" aria-labelledby="journal-heading">
      <ContentContainer wide>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-red-dirt">{JOURNAL_SECTION.eyebrow}</p>
          <h2 id="journal-heading" className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-civic-ink">
            {JOURNAL_SECTION.title}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-civic-slate">{JOURNAL_SECTION.intro}</p>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {cards.map((c, i) => (
            <FadeInWhenVisible key={c.key} delay={0.07 * i}>
              <article
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-card border border-civic-ink/10 bg-white shadow-[var(--shadow-soft)]",
                  "transition hover:-translate-y-0.5 hover:border-civic-gold/25 hover:shadow-lg",
                )}
              >
                {c.imageSrc ? (
                  <div className="relative aspect-[16/10] bg-civic-mist">
                    <Image src={c.imageSrc} alt={c.imageAlt ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-civic-blue/20 to-civic-midnight/10 px-4">
                    <span className="text-center font-body text-[10px] font-bold uppercase tracking-[0.2em] text-civic-slate/45">
                      Photo coming soon
                    </span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-civic-gold">{c.meta}</p>
                  <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-civic-ink">{c.title}</h3>
                  <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-civic-slate/88 md:text-base">{c.excerpt}</p>
                  <Link href={c.href} className="mt-5 inline-flex items-center gap-2 font-body text-sm font-bold text-red-dirt">
                    {c.cta}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            </FadeInWhenVisible>
          ))}
        </div>
        <FadeInWhenVisible className="mt-14 flex justify-center">
          <Link
            href={JOURNAL_SECTION.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-civic-blue/35 bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-blue transition hover:border-civic-gold"
          >
            {JOURNAL_SECTION.ctaLabel}
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
