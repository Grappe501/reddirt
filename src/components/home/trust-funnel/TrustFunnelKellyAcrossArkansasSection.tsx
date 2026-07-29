import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { CampaignVideoFeature } from "@/components/media/CampaignVideoFeature";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import {
  homepagePhotoCountyHref,
  homepagePhotoObjectPositionClass,
  listHomepageAcrossArkansasPhotos,
} from "@/content/media/homepage-campaign-photos";
import { getHomepageAcrossArkansasVideo } from "@/content/media/homepage-campaign-videos";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  trustFunnelCardMutedClass,
  trustFunnelCtaOutline,
} from "@/components/home/trust-funnel/trustFunnelChrome";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.acrossArkansas;

/**
 * Kelly Across Arkansas — trail video + curated stills (evidence of listening method).
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
        <ScrollReveal className="mx-auto max-w-2xl text-center" yOffset={6}>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{copy.eyebrow}</p>
          <h2 id="across-arkansas-heading" className="mt-3 font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">{copy.intro}</p>
        </ScrollReveal>

        {media ? (
          <ScrollReveal yOffset={8} className="mt-10">
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
                <ScrollReveal key={photo.id} delay={40 + i * 35} yOffset={6}>
                  <li className={cn(trustFunnelCardMutedClass, "flex h-full flex-col")}>
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-kelly-fog">
                      <Image
                        src={photo.src}
                        alt={photo.accessibility.altText}
                        width={photo.basic.width ?? 768}
                        height={photo.basic.height ?? 1024}
                        className={cn("h-full w-full object-cover", homepagePhotoObjectPositionClass(photo))}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
                      {placeLabel ? (
                        <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-kelly-gold">
                          {placeLabel}
                        </p>
                      ) : (
                        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-kelly-muted">
                          Location pending confirmation
                        </p>
                      )}
                      <p className="font-body text-sm leading-relaxed text-kelly-slate">{photo.accessibility.caption}</p>
                      {countyHref ? (
                        <Link
                          href={countyHref}
                          className="mt-auto pt-2 text-sm font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 transition hover:decoration-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
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

        <ScrollReveal delay={60} className="mt-10 flex justify-center" yOffset={6}>
          <Link href={copy.ctaHref} className={trustFunnelCtaOutline}>
            {copy.cta}
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
