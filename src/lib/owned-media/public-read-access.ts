import { OwnedMediaReviewStatus, type OwnedMediaAsset } from "@prisma/client";

/** Matches county vault + public gallery publish rules. */
export function canPublicReadOwnedMedia(asset: Pick<OwnedMediaAsset, "isPublic" | "reviewStatus" | "approvedForPublicSite">): boolean {
  if (asset.approvedForPublicSite) return true;
  return asset.isPublic && asset.reviewStatus === OwnedMediaReviewStatus.APPROVED;
}
