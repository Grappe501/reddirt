import { OwnedMediaKind, OwnedMediaReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";

const BRIEFING_TAG = "campaign-briefing";
const COMMS_TAG = "campaign-comms";
/** Field / volunteer training: voter reg, community support flows, etc. */
const COMMUNITY_TRAINING_TAG = "community-support-training";

export type PublicBriefingDoc = {
  id: string;
  title: string;
  fileName: string;
  kind: OwnedMediaKind;
  downloadHref: string;
  createdAt: Date;
  description: string | null;
};

/**
 * SoS / campaign “record room”: approved public files ingested from briefing or comms zips (or admin).
 * Includes documents (Word/PDF) and record-approved images (logos, etc.); also community / field training.
 */
export async function listPublicCampaignBriefings(): Promise<PublicBriefingDoc[]> {
  const rows = await prisma.ownedMediaAsset.findMany({
    where: {
      kind: { in: [OwnedMediaKind.DOCUMENT, OwnedMediaKind.IMAGE, OwnedMediaKind.VIDEO, OwnedMediaKind.AUDIO] },
      reviewStatus: OwnedMediaReviewStatus.APPROVED,
      isPublic: true,
      issueTags: { hasSome: [BRIEFING_TAG, COMMS_TAG, COMMUNITY_TRAINING_TAG] },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      fileName: true,
      kind: true,
      description: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    fileName: r.fileName,
    kind: r.kind,
    downloadHref: getOwnedFilePublicPath(r.id),
    createdAt: r.createdAt,
    description: r.description,
  }));
}

export { BRIEFING_TAG, COMMS_TAG, COMMUNITY_TRAINING_TAG };
