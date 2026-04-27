import Image from "next/image";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { DEMOCRACY_SPLIT_TRAIL_PHOTO_ID, LABOR_SPLIT_TRAIL_PHOTO_ID } from "@/content/home/split-section-visuals";
import { media } from "@/content/media/registry";
import type { HomepageSplitCopy } from "@/lib/content/homepage-merge";
import type { MediaRef } from "@/content/media/registry";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";
import { trailPhotoWittyCaption } from "@/content/media/campaign-trail-wit";

export type HomeSplitSectionProps = {
  variant: "democracy" | "labor";
  copy: HomepageSplitCopy;
};

const SPLIT_MEDIA: Record<HomeSplitSectionProps["variant"], MediaRef> = {
  democracy: media.splitDemocracy,
  labor: media.splitLabor,
};

function SplitTrailVisual({
  photoId,
  fallbackMedia,
  fallbackWarmOverlay = false,
}: {
  photoId: string;
  fallbackMedia: MediaRef;
  fallbackWarmOverlay?: boolean;
}) {
  const photo = campaignTrailPhotos.find((p) => p.id === photoId);
  if (!photo) {
    return (
      <ContentImage media={fallbackMedia} warmOverlay={fallbackWarmOverlay} className="absolute inset-0 min-h-full" />
    );
  }
  const caption = trailPhotoWittyCaption(photo);
  const unoptimized = photo.src.includes("/api/owned-campaign-media/");
  return (
    <>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 50vw"
        unoptimized={unoptimized}
        priority={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kelly-navy/55 via-transparent to-kelly-navy/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-kelly-navy/92 via-kelly-navy/65 to-transparent px-4 pb-3 pt-16">
        <p className="line-clamp-3 text-left font-body text-[11px] leading-snug text-kelly-mist/95 md:text-xs">
          {caption}
        </p>
      </div>
    </>
  );
}

export function HomeSplitSection({ variant, copy }: HomeSplitSectionProps) {
  const image = SPLIT_MEDIA[variant];
  const kicker = copy.kicker ?? (variant === "democracy" ? "Direct democracy" : "Filings & records");
  const title = copy.title ?? "";
  const body = copy.body ?? "";
  const bullets = copy.bullets ?? [];

  return (
    <section
      className="bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby={`split-${variant}-heading`}
    >
      <ContentContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeInWhenVisible className="order-2 lg:order-1">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">{kicker}</p>
            <h2
              id={`split-${variant}-heading`}
              className="mt-4 font-heading text-[clamp(1.65rem,3.2vw,2.35rem)] font-bold leading-tight tracking-tight text-kelly-ink"
            >
              {title}
            </h2>
            {body ? (
              <p className="mt-6 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">{body}</p>
            ) : null}
            {bullets.length > 0 ? (
              <ul className="mt-8 space-y-3 font-body text-base leading-relaxed text-kelly-slate/95">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-3 rounded-lg border border-kelly-ink/8 bg-kelly-fog/40 px-4 py-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kelly-gold" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </FadeInWhenVisible>
          <FadeInWhenVisible className="order-1 lg:order-2" delay={0.08}>
            <div className="relative min-h-[260px] overflow-hidden rounded-card border border-kelly-ink/10 shadow-[var(--shadow-card)] lg:min-h-[380px]">
              {variant === "democracy" ? (
                <SplitTrailVisual
                  photoId={DEMOCRACY_SPLIT_TRAIL_PHOTO_ID}
                  fallbackMedia={media.splitDemocracy}
                  fallbackWarmOverlay
                />
              ) : (
                <SplitTrailVisual photoId={LABOR_SPLIT_TRAIL_PHOTO_ID} fallbackMedia={media.splitLabor} />
              )}
            </div>
          </FadeInWhenVisible>
        </div>
      </ContentContainer>
    </section>
  );
}
