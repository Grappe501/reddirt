"use client";

import Image from "next/image";
import Link from "next/link";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { homepagePhotoCountyHref, homepagePhotoObjectPositionClass } from "@/content/media/homepage-campaign-photo-display";
import { cn } from "@/lib/utils";

type Props = {
  photos: CampaignPhotoRecord[];
  title?: string;
  intro?: string;
  className?: string;
};

/**
 * Compact county-confirmed strip for From the Road — links into county albums.
 */
export function StrategicCountyPhotoStrip({
  photos,
  title = "Confirmed counties — photo albums",
  intro = "Evidence-confirmed stills placed by county. Open an album for the event chapters.",
  className,
}: Props) {
  if (photos.length === 0) return null;

  return (
    <section
      id="county-photo-albums"
      className={cn("scroll-mt-24 border-t border-kelly-ink/8 pt-16 md:pt-20", className)}
      aria-label={title}
    >
      <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-slate md:text-lg">{intro}</p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const href = homepagePhotoCountyHref(photo);
          const county = photo.campaign.county !== "Unknown" ? photo.campaign.county : null;
          const city = photo.campaign.city !== "Unknown" ? photo.campaign.city : null;
          const place = city && county ? `${city} · ${county}` : county ? `${county} County` : null;
          return (
            <li key={photo.id}>
              {href ? (
                <Link href={href} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-kelly-fog">
                    <Image
                      src={photo.src}
                      alt={photo.accessibility.altText}
                      fill
                      className={cn(
                        "object-cover transition duration-500 group-hover:scale-[1.02]",
                        homepagePhotoObjectPositionClass(photo),
                      )}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <p className="mt-3 font-heading text-lg font-bold text-kelly-ink group-hover:text-kelly-blue">
                    {place ?? photo.accessibility.caption}
                  </p>
                  {place ? (
                    <p className="mt-1 font-body text-sm text-kelly-slate line-clamp-2">
                      {photo.accessibility.caption}
                    </p>
                  ) : null}
                </Link>
              ) : (
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-kelly-fog">
                    <Image
                      src={photo.src}
                      alt={photo.accessibility.altText}
                      fill
                      className={cn("object-cover", homepagePhotoObjectPositionClass(photo))}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <p className="mt-3 font-heading text-lg font-bold text-kelly-ink">
                    {photo.accessibility.caption}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-8 font-body text-sm text-kelly-slate">
        <Link href="/campaign-photos" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">
          Browse all county albums
        </Link>
      </p>
    </section>
  );
}
