import Image from "next/image";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { trailPhotoWittyCaption } from "@/content/media/campaign-trail-wit";
import { cn } from "@/lib/utils";

export type EditorialCampaignPhotoProps = {
  photo: Pick<CampaignTrailPhoto, "id" | "src" | "alt" | "caption">;
  /** Breakout = chapter-style width; inline = sits in reading column; thumb = dense grid cell; fluid = full width, natural height (object-contain). */
  variant?: "breakout" | "inline" | "thumb" | "fluid";
  kicker?: string;
  /** Shown under the image; overrides the default witty trail caption for this still. */
  caption?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Editorial still — tight crop, light shadow, caption discipline (political / newsroom pattern:
 * one moment per figure, hierarchy from typography not heavy frames).
 */
export function EditorialCampaignPhoto({
  photo,
  variant = "inline",
  kicker,
  caption,
  priority,
  className,
}: EditorialCampaignPhotoProps) {
  const cap = trailPhotoWittyCaption(photo, caption);
  const unoptimized = photo.src.includes("/api/owned-campaign-media/");

  const figure = (
    <figure
      className={cn(
        "group",
        variant === "breakout" && "mx-auto w-full max-w-[min(100%,56rem)]",
        variant === "inline" && "mx-auto w-full max-w-xl",
        variant === "thumb" && "w-full",
        variant === "fluid" && "mx-auto w-full max-w-[min(100%,56rem)]",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-md bg-deep-soil/[0.06] shadow-[0_2px_24px_rgba(28,25,23,0.08)] ring-1 ring-deep-soil/[0.06]",
          variant === "breakout" && "aspect-[16/10] sm:aspect-[21/9]",
          variant === "inline" && "aspect-[4/3]",
          variant === "thumb" && "aspect-[4/3]",
          variant === "fluid" && "w-full",
        )}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1600}
          height={1000}
          priority={priority}
          unoptimized={unoptimized}
          sizes={
            variant === "fluid"
              ? "(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 56rem"
              : variant === "breakout"
                ? "(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 56rem"
                : variant === "thumb"
                  ? "(max-width: 640px) 100vw, 280px"
                  : "(max-width: 768px) 100vw, 36rem"
          }
          className={cn(
            "w-full transition duration-300 group-hover:brightness-[1.02]",
            variant === "fluid" ? "h-auto object-contain" : "h-full object-cover",
          )}
        />
      </div>
      <figcaption className="mt-3 max-w-none border-l-2 border-red-dirt/35 pl-3">
        {kicker ? (
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-deep-soil/50">{kicker}</p>
        ) : null}
        <p className={cn("font-body leading-snug text-deep-soil/75", kicker ? "mt-1 text-sm" : "text-sm")}>{cap}</p>
      </figcaption>
    </figure>
  );

  return figure;
}

type EditorialPhotoPairProps = {
  left: Pick<CampaignTrailPhoto, "id" | "src" | "alt" | "caption">;
  right: Pick<CampaignTrailPhoto, "id" | "src" | "alt" | "caption">;
  kicker?: string;
  caption?: string;
  className?: string;
};

export function EditorialPhotoPair({ left, right, kicker, caption, className }: EditorialPhotoPairProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[min(100%,56rem)]", className)}>
      {(kicker || caption) && (
        <div className="mb-4 max-w-2xl border-l-2 border-red-dirt/35 pl-3">
          {kicker ? (
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-deep-soil/50">{kicker}</p>
          ) : null}
          {caption ? <p className="mt-1 font-body text-sm leading-snug text-deep-soil/75">{caption}</p> : null}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <EditorialCampaignPhoto photo={left} variant="thumb" />
        <EditorialCampaignPhoto photo={right} variant="thumb" />
      </div>
    </div>
  );
}
