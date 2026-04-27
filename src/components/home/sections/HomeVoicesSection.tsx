import Link from "next/link";
import Image from "next/image";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { VOICES_SECTION, type VoiceCardVM } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";

export type HomeVoicesSectionProps = {
  voices: VoiceCardVM[];
};

export function HomeVoicesSection({ voices }: HomeVoicesSectionProps) {
  return (
    <section className="bg-kelly-page py-section-y lg:py-section-y-lg" aria-labelledby="voices-heading">
      <ContentContainer wide>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center md:max-w-4xl">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">{VOICES_SECTION.eyebrow}</p>
          <h2 id="voices-heading" className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-kelly-ink">
            {VOICES_SECTION.title}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">{VOICES_SECTION.intro}</p>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {voices.map((v, i) => (
            <FadeInWhenVisible key={v.kind === "live" ? v.slug : v.title} delay={0.07 * i}>
              {v.kind === "live" ? (
                <article
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-[var(--shadow-soft)]",
                    "transition duration-300 hover:-translate-y-1 hover:border-kelly-gold/30 hover:shadow-[0_20px_50px_rgba(12,18,34,0.12)]",
                  )}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-kelly-mist">
                    <Image
                      src={v.imageSrc}
                      alt={v.imageAlt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kelly-navy/50 to-transparent opacity-60" />
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <p className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-gold">{v.meta}</p>
                    <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-kelly-ink md:text-xl">{v.title}</h3>
                    <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-kelly-slate/90 md:text-base">{v.excerpt}</p>
                    <Link
                      href={v.href}
                      className="mt-5 inline-flex items-center gap-2 font-body text-sm font-bold text-kelly-navy transition group-hover:gap-3"
                    >
                      Read the story
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </article>
              ) : (
                <article
                  className={cn(
                    "flex h-full flex-col rounded-card border border-kelly-ink/10 bg-gradient-to-b from-white to-kelly-fog/80 p-7 shadow-sm",
                    "md:p-8",
                  )}
                >
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-gold">{v.meta}</p>
                  <h3 className="mt-4 font-heading text-lg font-bold leading-snug text-kelly-ink md:text-xl">{v.title}</h3>
                  <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-kelly-slate/90 md:text-base">{v.excerpt}</p>
                  <p className="mt-4 font-body text-xs text-kelly-slate/55">Placeholder narrative — swap with permissioned story.</p>
                  <Link href={v.href} className="mt-5 inline-flex font-body text-sm font-bold text-kelly-blue hover:text-kelly-navy">
                    Read the Stories →
                  </Link>
                </article>
              )}
            </FadeInWhenVisible>
          ))}
        </div>
        <FadeInWhenVisible className="mt-14 flex justify-center md:mt-16">
          <Link
            href={VOICES_SECTION.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-mist transition hover:bg-kelly-deep"
          >
            {VOICES_SECTION.ctaLabel}
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
