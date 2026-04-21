import type { MediaAsset } from "@prisma/client";
import type { MediaRef } from "@/content/media/registry";

export function mediaRefFromAsset(asset: Pick<MediaAsset, "url" | "alt" | "width" | "height">): MediaRef {
  return {
    src: asset.url,
    alt: asset.alt?.trim() || "Media",
    width: asset.width ?? 1200,
    height: asset.height ?? 800,
  };
}
