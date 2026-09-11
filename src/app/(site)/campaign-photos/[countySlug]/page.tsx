import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { homepagePhotoObjectPositionClass } from "@/content/media/homepage-campaign-photo-display";
import { getCountyAlbumBySlugLive, listCountyAlbumSlugsLive } from "@/lib/campaign-media/county-albums-live";
import {
  countyAlbumJsonLd,
  publicPhotoAlt,
  publicPhotoCaption,
  publicPhotoTitle,
} from "@/lib/campaign-media/photo-public-seo";
import { pageMeta } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ countySlug: string }> };

export function generateStaticParams() {
  return listCountyAlbumSlugsLive().map((countySlug) => ({ countySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const album = getCountyAlbumBySlugLive(countySlug);
  if (!album) {
    return pageMeta({
      title: "County album",
      description: "Campaign photo album",
      path: `/campaign-photos/${countySlug}`,
    });
  }
  return pageMeta({
    title: `${album.shortName} County Campaign Photos`,
    description: `Photos of Kelly Grappe campaigning in ${album.countyDisplayName}, Arkansas. ${album.photoCount} trail photos from the campaign for Arkansas Secretary of State.`,
    path: `/campaign-photos/${album.countySlug}`,
    imageSrc: album.cover.src,
  });
}

export default async function CountyCampaignPhotosPage({ params }: Props) {
  const { countySlug } = await params;
  const album = getCountyAlbumBySlugLive(countySlug);
  if (!album) notFound();
  const singleGroup = album.events.length === 1;
  const unnamedTrail = (name: string) => /^from the trail|open trail$/i.test(name);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(countyAlbumJsonLd(album)) }}
      />
      <PageHero
        eyebrow="County album"
        title={album.countyDisplayName}
        subtitle={`${album.photoCount} photos of Kelly Grappe campaigning in ${album.shortName} County, Arkansas.`}
      >
        <Button href="/campaign-photos" variant="outline">
          All county albums
        </Button>
        <Button href="/about/journey" variant="primary">
          Kelly Across Arkansas
        </Button>
      </PageHero>

      <FullBleedSection padY className="bg-gradient-to-b from-kelly-fog/80 via-white to-kelly-wash/40">
        <ContentContainer>
          {!singleGroup ? (
            <nav aria-label="Albums in this county" className="mb-12 flex flex-wrap gap-2">
              {album.events.map((ev) => (
                <a
                  key={ev.eventSlug}
                  href={`#${ev.eventSlug}`}
                  className="rounded-md border border-kelly-ink/12 bg-white/90 px-3 py-1.5 font-body text-sm font-semibold text-kelly-navy transition hover:border-kelly-navy/40 hover:bg-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                >
                  {ev.eventName}
                  <span className="ml-1.5 text-kelly-slate/60">({ev.photos.length})</span>
                </a>
              ))}
            </nav>
          ) : null}

          <div className="space-y-20 md:space-y-28">
            {album.events.map((ev, ei) => (
              <section key={ev.eventSlug} id={ev.eventSlug} className="scroll-mt-28">
                {!singleGroup || !unnamedTrail(ev.eventName) ? (
                  <ScrollReveal yOffset={8} delay={ei * 20}>
                    <header className="mb-8 max-w-2xl">
                      <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
                        {unnamedTrail(ev.eventName) ? album.countyDisplayName : ev.eventName}
                      </h2>
                    </header>
                  </ScrollReveal>
                ) : null}

                <ul className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {ev.photos.map((photo, pi) => (
                    <li key={photo.id}>
                      <ScrollReveal delay={40 + pi * 30} yOffset={6}>
                        <figure className="overflow-hidden rounded-lg border border-kelly-ink/10 bg-white shadow-sm">
                          <div className="relative aspect-[4/5] bg-kelly-fog">
                            <Image
                              src={photo.src}
                              alt={publicPhotoAlt(photo, { index: pi, total: ev.photos.length })}
                              title={publicPhotoTitle(photo)}
                              width={photo.basic.width ?? 768}
                              height={photo.basic.height ?? 1024}
                              className={cn(
                                "h-full w-full object-cover",
                                homepagePhotoObjectPositionClass(photo),
                              )}
                              sizes="(max-width: 640px) 100vw, 33vw"
                            />
                          </div>
                          <figcaption className="space-y-1 p-4">
                            <p className="font-body text-sm leading-relaxed text-kelly-slate">
                              {publicPhotoCaption(photo, { index: pi, total: ev.photos.length })}
                            </p>
                          </figcaption>
                        </figure>
                      </ScrollReveal>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="mt-16 text-center font-body text-sm text-kelly-slate">
            <Link href="/campaign-photos" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
              ← Back to all county albums
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
