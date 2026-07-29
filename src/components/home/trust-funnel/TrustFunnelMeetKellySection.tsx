"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import {
  homepagePhotoCountyHref,
  homepagePhotoObjectPositionClass,
} from "@/content/media/homepage-campaign-photos";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trustFunnelCardClass, trustFunnelCtaNavy } from "@/components/home/trust-funnel/trustFunnelChrome";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.meetKelly;

/** Concise Meet Kelly preview — optional trail still from Slice 2 curation. */
export function TrustFunnelMeetKellySection({ photo }: { photo?: CampaignPhotoRecord | null }) {
  const countyHref = photo ? homepagePhotoCountyHref(photo) : null;

  return (
    <section
      id="meet-kelly"
      className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="meet-kelly-heading"
    >
      <ContentContainer>
        <div className={photo ? "grid items-center gap-10 lg:grid-cols-2 lg:gap-12" : undefined}>
          {photo ? (
            <ScrollReveal className="order-2 lg:order-1" yOffset={6}>
              <figure className={cn(trustFunnelCardClass, "bg-kelly-fog")}>
                <div className="relative aspect-[4/5] w-full sm:aspect-[5/6]">
                  <Image
                    src={photo.src}
                    alt={photo.accessibility.altText}
                    width={photo.basic.width ?? 768}
                    height={photo.basic.height ?? 1024}
                    className={cn("h-full w-full object-cover", homepagePhotoObjectPositionClass(photo))}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <figcaption className="border-t border-kelly-ink/10 px-4 py-3.5 font-body text-sm leading-relaxed text-kelly-slate">
                  {photo.accessibility.caption}
                  {countyHref ? (
                    <>
                      {" "}
                      <Link
                        href={countyHref}
                        className="font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 hover:decoration-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                      >
                        {photo.campaign.county} County
                      </Link>
                    </>
                  ) : null}
                </figcaption>
              </figure>
            </ScrollReveal>
          ) : null}

          <ScrollReveal
            yOffset={6}
            className={
              photo
                ? "order-1 mx-auto max-w-xl text-center lg:order-2 lg:mx-0 lg:text-left"
                : "mx-auto max-w-2xl text-center"
            }
          >
            <h2 id="meet-kelly-heading" className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">
              {copy.title}
            </h2>
            <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">{copy.intro}</p>
            <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate/95">{copy.body}</p>
            <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate/90">{copy.values}</p>
            <div className={photo ? "mt-8 flex justify-center lg:justify-start" : "mt-8 flex justify-center"}>
              <Link href={copy.ctaHref} className={trustFunnelCtaNavy}>
                {copy.cta}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </ContentContainer>
    </section>
  );
}
