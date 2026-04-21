import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";

export type ArkansasBand = { intro?: string; quote?: string; attribution?: string };

export function HomeArkansasBandSection({ band }: { band: ArkansasBand }) {
  const intro = band.intro?.trim();
  const quote = band.quote?.trim();
  const attribution = band.attribution?.trim();
  if (!intro && !quote) return null;

  return (
    <section className="border-t border-civic-ink/10 bg-gradient-to-b from-civic-fog to-white py-section-y lg:py-section-y-lg" aria-labelledby="arkansas-band-heading">
      <ContentContainer>
        <div className="mx-auto max-w-4xl">
          {intro ? (
            <FadeInWhenVisible>
              <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-civic-blue">The Arkansas we know</p>
              <h2 id="arkansas-band-heading" className="mt-4 font-heading text-[clamp(1.5rem,3vw,2rem)] font-bold text-civic-ink">
                County by county
              </h2>
              <p className="mt-6 font-body text-lg leading-relaxed text-civic-slate md:text-xl">{intro}</p>
            </FadeInWhenVisible>
          ) : null}
          {quote ? (
            <FadeInWhenVisible className={intro ? "mt-12" : ""} delay={0.1}>
              <figure className="rounded-card border border-civic-gold/25 bg-civic-midnight/95 px-6 py-10 text-center md:px-12 md:py-12">
                <blockquote className="font-heading text-xl font-bold leading-snug text-civic-mist md:text-2xl lg:text-[1.75rem]">
                  “{quote}”
                </blockquote>
                {attribution ? (
                  <figcaption className="mt-6 font-body text-xs font-semibold uppercase tracking-[0.2em] text-civic-gold-soft">
                    {attribution}
                  </figcaption>
                ) : null}
              </figure>
            </FadeInWhenVisible>
          ) : null}
        </div>
      </ContentContainer>
    </section>
  );
}
