import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { STATEWIDE_SECTION } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";

export function HomeStatewideSection() {
  return (
    <section
      className="bg-civic-blue py-section-y text-civic-gold-soft lg:py-section-y-lg"
      aria-labelledby="statewide-heading"
    >
      <ContentContainer>
        <div className="grid grid-cols-1 items-center gap-12 text-civic-gold-soft lg:grid-cols-12 lg:gap-16">
          <FadeInWhenVisible className="lg:col-span-5">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-civic-gold">
              {STATEWIDE_SECTION.eyebrow}
            </p>
            <h2
              id="statewide-heading"
              className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-tight tracking-tight text-civic-gold"
            >
              {STATEWIDE_SECTION.title}
            </h2>
            <p className="mt-6 font-body text-lg leading-relaxed text-civic-gold-soft/95 md:text-xl">
              {STATEWIDE_SECTION.body}
            </p>
            <p className="mt-10 font-heading text-[clamp(3.5rem,12vw,6rem)] font-bold leading-none tracking-tight text-civic-gold">
              75
            </p>
            <p className="mt-2 font-body text-xs font-bold uppercase tracking-[0.28em] text-civic-gold/70">
              counties
            </p>
            <div className="mt-10">
              <Link
                href={STATEWIDE_SECTION.ctaHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-civic-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-midnight transition hover:bg-civic-gold-soft"
              >
                {STATEWIDE_SECTION.ctaLabel}
              </Link>
            </div>
          </FadeInWhenVisible>
          <FadeInWhenVisible className="lg:col-span-7 text-civic-gold-soft" delay={0.1}>
            {/* MEDIA: SVG/Mapbox county map + markers; bind visit data from CMS */}
            <div className="relative min-h-[300px] overflow-hidden rounded-card border border-civic-gold/35 bg-civic-deep/60 shadow-2xl shadow-black/30 md:min-h-[380px] lg:min-h-[440px]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(201,162,39,0.14),transparent_55%),radial-gradient(ellipse_at_70%_60%,rgba(212,178,74,0.1),transparent_50%)]" />
              <div className="relative flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center text-civic-gold-soft md:min-h-[380px]">
                <p className="max-w-sm font-body text-sm font-medium uppercase tracking-[0.18em] text-civic-gold">
                  Arkansas presence map
                </p>
                <p className="mt-4 max-w-md font-body text-base leading-relaxed text-civic-gold-soft/95">
                  County markers will show visit dates, photos, notes heard, and upcoming returns—interactive layer
                  plugs in here.
                </p>
                <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-2">
                  {["NW", "River", "Delta", "Central", "SW", "NE"].map((r) => (
                    <div
                      key={r}
                      className="rounded border border-civic-gold/40 bg-civic-midnight/40 py-3 text-center font-body text-[10px] font-bold uppercase tracking-wider text-civic-gold/90"
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </ContentContainer>
    </section>
  );
}
