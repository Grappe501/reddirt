import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import type { YoutubeCardVM } from "@/lib/content/content-hub-queries";
import { ContentLocality } from "@/components/content/ContentLocality";

export type HomeFeaturedVideoSectionProps = {
  video: YoutubeCardVM;
  /** When set, section is the primary in-page anchor for “Watch Kelly” jumps */
  anchorId?: string;
};

export function HomeFeaturedVideoSection({ video, anchorId = "home-featured-video" }: HomeFeaturedVideoSectionProps) {
  return (
    <section
      id={anchorId}
      className="bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="home-featured-video-heading"
    >
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-red-dirt">Watch</p>
          <h2
            id="home-featured-video-heading"
            className="mt-4 font-heading text-[clamp(1.65rem,3.2vw,2.35rem)] font-bold tracking-tight text-civic-ink"
          >
            Kelly in her own words
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-civic-slate md:text-xl">
            Start with a featured moment—then explore the full library on{" "}
            <Link href="/watch" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
              Watch Kelly
            </Link>
            .
          </p>
        </FadeInWhenVisible>

        <FadeInWhenVisible className="mx-auto mt-10 max-w-4xl" delay={0.06}>
          <div className="overflow-hidden rounded-card border border-civic-ink/10 bg-civic-midnight shadow-2xl shadow-black/15">
            <LazyYouTubeEmbed videoId={video.videoId} title={video.title} posterUrl={video.posterUrl} />
          </div>
          <p className="mt-4 text-center font-body text-sm text-civic-slate/80">{video.title}</p>
          <ContentLocality countySlug={video.countySlug} city={video.city} className="justify-center" variant="compact" />
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
