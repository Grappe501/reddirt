import Image from "next/image";
import { ContentImage } from "@/components/media/ContentImage";
import { media, type MediaRef } from "@/content/media/registry";
import {
  resolvePublicMediaSlot,
  type PublicMediaPresentation,
} from "@/lib/public-media/resolve-slot";
import {
  getPublicMediaSlotDefinition,
  type PublicMediaSlotKey,
} from "@/lib/public-media/slot-registry";
import { cn } from "@/lib/utils";

export type PublicMediaSlotFrameProps = {
  slotKey: PublicMediaSlotKey;
  className?: string;
  mediaClassName?: string;
  priority?: boolean;
  sizes?: string;
  warmOverlay?: boolean;
  /** Force labeled empty frame even when static fallback is a real photo. */
  preferLabeledEmpty?: boolean;
  /** Optional pre-resolved presentation (avoids double DB hit when parent already resolved). */
  presentation?: PublicMediaPresentation;
};

function EmptySlotLabel({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[12rem] w-full flex-col items-start justify-end gap-2 bg-gradient-to-br from-kelly-navy via-kelly-slate to-kelly-ink p-5 sm:min-h-[16rem] sm:p-7",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <p className="font-body text-[0.65rem] font-bold uppercase tracking-[0.2em] text-kelly-gold">Media slot</p>
      <p className="max-w-md font-heading text-lg font-bold leading-snug text-kelly-mist sm:text-xl">{label}</p>
      <p className="max-w-sm font-body text-sm text-kelly-mist/75">
        Assign approved Owned Media in admin · Public placements. Unknown geography stays Unknown.
      </p>
    </div>
  );
}

/**
 * Renders a typed public media slot: owned image/video, honest static still, or labeled empty frame.
 */
export async function PublicMediaSlotFrame({
  slotKey,
  className,
  mediaClassName,
  priority,
  sizes,
  warmOverlay,
  preferLabeledEmpty = false,
  presentation,
}: PublicMediaSlotFrameProps) {
  const resolved = presentation ?? (await resolvePublicMediaSlot(slotKey));
  const def = getPublicMediaSlotDefinition(slotKey)!;
  const showEmpty =
    preferLabeledEmpty ||
    resolved.provenance === "fallback-placeholder" ||
    (resolved.provenance === "static-content-image" && resolved.sourceUrl.includes("placeholder"));

  if (showEmpty && resolved.provenance !== "owned-media") {
    return (
      <span className={cn("relative block h-full w-full overflow-hidden", className)}>
        <EmptySlotLabel label={def.emptySlotLabel} />
      </span>
    );
  }

  if (resolved.mediaKind === "VIDEO" && resolved.provenance === "owned-media") {
    return (
      <span className={cn("relative block h-full w-full overflow-hidden bg-kelly-ink", className)}>
        <video
          className={cn("h-full w-full object-cover", mediaClassName)}
          style={{ objectPosition: resolved.objectPosition }}
          controls
          playsInline
          poster={resolved.posterUrl ?? undefined}
          aria-label={resolved.alt}
        >
          <source src={resolved.sourceUrl} />
        </video>
      </span>
    );
  }

  if (resolved.provenance === "owned-media") {
    const unoptimized = resolved.sourceUrl.includes("/api/owned-campaign-media/");
    return (
      <span className={cn("relative block h-full w-full overflow-hidden", className)}>
        <Image
          src={resolved.sourceUrl}
          alt={resolved.alt}
          width={resolved.width}
          height={resolved.height}
          className={cn("h-full w-full object-cover", mediaClassName)}
          style={{ objectPosition: resolved.objectPosition }}
          sizes={sizes ?? "(max-width: 768px) 100vw, 1200px"}
          priority={priority}
          unoptimized={unoptimized}
        />
        {warmOverlay ? (
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-kelly-navy/[0.12] via-transparent to-kelly-success/[0.08] mix-blend-multiply"
            aria-hidden
          />
        ) : null}
        {resolved.caption ? (
          <figcaption className="sr-only">{resolved.caption}</figcaption>
        ) : null}
      </span>
    );
  }

  const fallback: MediaRef = media[def.staticFallbackMediaKey];
  return (
    <ContentImage
      media={fallback}
      className={className}
      mediaClassName={mediaClassName}
      priority={priority}
      sizes={sizes}
      warmOverlay={warmOverlay}
      objectPosition={resolved.objectPosition}
    />
  );
}
