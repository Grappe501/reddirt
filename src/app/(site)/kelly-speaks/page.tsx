import type { Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { listPublishedCampaignMedia } from "@/content/media/campaign-media-registry";
import { isPublicTranscript, youtubePosterUrl } from "@/lib/media/campaign-transcript";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Kelly Speaks | ${siteConfig.name}`,
  description:
    "Watch Kelly Grappe’s campaign speeches, forums, and stories — and read published transcripts when available.",
  alternates: { canonical: `${siteConfig.url}/kelly-speaks` },
  openGraph: {
    title: "Kelly Speaks",
    description: "Campaign videos and published transcripts from Kelly Grappe.",
    url: `${siteConfig.url}/kelly-speaks`,
  },
};

export default function KellySpeaksIndexPage() {
  const items = listPublishedCampaignMedia();

  return (
    <div className="bg-kelly-cream pb-20 pt-10 md:pt-14">
      <ContentContainer>
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Kelly Speaks</p>
          <h1 className="mt-3 font-heading text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-kelly-ink">
            Hear Kelly in her own words
          </h1>
          <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">
            Speeches, forums, and campaign stories. Open any video for the full experience — published transcripts appear
            beneath the player when ready.
          </p>
        </header>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2">
          {items.map((media) => {
            const poster = media.thumbnailUrl ?? youtubePosterUrl(media.youtubeVideoId);
            const isShort = media.format === "SHORT";
            return (
              <li key={media.id}>
                <Link
                  href={`/kelly-speaks/${media.slug}`}
                  className="group block overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm transition hover:border-kelly-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-gold"
                >
                  <div className={isShort ? "mx-auto aspect-[9/16] max-h-72 w-full max-w-[200px] bg-black" : "aspect-video w-full bg-black"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="px-5 py-4">
                    {isShort ? (
                      <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-navy">Short</p>
                    ) : null}
                    <h2 className="mt-1 font-heading text-xl font-bold text-kelly-ink group-hover:text-kelly-navy">
                      {media.title}
                    </h2>
                    <p className="mt-2 font-body text-sm text-kelly-slate line-clamp-3">
                      {media.summary ?? media.description}
                    </p>
                    <p className="mt-3 font-body text-sm font-semibold text-kelly-navy">
                      Watch the speech
                      {isPublicTranscript(media) ? <span className="ml-2 text-kelly-slate">· Transcript available</span> : null}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {items.length === 0 ? (
          <p className="mt-12 text-center font-body text-kelly-slate">Published campaign videos will appear here.</p>
        ) : null}
      </ContentContainer>
    </div>
  );
}
