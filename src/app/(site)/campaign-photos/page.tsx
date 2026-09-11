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
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { pageMeta } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Campaign Photos — County Albums",
  description:
    "Browse Kelly Grappe campaign photos by Arkansas county. Albums grow as trail stills are added.",
  path: "/campaign-photos",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function CampaignPhotosPage() {
  const albums = listCountyAlbumsLive();
  const bySlug = new Map(albums.map((a) => [a.countySlug, a]));
  const withPhotos = ARKANSAS_COUNTY_REGISTRY.filter((c) => bySlug.has(c.slug));
  const waiting = ARKANSAS_COUNTY_REGISTRY.filter((c) => !bySlug.has(c.slug));

  return (
    <>
      <MediaPageHero
        slotKey="campaign-photos.intro"
        layout="bleed"
        eyebrow="Campaign photos"
        title="County albums"
        subtitle="Every Arkansas county has a place here. Open a county that has photos — more albums land as we add them from the trail."
      >
        <Button href="/about/journey" variant="primary">
          Kelly Across Arkansas
        </Button>
        <Button href="/from-the-road" variant="outlineOnDark">
          From the Road
        </Button>
      </MediaPageHero>

      <FullBleedSection padY className="bg-gradient-to-b from-white via-kelly-fog/50 to-kelly-wash/30">
        <ContentContainer>
          <p className="mx-auto mb-10 max-w-2xl text-center font-body text-sm text-kelly-slate md:text-base">
            {withPhotos.length} {withPhotos.length === 1 ? "county" : "counties"} with photos so far · {waiting.length}{" "}
            waiting on the next drop.
          </p>

          {withPhotos.length > 0 ? (
            <ul className="grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {withPhotos.map((county, i) => {
                const album = bySlug.get(county.slug);
                if (!album) return null;
                return (
                  <li key={county.slug}>
                    <ScrollReveal delay={Math.min(i * 30, 240)} yOffset={8}>
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
                              {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <h2 className="mt-16 font-heading text-xl font-bold text-kelly-ink md:text-2xl">All 75 counties</h2>
          <p className="mt-2 max-w-2xl font-body text-sm text-kelly-slate">
            Empty cards are reserved. They fill when that county folder is added.
          </p>
          <ul className="mt-8 grid list-none grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {ARKANSAS_COUNTY_REGISTRY.map((county) => {
              const album = bySlug.get(county.slug);
              const short = county.displayName.replace(/\s+County$/i, "");
              if (album) {
                return (
                  <li key={county.slug}>
                    <Link
                      href={`/campaign-photos/${album.countySlug}`}
                      className="block rounded-md border border-kelly-navy/20 bg-white px-3 py-2 font-body text-sm font-semibold text-kelly-navy hover:border-kelly-navy/40 focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                    >
                      {short}
                      <span className="ml-1 font-normal text-kelly-slate">({album.photoCount})</span>
                    </Link>
                  </li>
                );
              }
              return (
                <li
                  key={county.slug}
                  className="rounded-md border border-dashed border-kelly-ink/15 bg-kelly-fog/40 px-3 py-2 font-body text-sm text-kelly-slate/80"
                >
                  {short}
                </li>
              );
            })}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
