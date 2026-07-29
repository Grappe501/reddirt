import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import {
  homepagePhotoCountyHref,
  homepagePhotoObjectPositionClass,
  listHomepageCampaignPhotos,
} from "@/content/media/homepage-campaign-photos";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trustFunnelCardClass, trustFunnelCtaOutline } from "@/components/home/trust-funnel/trustFunnelChrome";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.campaignPhotos;

/**
 * Latest Campaign Photos — curated FEATURE stills from the file-backed registry (Slice 2).
 */
export function TrustFunnelCampaignPhotosSection() {
  const photos = listHomepageCampaignPhotos();
  if (photos.length === 0) return null;

  return (
    <section
      id="campaign-photos"
      className="border-t border-kelly-ink/10 bg-kelly-wash/50 py-section-y lg:py-section-y-lg"
      aria-labelledby="campaign-photos-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-2xl text-center" yOffset={6}>
          <h2 id="campaign-photos-heading" className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate md:text-lg">{copy.intro}</p>
        </ScrollReveal>

        <ul className="mt-10 grid list-none gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photo, i) => {
            const countyHref = homepagePhotoCountyHref(photo);
            const placeBits = [
              photo.campaign.city !== "Unknown" ? photo.campaign.city : null,
              photo.campaign.county !== "Unknown" ? `${photo.campaign.county} County` : null,
            ].filter(Boolean);
            const placeLabel = placeBits.length > 0 ? placeBits.join(" · ") : null;

            return (
              <ScrollReveal key={photo.id} delay={40 + i * 35} yOffset={6}>
                <li className={cn(trustFunnelCardClass, "flex h-full flex-col")}>
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

        <ScrollReveal delay={60} className="mt-10 flex justify-center" yOffset={6}>
          <Link href="/campaign-photos" className={trustFunnelCtaOutline}>
            View Campaign Photos
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
