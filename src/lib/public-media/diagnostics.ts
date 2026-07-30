/**
 * Safe media diagnostics for Phase 1 — no private URLs or secrets.
 */

import { OwnedMediaDerivativeType, OwnedMediaReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { listAllPublicMediaSlots } from "@/lib/public-media/slot-registry";
import { resolvePublicMediaSlot } from "@/lib/public-media/resolve-slot";

export type PublicMediaDiagnostics = {
  publicApprovedAssets: number;
  assetsMissingFocal: number;
  activePlacements: number;
  invalidPlacements: number;
  blockedByApproval: number;
  blockedByMissingDerivative: number;
  webDerivativeReady: number;
  thumbDerivativeReady: number;
  slotsUsingStaticFallback: string[];
  slotsResolvingOwnedMedia: string[];
};

export async function collectPublicMediaDiagnostics(): Promise<PublicMediaDiagnostics> {
  const empty: PublicMediaDiagnostics = {
    publicApprovedAssets: 0,
    assetsMissingFocal: 0,
    activePlacements: 0,
    invalidPlacements: 0,
    blockedByApproval: 0,
    blockedByMissingDerivative: 0,
    webDerivativeReady: 0,
    thumbDerivativeReady: 0,
    slotsUsingStaticFallback: listAllPublicMediaSlots().map((s) => s.slotKey),
    slotsResolvingOwnedMedia: [],
  };

  try {
    const [publicApprovedAssets, assetsMissingFocal, activePlacements, webDerivativeReady, thumbDerivativeReady] =
      await Promise.all([
        prisma.ownedMediaAsset.count({ where: { approvedForPublicSite: true } }),
        prisma.ownedMediaAsset.count({
          where: {
            approvedForPublicSite: true,
            OR: [{ focalX: null }, { focalY: null }],
          },
        }),
        prisma.publicMediaPlacement.count({ where: { enabled: true } }),
        prisma.ownedMediaAsset.count({ where: { derivativeType: OwnedMediaDerivativeType.WEB_JPEG } }),
        prisma.ownedMediaAsset.count({ where: { derivativeType: OwnedMediaDerivativeType.THUMBNAIL } }),
      ]);

    const placements = await prisma.publicMediaPlacement.findMany({
      where: { enabled: true },
      include: { ownedMediaAsset: true },
    });

    let invalidPlacements = 0;
    let blockedByApproval = 0;
    let blockedByMissingDerivative = 0;

    for (const p of placements) {
      const asset = p.ownedMediaAsset;
      if (!asset || asset.reviewStatus === OwnedMediaReviewStatus.ARCHIVED) {
        invalidPlacements += 1;
        continue;
      }
      if (!asset.approvedForPublicSite) {
        blockedByApproval += 1;
      }
      const web = await prisma.ownedMediaAsset.findFirst({
        where: { parentAssetId: asset.id, derivativeType: OwnedMediaDerivativeType.WEB_JPEG },
        select: { id: true },
      });
      if (!web) blockedByMissingDerivative += 1;
    }

    const slotsUsingStaticFallback: string[] = [];
    const slotsResolvingOwnedMedia: string[] = [];
    for (const slot of listAllPublicMediaSlots()) {
      const resolved = await resolvePublicMediaSlot(slot.slotKey);
      if (resolved.provenance === "owned-media") slotsResolvingOwnedMedia.push(slot.slotKey);
      else slotsUsingStaticFallback.push(slot.slotKey);
    }

    return {
      publicApprovedAssets,
      assetsMissingFocal,
      activePlacements,
      invalidPlacements,
      blockedByApproval,
      blockedByMissingDerivative,
      webDerivativeReady,
      thumbDerivativeReady,
      slotsUsingStaticFallback,
      slotsResolvingOwnedMedia,
    };
  } catch {
    return empty;
  }
}
