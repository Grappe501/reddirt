import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { MEET_KELLY } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";

export function HomeMeetKellySection() {
  return (
    <section className="bg-civic-fog py-section-y lg:py-section-y-lg" aria-labelledby="meet-kelly-heading">
      <ContentContainer>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-14">
          <FadeInWhenVisible className="lg:col-span-5">
            <div className="relative min-h-[300px] overflow-hidden rounded-card border border-civic-ink/10 shadow-[0_20px_60px_rgba(12,18,34,0.12)] lg:min-h-full lg:min-h-[420px]">
              {/* MEDIA: Replace with editorial portrait / documentary still */}
              <ContentImage
                media={media.arkansasPorch}
                warmOverlay={false}
                className="absolute inset-0 min-h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-civic-midnight/90 via-civic-midnight/20 to-transparent" />
              <div className="relative z-[1] flex h-full min-h-[300px] flex-col justify-end p-6 md:p-8 lg:min-h-[420px]">
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.26em] text-civic-gold">Portrait</p>
                <p className="mt-2 font-heading text-xl font-bold text-civic-mist md:text-2xl">Kelly Grappe</p>
                <p className="mt-1 font-body text-sm text-civic-mist/75">Arkansas Secretary of State</p>
              </div>
            </div>
          </FadeInWhenVisible>
          <div className="lg:col-span-7">
            <FadeInWhenVisible>
              <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-red-dirt">{MEET_KELLY.eyebrow}</p>
              <h2
                id="meet-kelly-heading"
                className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-civic-ink"
              >
                {MEET_KELLY.title}
              </h2>
              <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-civic-slate md:text-xl">{MEET_KELLY.body}</p>
            </FadeInWhenVisible>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {MEET_KELLY.traits.map((t, i) => (
                <FadeInWhenVisible key={t.title} delay={0.08 + i * 0.05}>
                  <div
                    className={cn(
                      "h-full rounded-card border border-civic-ink/8 bg-white p-5 shadow-sm transition duration-normal",
                      "hover:border-civic-gold/35 hover:shadow-md md:p-6",
                    )}
                  >
                    <h3 className="font-heading text-lg font-bold text-civic-ink">{t.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-civic-slate/90">{t.body}</p>
                  </div>
                </FadeInWhenVisible>
              ))}
            </div>
            <FadeInWhenVisible className="mt-10" delay={0.15}>
              <Link
                href={MEET_KELLY.ctaHref}
                className={cn(
                  "inline-flex min-h-[48px] items-center justify-center rounded-btn bg-civic-blue px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-mist",
                  "shadow-md transition hover:bg-civic-slate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-gold",
                )}
              >
                {MEET_KELLY.ctaLabel}
              </Link>
            </FadeInWhenVisible>
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
