import Link from "next/link";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { storyPreviews } from "@/content/homepage";

/** Local voices + county links — no internal dashboard language on the homepage. */
export function HomeAcrossArkansasVoices() {
  const previews = storyPreviews.slice(0, 3);

  return (
    <section
      className="bg-kelly-page py-section-y lg:py-section-y-lg"
      aria-labelledby="across-arkansas-heading"
    >
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Across Arkansas</p>
          <h2 id="across-arkansas-heading" className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-ink">
            Working with communities across Arkansas
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">
            From river towns to growing cities, Kelly is building a campaign that listens first. Explore neighbor stories, find your
            county, and read public planning briefings as they roll out—always written for voters, not insiders.
          </p>
        </FadeInWhenVisible>

        <div className="mt-10 flex flex-col flex-wrap items-stretch justify-center gap-3 sm:flex-row sm:gap-4">
          <FadeInWhenVisible delay={0.04}>
            <Link
              href="/counties"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-btn border-2 border-kelly-navy/25 bg-white px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold sm:min-w-[12rem]"
            >
              Find your county
            </Link>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.08}>
            <Link
              href="/county-briefings"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-btn border-2 border-kelly-gold/50 bg-kelly-gold/10 px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:bg-kelly-gold/20 sm:min-w-[12rem]"
            >
              County briefings
            </Link>
          </FadeInWhenVisible>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {previews.map((s, i) => (
            <FadeInWhenVisible key={s.href} delay={0.06 * i}>
              <article className="flex h-full flex-col rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-kelly-gold/30 hover:shadow-lg md:p-7">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-gold">{s.meta}</p>
                <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-kelly-ink">{s.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-slate/90">{s.excerpt}</p>
                <Link href={s.href} className="mt-5 inline-flex items-center gap-2 font-body text-sm font-bold text-kelly-navy">
                  {s.ctaLabel}
                  <span aria-hidden>→</span>
                </Link>
              </article>
            </FadeInWhenVisible>
          ))}
        </div>

        <FadeInWhenVisible className="mt-12 flex justify-center">
          <Link
            href="/messages"
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-blue/35 bg-kelly-mist/40 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-blue transition hover:border-kelly-gold"
          >
            Open Stories &amp; voices
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
