import Image from "next/image";
import { ContentImage } from "@/components/media/ContentImage";
import { media, type MediaRef } from "@/content/media/registry";
import { resolvePublicMediaSlot } from "@/lib/public-media/resolve-slot";
import type { PublicMediaSlotKey } from "@/lib/public-media/slot-registry";
import { getPublicMediaSlotDefinition } from "@/lib/public-media/slot-registry";
import { cn } from "@/lib/utils";

type Props = {
  slotKey: PublicMediaSlotKey;
  className?: string;
  mediaClassName?: string;
  priority?: boolean;
  sizes?: string;
  warmOverlay?: boolean;
  /** When true, expose provenance as a data attribute for local diagnostics (not for production chrome). */
  showProvenanceAttr?: boolean;
};

/**
 * Transitional public media bridge:
 * 1) Resolve approved OwnedMedia placement for typed slot
 * 2) Else fall back to static ContentImage / MediaRef
 */
export async function PublicSlotImage({
  slotKey,
  className,
  mediaClassName,
  priority,
  sizes,
  warmOverlay,
  showProvenanceAttr = process.env.NODE_ENV !== "production",
}: Props) {
  const resolved = await resolvePublicMediaSlot(slotKey);
  const def = getPublicMediaSlotDefinition(slotKey)!;

  if (resolved.provenance === "owned-media") {
    const unoptimized = resolved.sourceUrl.includes("/api/owned-campaign-media/");
    return (
      <span
        className={cn("relative block h-full w-full overflow-hidden", className)}
        data-media-provenance={showProvenanceAttr ? resolved.provenance : undefined}
        data-media-fallback={showProvenanceAttr ? String(resolved.fallbackUsed) : undefined}
      >
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
      </span>
    );
  }

  const fallback: MediaRef = media[def.staticFallbackMediaKey];
  return (
    <span
      data-media-provenance={showProvenanceAttr ? resolved.provenance : undefined}
      data-media-block-reason={showProvenanceAttr ? resolved.blockReason : undefined}
      className="contents"
    >
      <ContentImage
        media={fallback}
        className={className}
        mediaClassName={mediaClassName}
        priority={priority}
        sizes={sizes}
        warmOverlay={warmOverlay}
        objectPosition={resolved.objectPosition}
      />
    </span>
  );
}
