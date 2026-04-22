/**
 * Reference artifacts for building volunteer onboarding, staff workflow, and volunteer management
 * in the app. Assets are ingested as owned media (community-training lane) and tagged
 * with {@link VOLUNTEER_ONBOARDING_TAG}. Staff: filter in /admin/owned-media or search the campaign brain.
 */
import { prisma } from "@/lib/db";
import { VOLUNTEER_ONBOARDING_TAG } from "@/lib/campaign-briefings/briefing-queries";

export { VOLUNTEER_ONBOARDING_TAG };

export type VolunteerOnboardingReferenceRow = {
  id: string;
  title: string;
  fileName: string;
  description: string | null;
  operatorNotes: string | null;
  updatedAt: Date;
  issueTags: string[];
};

/** Owned media rows tagged for volunteer product work (onboarding, workflows, comms to volunteers). */
export async function listVolunteerOnboardingReferenceAssets(): Promise<VolunteerOnboardingReferenceRow[]> {
  return prisma.ownedMediaAsset.findMany({
    where: { issueTags: { has: VOLUNTEER_ONBOARDING_TAG } },
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
