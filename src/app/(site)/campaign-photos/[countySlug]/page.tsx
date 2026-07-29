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
import { getCountyAlbumBySlug, listCountyAlbumSlugs } from "@/lib/campaign-media/county-albums";
import { pageMeta } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ countySlug: string }> };

export function generateStaticParams() {
  return listCountyAlbumSlugs().map((countySlug) => ({ countySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const album = getCountyAlbumBySlug(countySlug);
  if (!album) {
    return pageMeta({
      title: "County album",
      description: "Campaign photo album",
      path: `/campaign-photos/${countySlug}`,
    });
  }
  return pageMeta({
    title: `${album.shortName} County — Campaign Photos`,
    description: `Trail stills from ${album.countyDisplayName}: ${album.photoCount} photos across ${album.eventCount} stops.`,
    path: `/campaign-photos/${album.countySlug}`,
    imageSrc: album.cover.src,
  });
}

export default async function CountyCampaignPhotosPage({ params }: Props) {
  const { countySlug } = await params;
  const album = getCountyAlbumBySlug(countySlug);
  if (!album) notFound();

  return (
    <>
      <PageHero
        eyebrow="County album"
        title={album.countyDisplayName}
        subtitle={`${album.photoCount} trail stills · ${album.eventCount} ${album.eventCount === 1 ? "stop" : "stops"} — real rooms, real neighbors.`}
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
          <nav aria-label="Stops in this county" className="mb-12 flex flex-wrap gap-2">
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

          <div className="space-y-20 md:space-y-28">
            {album.events.map((ev, ei) => (
              <section key={ev.eventSlug} id={ev.eventSlug} className="scroll-mt-28">
                <ScrollReveal yOffset={8} delay={ei * 20}>
                  <header className="mb-8 max-w-2xl">
                    <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
                      Stop {ei + 1}
                      {ev.city ? ` · ${ev.city}` : ""}
                    </p>
                    <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
                      {ev.eventName}
                    </h2>
                  </header>
                </ScrollReveal>

                <ul className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {ev.photos.map((photo, pi) => (
                    <li key={photo.id}>
                      <ScrollReveal delay={40 + pi * 30} yOffset={6}>
                        <figure className="overflow-hidden rounded-lg border border-kelly-ink/10 bg-white shadow-sm">
                          <div className="relative aspect-[4/5] bg-kelly-fog">
                            <Image
                              src={photo.src}
                              alt={photo.accessibility.altText}
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
                            {photo.campaign.city !== "Unknown" ? (
                              <p className="font-body text-[11px] font-bold uppercase tracking-wide text-kelly-gold">
                                {photo.campaign.city}
                              </p>
                            ) : null}
                            <p className="font-body text-sm leading-relaxed text-kelly-slate">
                              {photo.accessibility.caption}
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
