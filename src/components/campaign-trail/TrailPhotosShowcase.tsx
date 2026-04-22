import Link from "next/link";
import { FramedTrailPhoto } from "@/components/media/FramedTrailPhoto";
import { ContentContainer } from "@/components/layout/ContentContainer";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { cn } from "@/lib/utils";

type TrailPhotosShowcaseProps = {
  photos: CampaignTrailPhoto[];
  /** For in-page anchors (e.g. from-the-road#trail-photos) */
  sectionId?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  /** homepage: tighter grid + link; full: dense gallery */
  variant?: "home" | "full" | "inline";
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

  const body = (
    <>
      {eyebrow ? (
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-civic-gold">{eyebrow}</p>
      ) : null}
      <h2
        id="trail-photos-heading"
        className={cn(
          "font-heading font-bold tracking-tight text-civic-ink",
          variant === "inline" ? "mt-2 text-2xl md:text-3xl" : "mt-4 text-[clamp(1.65rem,3.5vw,2.35rem)]",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-civic-slate md:text-lg">{intro}</p>
      ) : null}

      <div
        className={cn(
          "mt-10",
          variant === "home" &&
            "grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-3 xl:gap-10",
          variant === "full" && "grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-14",
          variant === "inline" && "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {photos.map((p, i) => (
          <FramedTrailPhoto key={p.id} photo={p} priority={variant === "home" && i < 3} />
        ))}
      </div>

      {variant === "home" && moreHref ? (
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

  return (
    <section
      id={sectionId}
      className={cn(
        sectionId ? "scroll-mt-24" : null,
        variant === "inline" ? "py-10 md:py-12" : "border-t border-civic-ink/10 py-14 md:py-20",
        className,
      )}
      aria-labelledby="trail-photos-heading"
    >
      {variant === "home" ? <div className="mx-auto max-w-content px-[var(--gutter-x)]">{body}</div> : null}
      {variant === "full" ? <ContentContainer>{body}</ContentContainer> : null}
      {variant === "inline" ? body : null}
    </section>
  );
}
