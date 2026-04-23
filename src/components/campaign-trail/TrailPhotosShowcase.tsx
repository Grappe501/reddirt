import Link from "next/link";
import { FramedTrailPhoto } from "@/components/media/FramedTrailPhoto";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { TrailPhotosWovenGrid } from "@/components/campaign-trail/TrailPhotosWovenGrid";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { cn } from "@/lib/utils";

type TrailPhotosShowcaseProps = {
  photos: CampaignTrailPhoto[];
  /** For in-page anchors (e.g. from-the-road#trail-photos) */
  sectionId?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  /**
   * home: woven bento on the landing page
   * full: large two-column gallery (dense pages e.g. from-the-road)
   * inline: legacy uniform grid (prefer woven/strip for new uses)
   * woven: same bento as home but usable inside ContentContainer
   * strip: horizontal scroll of compact frames
   */
  variant?: "home" | "full" | "inline" | "woven" | "strip";
  moreHref?: string;
  moreLabel?: string;
  className?: string;
};

export function TrailPhotosShowcase({
  photos,
  sectionId,
  eyebrow = "On the trail",
  title,
  intro,
  variant = "full",
  moreHref = "/from-the-road#trail-photos",
  moreLabel = "See the full trail gallery",
  className,
}: TrailPhotosShowcaseProps) {
  if (photos.length === 0) return null;

  const headingClass = cn(
    "font-heading font-bold tracking-tight text-civic-ink",
    variant === "inline" || variant === "strip" || variant === "woven"
      ? "mt-2 text-2xl md:text-3xl"
      : "mt-4 text-[clamp(1.65rem,3.5vw,2.35rem)]",
  );

  const media = (() => {
    if (variant === "home" || variant === "woven") {
      return <TrailPhotosWovenGrid photos={photos} priorityFirst={variant === "home" ? 2 : 1} className="mt-8 md:mt-10" />;
    }
    if (variant === "strip") {
      return (
        <div
          className={cn(
            "mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:thin]",
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-civic-ink/20",
          )}
        >
          {photos.map((p, i) => (
            <div key={p.id} className="w-[min(85vw,300px)] flex-shrink-0 snap-start sm:w-[280px]">
              <FramedTrailPhoto photo={p} density="compact" priority={i === 0} />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div
        className={cn(
          "mt-10",
          variant === "full" && "grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-14",
          variant === "inline" && "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {photos.map((p, i) => (
          <FramedTrailPhoto key={p.id} photo={p} priority={variant === "inline" && i < 2} />
        ))}
      </div>
    );
  })();

  const showMoreLink = variant === "home" && moreHref;

  const body = (
    <>
      {eyebrow ? (
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-civic-gold">{eyebrow}</p>
      ) : null}
      <h2 id="trail-photos-heading" className={headingClass}>
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-civic-slate md:text-lg">{intro}</p>
      ) : null}

      {media}

      {showMoreLink ? (
        <p className="mt-12 text-center">
          <Link
            href={moreHref}
            className="inline-flex font-body text-sm font-bold uppercase tracking-[0.18em] text-red-dirt underline-offset-4 hover:underline"
          >
            {moreLabel} →
          </Link>
        </p>
      ) : null}
    </>
  );

  const sectionPad =
    variant === "inline" || variant === "strip" || variant === "woven" ? "py-10 md:py-12" : "border-t border-civic-ink/10 py-14 md:py-20";

  return (
    <section
      id={sectionId}
      className={cn(sectionId ? "scroll-mt-24" : null, sectionPad, className)}
      aria-labelledby="trail-photos-heading"
    >
      {variant === "home" ? <div className="mx-auto max-w-content px-[var(--gutter-x)]">{body}</div> : null}
      {variant === "full" ? <ContentContainer>{body}</ContentContainer> : null}
      {variant === "inline" || variant === "strip" || variant === "woven" ? body : null}
    </section>
  );
}
