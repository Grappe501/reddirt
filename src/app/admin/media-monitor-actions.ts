"use server";

import { revalidatePath } from "next/cache";
import { ExternalMediaReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { indexExternalMediaMentionSearch } from "@/lib/media-monitor/index-mention-search";

function parseReview(s: string): ExternalMediaReviewStatus {
  return Object.values(ExternalMediaReviewStatus).includes(s as ExternalMediaReviewStatus)
    ? (s as ExternalMediaReviewStatus)
    : ExternalMediaReviewStatus.PENDING;
}

export async function updateExternalMediaMentionAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const reviewStatus = parseReview(String(formData.get("reviewStatus") ?? "PENDING"));
  const showOnPublicSite = formData.get("showOnPublicSite") === "on";
  const markForSocialShare = formData.get("markForSocialShare") === "on";
  const markForEmailRoundup = formData.get("markForEmailRoundup") === "on";
  const markForSurrogateAmplification = formData.get("markForSurrogateAmplification") === "on";
  const responseNeeded = formData.get("responseNeeded") === "on";
  const needsAmplification = formData.get("needsAmplification") === "on";
  const campaignSummary = String(formData.get("campaignSummary") ?? "").trim() || null;
  const relatedCountyId = String(formData.get("relatedCountyId") ?? "").trim() || null;
  const relatedEventId = String(formData.get("relatedEventId") ?? "").trim() || null;

  await prisma.externalMediaMention.update({
    where: { id },
    data: {
      reviewStatus,
      showOnPublicSite,
      markForSocialShare,
      markForEmailRoundup,
      markForSurrogateAmplification,
      responseNeeded,
      needsAmplification,
      campaignSummary,
      relatedCountyId: relatedCountyId || null,
      relatedEventId: relatedEventId || null,
    },
  });

  await indexExternalMediaMentionSearch(id);
  revalidatePath("/admin/media-monitor");
  revalidatePath("/admin/workbench");
  revalidatePath("/press-coverage");
}
