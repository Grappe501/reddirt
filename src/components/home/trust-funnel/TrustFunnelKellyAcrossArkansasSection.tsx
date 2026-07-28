import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { CampaignVideoFeature } from "@/components/media/CampaignVideoFeature";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import {
  homepagePhotoCountyHref,
  listHomepageAcrossArkansasPhotos,
} from "@/content/media/homepage-campaign-photos";
import { getHomepageAcrossArkansasVideo } from "@/content/media/homepage-campaign-videos";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.acrossArkansas;

/**
 * Kelly Across Arkansas — momentum video + curated trail stills (not an unfiltered feed).
 */
export function TrustFunnelKellyAcrossArkansasSection() {
  const media = getHomepageAcrossArkansasVideo();
  const photos = listHomepageAcrossArkansasPhotos();
  if (!media && photos.length === 0) return null;

  return (
    <section
      id="across-arkansas"
      className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="across-arkansas-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{copy.eyebrow}</p>
          <h2 id="across-arkansas-heading" className="mt-3 font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">{copy.intro}</p>
        </ScrollReveal>

        {media ? (
          <ScrollReveal yOffset={12} className="mt-10">
            <CampaignVideoFeature
              media={media}
              introduction={copy.videoIntroduction}
              headingId="across-arkansas-video-heading"
              preferShortTitle
            />
          </ScrollReveal>
        ) : null}

        {photos.length > 0 ? (
          <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((photo, i) => {
              const countyHref = homepagePhotoCountyHref(photo);
              const placeBits = [
                photo.campaign.city !== "Unknown" ? photo.campaign.city : null,
                photo.campaign.county !== "Unknown" ? `${photo.campaign.county} County` : null,
              ].filter(Boolean);
              const placeLabel = placeBits.length > 0 ? placeBits.join(" · ") : null;

              return (
                <ScrollReveal key={photo.id} delay={40 + i * 35} yOffset={10}>
                  <li className="flex h-full flex-col overflow-hidden rounded-card border border-kelly-ink/10 bg-kelly-fog/40 shadow-sm">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-kelly-fog">
                      <Image
                        src={photo.src}
                        alt={photo.accessibility.altText}
                        width={photo.basic.width ?? 768}
                        height={photo.basic.height ?? 1024}
                        className="h-full w-full object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {placeLabel ? (
                        <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-kelly-gold">
                          {placeLabel}
                        </p>
                      ) : (
                        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-kelly-muted">
                          Location pending confirmation
                        </p>
                      )}
                      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">
                        {photo.accessibility.caption}
                      </p>
                      {countyHref ? (
                        <Link
                          href={countyHref}
                          className="mt-auto pt-3 text-sm font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 transition hover:decoration-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                        >
                          {photo.campaign.county} County →
                        </Link>
                      ) : null}
                    </div>
                  </li>
                </ScrollReveal>
              );
            })}
          </ul>
        ) : null}

        <ScrollReveal delay={60} className="mt-10 flex justify-center">
          <Link
            href={copy.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
          >
            {copy.cta}
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
