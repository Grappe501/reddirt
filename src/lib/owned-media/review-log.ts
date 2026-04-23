import type { OwnedMediaColorLabel, OwnedMediaPickStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Fields triaged in Media Center that we diff for `OwnedMediaReviewLog`. */
export type MediaCenterGovernanceSnapshot = {
  rating: number | null;
  pickStatus: OwnedMediaPickStatus;
  colorLabel: OwnedMediaColorLabel;
  isFavorite: boolean;
  approvedForPress: boolean;
  approvedForPublicSite: boolean;
  approvedForSocial: boolean;
  reviewNotes: string | null;
  staffReviewNotes: string | null;
};

export async function logMediaCenterGovernanceDiffs(
  userId: string | null,
  ownedMediaId: string,
  before: MediaCenterGovernanceSnapshot,
  after: MediaCenterGovernanceSnapshot
): Promise<void> {
  if (before.isFavorite !== after.isFavorite) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.FAVORITE,
      fromSnapshot: { isFavorite: before.isFavorite },
      toSnapshot: { isFavorite: after.isFavorite },
    });
  }
  if (before.pickStatus !== after.pickStatus) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.PICK_STATUS,
      fromSnapshot: { pickStatus: before.pickStatus },
      toSnapshot: { pickStatus: after.pickStatus },
    });
  }
  if (before.colorLabel !== after.colorLabel) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.COLOR_LABEL,
      fromSnapshot: { colorLabel: before.colorLabel },
      toSnapshot: { colorLabel: after.colorLabel },
    });
  }
  if (before.approvedForPress !== after.approvedForPress) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.APPROVED_PRESS,
      fromSnapshot: { approvedForPress: before.approvedForPress },
      toSnapshot: { approvedForPress: after.approvedForPress },
    });
  }
  if (before.approvedForPublicSite !== after.approvedForPublicSite) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.APPROVED_PUBLIC_SITE,
      fromSnapshot: { approvedForPublicSite: before.approvedForPublicSite },
      toSnapshot: { approvedForPublicSite: after.approvedForPublicSite },
    });
  }
  if (before.approvedForSocial !== after.approvedForSocial) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.APPROVED_SOCIAL,
      fromSnapshot: { approvedForSocial: before.approvedForSocial },
      toSnapshot: { approvedForSocial: after.approvedForSocial },
    });
  }
  if (before.rating !== after.rating) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.RATING,
      fromSnapshot: { rating: before.rating },
      toSnapshot: { rating: after.rating },
    });
  }
  if (before.reviewNotes !== after.reviewNotes) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.REVIEW_NOTES,
      fromSnapshot: { reviewNotes: before.reviewNotes },
      toSnapshot: { reviewNotes: after.reviewNotes },
    });
  }
  if (before.staffReviewNotes !== after.staffReviewNotes) {
    await appendOwnedMediaReviewLog({
      ownedMediaId,
      userId,
      action: OwnedMediaReviewAction.STAFF_REVIEW_NOTES,
      fromSnapshot: { staffReviewNotes: before.staffReviewNotes },
      toSnapshot: { staffReviewNotes: after.staffReviewNotes },
    });
  }
}

/** Keys stored in `OwnedMediaReviewLog.action` for governance / triage. */
export const OwnedMediaReviewAction = {
  FAVORITE: "FAVORITE",
  PICK_STATUS: "PICK_STATUS",
  COLOR_LABEL: "COLOR_LABEL",
  APPROVED_PRESS: "APPROVED_PRESS",
  APPROVED_PUBLIC_SITE: "APPROVED_PUBLIC_SITE",
  APPROVED_SOCIAL: "APPROVED_SOCIAL",
  RATING: "RATING",
  REVIEW_NOTES: "REVIEW_NOTES",
  STAFF_REVIEW_NOTES: "STAFF_REVIEW_NOTES",
  MARK_REVIEWED: "MARK_REVIEWED",
  CLEAR_REVIEWED: "CLEAR_REVIEWED",
  COLLECTION_ADD: "COLLECTION_ADD",
  BULK_GOVERNANCE: "BULK_GOVERNANCE",
} as const;

export type OwnedMediaReviewActionKey = (typeof OwnedMediaReviewAction)[keyof typeof OwnedMediaReviewAction];

export async function appendOwnedMediaReviewLog(params: {
  ownedMediaId: string;
  userId: string | null;
  action: string;
  fromSnapshot?: Prisma.InputJsonValue;
  toSnapshot?: Prisma.InputJsonValue;
  note?: string | null;
}): Promise<void> {
  try {
    await prisma.ownedMediaReviewLog.create({
      data: {
        ownedMediaId: params.ownedMediaId,
        userId: params.userId,
        action: params.action,
        fromSnapshot: params.fromSnapshot ?? undefined,
        toSnapshot: params.toSnapshot ?? undefined,
        note: params.note ?? undefined,
      },
    });
  } catch {
    // Non-fatal: persistence should not block triage if log table is unavailable.
  }
}
