"use client";

import Image from "next/image";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import {
  homepagePhotoCountyHref,
  homepagePhotoCaption,
  homepagePhotoObjectPositionClass,
} from "@/content/media/homepage-campaign-photo-display";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trustFunnelCardClass, trustFunnelCtaNavy } from "@/components/home/trust-funnel/trustFunnelChrome";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.meetKelly;

/**
 * Meet Kelly — conversation rhythm (beats + principle), not a continuous document wall.
 * Word content stays within launch targets; layout carries the polish.
 */
export function TrustFunnelMeetKellySection({ photo }: { photo?: CampaignPhotoRecord | null }) {
  const countyHref = photo ? homepagePhotoCountyHref(photo) : null;

  return (
    <section
      id="meet-kelly"
      className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="meet-kelly-heading"
    >
      <ContentContainer>
        <div className={photo ? "grid items-start gap-12 lg:grid-cols-12 lg:gap-14" : undefined}>
          {photo ? (
            <ScrollReveal className="order-2 lg:order-1 lg:col-span-5 lg:sticky lg:top-32" yOffset={4}>
              <figure className={cn(trustFunnelCardClass, "overflow-hidden bg-kelly-fog/80 shadow-none")}>
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={photo.src}
                    alt={photo.accessibility.altText}
                    width={photo.basic.width ?? 768}
                    height={photo.basic.height ?? 1024}
                    className={cn("h-full w-full object-cover", homepagePhotoObjectPositionClass(photo))}
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority={false}
                  />
                </div>
                <figcaption className="border-t border-kelly-ink/8 px-4 py-3 font-body text-sm leading-relaxed text-kelly-slate">
                  {homepagePhotoCaption(photo)}
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
            className={photo ? "order-1 mx-auto max-w-xl lg:order-2 lg:col-span-7 lg:mx-0 lg:max-w-none" : "mx-auto max-w-2xl"}
          >
            <h2
              id="meet-kelly-heading"
              className={cn(
                "font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl",
                photo ? "text-center lg:text-left" : "text-center",
              )}
            >
              {copy.title}
            </h2>

            <blockquote
              className={cn(
                "mt-6 border-l-4 border-kelly-gold pl-4 font-heading text-lg font-semibold leading-snug tracking-tight text-kelly-navy md:text-xl",
                photo ? "text-left" : "mx-auto max-w-xl text-left",
              )}
            >
              {copy.principle}
            </blockquote>

            <ul className="mt-8 space-y-4" role="list">
              {copy.beats.map((beat) => (
                <li
                  key={beat.label}
                  className="border-l-2 border-kelly-gold/70 bg-transparent py-1 pl-4 md:pl-5"
                >
                  <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-gold">
                    {beat.label}
                  </p>
                  <p className="mt-2 font-body text-base leading-relaxed text-kelly-slate md:text-[1.05rem]">
                    {beat.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className={cn("mt-9 flex", photo ? "justify-center lg:justify-start" : "justify-center")}>
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
