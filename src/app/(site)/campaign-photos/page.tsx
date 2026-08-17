import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { homepagePhotoObjectPositionClass } from "@/content/media/homepage-campaign-photo-display";
import { listCountyAlbumsLive } from "@/lib/campaign-media/county-albums-live";
import { pageMeta } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Campaign Photos — County Albums",
  description:
    "County-by-county campaign trail albums for Kelly Grappe — confirmed places only, grouped by stop.",
  path: "/campaign-photos",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function CampaignPhotosPage() {
  const albums = listCountyAlbumsLive();

  return (
    <>
      <MediaPageHero
        slotKey="campaign-photos.intro"
        layout="split"
        eyebrow="Campaign photos"
        title="County albums"
        subtitle="Open a county. Step through the stops. Every still is confirmed geography — not a dump of every file."
      >
        <Button href="/events" variant="primary">
          Campaign calendar
        </Button>
        <Button href="/from-the-road" variant="outlineOnDark">
          From the Road
        </Button>
      </MediaPageHero>

      <FullBleedSection padY className="bg-gradient-to-b from-white via-kelly-fog/50 to-kelly-wash/30">
        <ContentContainer>
          {albums.length === 0 ? (
            <p className="mx-auto max-w-xl text-center font-body text-kelly-slate">
              County albums appear here as confirmed trail photos are published.
            </p>
          ) : (
            <>
              <p className="mx-auto mb-10 max-w-2xl text-center font-body text-sm text-kelly-slate md:text-base">
                {albums.length} {albums.length === 1 ? "county" : "counties"} with trail evidence · click any cover to
                walk the stops inside.
              </p>
              <ul className="grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album, i) => (
                  <li key={album.countySlug}>
                    <ScrollReveal delay={i * 40} yOffset={8}>
                      <Link
                        href={`/campaign-photos/${album.countySlug}`}
                        className="group block overflow-hidden rounded-lg border border-kelly-ink/10 bg-white shadow-sm transition hover:border-kelly-navy/30 hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                      >
                        <div className="relative aspect-[5/4] overflow-hidden bg-kelly-fog">
                          <Image
                            src={album.cover.src}
                            alt={album.cover.accessibility.altText}
                            width={album.cover.basic.width ?? 960}
                            height={album.cover.basic.height ?? 768}
                            className={cn(
                              "h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]",
                              homepagePhotoObjectPositionClass(album.cover),
                            )}
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kelly-ink/70 via-kelly-ink/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-5">
                            <p className="font-heading text-xl font-bold tracking-tight md:text-2xl">
                              {album.shortName}
                            </p>
                            <p className="mt-1 font-body text-sm text-white/85">
                              {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"} · {album.eventCount}{" "}
                              {album.eventCount === 1 ? "stop" : "stops"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  </li>
                ))}
              </ul>
            </>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
