import Image from "next/image";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { trailPhotoWittyCaption } from "@/content/media/campaign-trail-wit";
import { cn } from "@/lib/utils";

type FramedTrailPhotoProps = {
  photo: Pick<CampaignTrailPhoto, "id" | "src" | "alt" | "caption">;
  /** Priority load (e.g. first visible on homepage) */
  priority?: boolean;
  /** Tighter frame and height — for woven grids, strips, and sidebars */
  density?: "default" | "compact";
  className?: string;
};

/**
 * Campaign trail still — gold frame, fits container width, preserves aspect (letterboxed when needed).
 */
export function FramedTrailPhoto({ photo, priority, density = "default", className }: FramedTrailPhotoProps) {
  const compact = density === "compact";
  const cap = trailPhotoWittyCaption(photo);
  return (
    <figure
      className={cn(
        "mx-auto w-full max-w-[min(100%,56rem)] rounded-xl bg-gradient-to-b from-kelly-mist/50 to-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-kelly-ink/10",
        compact
          ? "border-2 border-kelly-gold/35 p-1.5"
          : "border-[3px] border-kelly-gold/40 p-2",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-kelly-ink/[0.04]",
          compact ? "min-h-[7rem]" : "min-h-[12rem]",
        )}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={2000}
          height={1333}
          priority={priority}
          unoptimized={photo.src.includes("/api/owned-campaign-media/")}
          sizes={
            compact
              ? "(max-width: 640px) 88vw, (max-width: 1200px) 40vw, 480px"
              : "(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 56rem"
          }
          className={cn(
            "h-auto w-full object-contain",
            compact ? "max-h-[min(70vh,18rem)] md:max-h-[min(65vh,22rem)]" : "max-h-[min(75vh,44rem)]",
          )}
        />
      </div>
      <figcaption
        className={cn(
          "px-1 text-center font-body font-medium leading-snug text-kelly-slate/80",
          compact ? "mt-2 text-[10px] md:text-xs" : "mt-3 text-xs md:text-sm",
        )}
      >
        {cap}
      </figcaption>
    </figure>
  );
}
