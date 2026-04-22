/**
 * Staff strategy / coordination documents (DNC Playbook, etc.) ingested as non-public owned media
 * and tagged with {@link ADMIN_STRATEGY_REFERENCE_TAG}. Shown on workbench; full list in /admin/owned-media.
 */
import { prisma } from "@/lib/db";
import { ADMIN_STRATEGY_REFERENCE_TAG } from "@/lib/campaign-briefings/briefing-queries";

export { ADMIN_STRATEGY_REFERENCE_TAG };

export type AdminStrategyReferenceRow = {
  id: string;
  title: string;
  fileName: string;
  description: string | null;
  operatorNotes: string | null;
  updatedAt: Date;
  issueTags: string[];
};

export async function listAdminStrategyReferenceAssets(): Promise<AdminStrategyReferenceRow[]> {
  return prisma.ownedMediaAsset.findMany({
    where: { issueTags: { has: ADMIN_STRATEGY_REFERENCE_TAG } },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      fileName: true,
      description: true,
      operatorNotes: true,
      updatedAt: true,
      issueTags: true,
    },
  });
}
