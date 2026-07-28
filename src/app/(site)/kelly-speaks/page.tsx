import type { Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { listPublicMediaCollections, summarizePublicMediaInventory } from "@/content/media/public-media-collections";
import { isPublicTranscript, youtubePosterUrl } from "@/lib/media/campaign-transcript";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Campaign Videos | ${siteConfig.name}`,
  description:
    "Watch Kelly Grappe’s featured messages, trail stories, speeches, and short moments — privacy-enhanced, click-to-play, organized by purpose.",
  alternates: { canonical: `${siteConfig.url}/kelly-speaks` },
  openGraph: {
    title: "Campaign Videos — Kelly Speaks",
    description: "Featured messages, Kelly Across Arkansas, speeches, and short campaign moments.",
    url: `${siteConfig.url}/kelly-speaks`,
  },
};

export default function KellySpeaksIndexPage() {
  const collections = listPublicMediaCollections();
  const inventory = summarizePublicMediaInventory();

  return (
    <div className="bg-kelly-cream pb-20 pt-10 md:pt-14">
      <ContentContainer>
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Kelly Speaks</p>
          <h1 className="mt-3 font-heading text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-kelly-ink">
            Campaign videos
          </h1>
          <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">
            Hear Kelly directly—featured messages, trail stories, and short moments, organized by purpose.
            Click to play; embeds use privacy-enhanced YouTube.
          </p>
          <p className="mt-3 font-body text-sm text-kelly-muted">
            Public inventory: {inventory.longForm} long-form · {inventory.shorts} Shorts · {inventory.publishedTotal}{" "}
            published
          </p>
          <p className="mt-3">
            <Link href="/kelly-speaks/search" className="font-body text-sm font-semibold text-kelly-navy underline">
              Search published transcripts
            </Link>
            {" · "}
            <Link href="/campaign-photos" className="font-body text-sm font-semibold text-kelly-navy underline">
              View Campaign Photos
            </Link>
          </p>
        </header>

        <div className="mx-auto mt-14 max-w-5xl space-y-16">
          {collections.map((collection) => (
            <section key={collection.id} aria-labelledby={`collection-${collection.id}`}>
              <h2 id={`collection-${collection.id}`} className="font-heading text-2xl font-bold text-kelly-ink">
                {collection.title}
              </h2>
              <p className="mt-2 max-w-2xl font-body text-kelly-slate">{collection.intro}</p>

              {collection.items.length === 0 ? (
                <p className="mt-6 font-body text-sm text-kelly-muted">No published items in this collection yet.</p>
              ) : (
                <ul
                  className={
                    collection.id === "short-moments"
                      ? "mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : "mt-8 grid gap-8 sm:grid-cols-2"
                  }
                >
                  {collection.items.map((media) => {
                    const poster = media.thumbnailUrl ?? youtubePosterUrl(media.youtubeVideoId);
                    const isShort = media.format === "SHORT";
                    return (
                      <li key={media.id}>
                        <Link
                          href={`/kelly-speaks/${media.slug}`}
                          className="group block overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm transition hover:border-kelly-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-gold"
                        >
                          <div
                            className={
                              isShort
                                ? "mx-auto aspect-[9/16] max-h-64 w-full max-w-[180px] bg-black"
                                : "aspect-video w-full bg-black"
                            }
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
                          </div>
                          <div className="px-5 py-4">
                            {isShort ? (
                              <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-navy">
                                Short
                              </p>
                            ) : null}
                            <h3 className="mt-1 font-heading text-xl font-bold text-kelly-ink group-hover:text-kelly-navy">
                              {media.title}
                            </h3>
                            <p className="mt-2 font-body text-sm text-kelly-slate line-clamp-3">
                              {media.summary ?? media.description}
                            </p>
                            <p className="mt-3 font-body text-sm font-semibold text-kelly-navy">
                              Watch
                              {isPublicTranscript(media) ? (
                                <span className="ml-2 text-kelly-slate">· Transcript available</span>
                              ) : (
                                <span className="ml-2 text-kelly-slate">· Transcript pending</span>
                              )}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </ContentContainer>
    </div>
  );
}
