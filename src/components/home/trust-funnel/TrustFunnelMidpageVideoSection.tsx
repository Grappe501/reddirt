import { ContentContainer } from "@/components/layout/ContentContainer";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { youtubePosterUrl } from "@/lib/media/campaign-transcript";

const HOME_MIDPAGE_YOUTUBE_ID = "3iWSa5Gwmdc";
const HOME_MIDPAGE_YOUTUBE_TITLE = "Kelly Grappe 12.7.25";

/** Mid-page Watch block — Talk Business / Capitol View clip Steve asked onto `/`. */
export function TrustFunnelMidpageVideoSection() {
  return (
    <section
      id="watch-kelly"
      className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="watch-kelly-heading"
    >
      <ContentContainer>
        <ScrollReveal yOffset={8} className="mx-auto max-w-4xl">
          <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
            Watch
          </p>
          <h2
            id="watch-kelly-heading"
            className="mt-3 text-center font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl"
          >
            Kelly Grappe
          </h2>
          <div className="mt-8 overflow-hidden rounded-card border border-kelly-ink/10 bg-kelly-navy shadow-[0_16px_48px_rgba(0,0,102,0.08)]">
            <LazyYouTubeEmbed
              videoId={HOME_MIDPAGE_YOUTUBE_ID}
              title={HOME_MIDPAGE_YOUTUBE_TITLE}
              posterUrl={youtubePosterUrl(HOME_MIDPAGE_YOUTUBE_ID)}
            />
          </div>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
