import Image from "next/image";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { cn } from "@/lib/utils";

type FramedTrailPhotoProps = {
  photo: Pick<CampaignTrailPhoto, "src" | "alt" | "caption">;
  /** Priority load (e.g. first visible on homepage) */
  priority?: boolean;
  className?: string;
};

/**
 * Campaign trail still — gold frame, fits container width, preserves aspect (letterboxed when needed).
 */
export function FramedTrailPhoto({ photo, priority, className }: FramedTrailPhotoProps) {
  return (
    <figure
      className={cn(
        "mx-auto w-full max-w-[min(100%,56rem)] rounded-xl border-[3px] border-civic-gold/40 bg-gradient-to-b from-civic-mist/50 to-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-civic-ink/10",
        className,
      )}
    >
      <div className="relative flex min-h-[12rem] w-full items-center justify-center overflow-hidden rounded-lg bg-civic-ink/[0.04]">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={2000}
          height={1333}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 56rem"
          className="h-auto max-h-[min(75vh,44rem)] w-full object-contain"
        />
      </div>
      {photo.caption ? (
        <figcaption className="mt-3 px-1 text-center font-body text-xs font-medium leading-snug text-civic-slate/80 md:text-sm">
          {photo.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
