/**
 * Public media resolver — components must not query OwnedMediaAsset directly.
 */

import {
  OwnedMediaDerivativeType,
  OwnedMediaReviewStatus,
  type OwnedMediaAsset,
  type PublicMediaPlacement,
} from "@prisma/client";
import { media, type MediaRef } from "@/content/media/registry";
import { prisma } from "@/lib/db";
import { canPublicReadOwnedMedia } from "@/lib/owned-media/public-read-access";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";
import { focalToObjectPosition, resolveEffectiveFocal } from "@/lib/public-media/focal";
import {
  getPublicMediaSlotDefinition,
  isValidPublicMediaSlot,
  type PublicMediaSlotKey,
} from "@/lib/public-media/slot-registry";

export type PublicMediaProvenance = "owned-media" | "static-content-image" | "fallback-placeholder";

export type PublicMediaPresentation = {
  placementId: string | null;
  assetId: string | null;
  mediaKind: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER" | "STATIC";
  sourceUrl: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  objectPosition: string;
  posterUrl: string | null;
  derivativeRole: OwnedMediaDerivativeType | null;
  fallbackUsed: boolean;
  provenance: PublicMediaProvenance;
  publicationStatus: "publishable" | "fallback" | "blocked";
  blockReason?: string;
};

function staticPresentation(
  slotKey: PublicMediaSlotKey,
  reason?: string,
): PublicMediaPresentation {
  const def = getPublicMediaSlotDefinition(slotKey)!;
  const ref: MediaRef = media[def.staticFallbackMediaKey];
  return {
    placementId: null,
    assetId: null,
    mediaKind: "STATIC",
    sourceUrl: ref.src,
    width: ref.width,
    height: ref.height,
    alt: ref.alt,
    caption: null,
    objectPosition: ref.objectPosition ?? "50% 50%",
    posterUrl: null,
    derivativeRole: null,
    fallbackUsed: true,
    provenance: ref.src.includes("placeholder") ? "fallback-placeholder" : "static-content-image",
    publicationStatus: reason ? "fallback" : "fallback",
    blockReason: reason,
  };
}

function publicUrlForAsset(asset: Pick<OwnedMediaAsset, "id" | "publicUrl">): string {
  // Prefer app-routed path — never expose raw storage keys.
  if (asset.publicUrl && asset.publicUrl.startsWith("http") && !asset.publicUrl.includes("supabase")) {
    // Only allow known public CDN URLs; otherwise use gated API route.
  }
  return getOwnedFilePublicPath(asset.id);
}

function isInPublicationWindow(placement: Pick<PublicMediaPlacement, "startAt" | "endAt">, now: Date): boolean {
  if (placement.startAt && placement.startAt > now) return false;
  if (placement.endAt && placement.endAt < now) return false;
  return true;
}

async function findDerivativeChild(
  sourceAssetId: string,
  type: OwnedMediaDerivativeType,
): Promise<OwnedMediaAsset | null> {
  return prisma.ownedMediaAsset.findFirst({
    where: {
      parentAssetId: sourceAssetId,
      derivativeType: type,
      reviewStatus: { not: OwnedMediaReviewStatus.ARCHIVED },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Resolve a typed public slot to a safe presentation object.
 * Fail closed → static ContentImage fallback.
 */
export async function resolvePublicMediaSlot(
  slotKey: string,
  options?: { now?: Date },
): Promise<PublicMediaPresentation> {
  if (!isValidPublicMediaSlot(slotKey)) {
    throw new Error(`Unknown public media slot: ${slotKey}`);
  }

  const def = getPublicMediaSlotDefinition(slotKey)!;
  const now = options?.now ?? new Date();

  let placement: (PublicMediaPlacement & { ownedMediaAsset: OwnedMediaAsset }) | null = null;
  try {
    placement = await prisma.publicMediaPlacement.findUnique({
      where: { pageKey_slotKey: { pageKey: def.pageKey, slotKey } },
      include: { ownedMediaAsset: true },
    });
  } catch {
    // Table missing / migrate not applied — fail closed to static ContentImage.
    return staticPresentation(slotKey, "placement_table_unavailable");
  }

  if (!placement) {
    return staticPresentation(slotKey, "no_placement");
  }
  if (!placement.enabled) {
    return staticPresentation(slotKey, "placement_disabled");
  }
  if (!isInPublicationWindow(placement, now)) {
    return staticPresentation(slotKey, "placement_window");
  }

  const asset = placement.ownedMediaAsset;
  if (!asset) {
    return staticPresentation(slotKey, "asset_missing");
  }
  if (asset.reviewStatus === OwnedMediaReviewStatus.ARCHIVED || asset.reviewStatus === OwnedMediaReviewStatus.REJECTED) {
    return staticPresentation(slotKey, "asset_archived_or_rejected");
  }
  if (!canPublicReadOwnedMedia(asset)) {
    return staticPresentation(slotKey, "not_approved_for_public_site");
  }
  if (!(def.allowedKinds as readonly string[]).includes(asset.kind)) {
    return staticPresentation(slotKey, "kind_not_allowed_for_slot");
  }

  const derivative = await findDerivativeChild(asset.id, def.requiredDerivative);
  const renderAsset = derivative ?? (def.requiredDerivative === "WEB_JPEG" || def.requiredDerivative === "THUMBNAIL" ? asset : null);

  if (!renderAsset) {
    return staticPresentation(slotKey, "derivative_missing");
  }

  // Prefer derivative when present; allow original as safe interim for images only.
  if (!derivative && asset.kind !== "IMAGE") {
    return staticPresentation(slotKey, "derivative_required");
  }

  const focal = resolveEffectiveFocal({
    placementFocalX: placement.focalXOverride,
    placementFocalY: placement.focalYOverride,
    assetFocalX: asset.focalX,
    assetFocalY: asset.focalY,
  });

  const alt =
    placement.altTextOverride?.trim() ||
    asset.title ||
    asset.description ||
    "Campaign photograph";

  return {
    placementId: placement.id,
    assetId: asset.id,
    mediaKind: asset.kind,
    sourceUrl: publicUrlForAsset(renderAsset),
    width: renderAsset.width ?? asset.width ?? 1600,
    height: renderAsset.height ?? asset.height ?? 900,
    alt,
    caption: placement.captionOverride ?? asset.captionDraft ?? null,
    objectPosition: focalToObjectPosition(focal.x, focal.y),
    posterUrl: null,
    derivativeRole: derivative ? def.requiredDerivative : null,
    fallbackUsed: !derivative,
    provenance: "owned-media",
    publicationStatus: "publishable",
    blockReason: derivative ? undefined : "using_source_until_derivative_ready",
  };
}
