"use server";

import { revalidatePath } from "next/cache";
import { FestivalIngestReviewStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { FESTIVAL_REVIEW_FORM_REDIRECT_BASES } from "@/app/admin/workbench-festival-constants";

function revalidateFestivalSurfaces() {
  revalidatePath("/from-the-road");
  revalidatePath("/events");
  revalidatePath("/admin/workbench/festivals");
  revalidatePath("/admin/events/community-suggestions");
  revalidatePath("/admin/events");
}

function redirectAfterAction(formData: FormData, query: string) {
  const next = String(formData.get("next") ?? "").trim();
  const base = FESTIVAL_REVIEW_FORM_REDIRECT_BASES.includes(next as (typeof FESTIVAL_REVIEW_FORM_REDIRECT_BASES)[number]) ? next : "/admin/workbench/festivals";
  redirect(`${base}${query}`);
}

/** Approve for public /from-the-road community feed. */
export async function approveArkansasFestivalIngestAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirectAfterAction(formData, "?error=id");
  await prisma.arkansasFestivalIngest.update({
    where: { id },
    data: {
      reviewStatus: FestivalIngestReviewStatus.APPROVED,
      isVisibleOnSite: true,
    },
  });
  revalidateFestivalSurfaces();
  redirectAfterAction(formData, "?ok=approved");
}

/** Keep approved but remove from public feed. */
export async function hideArkansasFestivalFromPublicFeedAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirectAfterAction(formData, "?error=id");
  await prisma.arkansasFestivalIngest.update({
    where: { id },
    data: { isVisibleOnSite: false },
  });
  revalidateFestivalSurfaces();
  redirectAfterAction(formData, "?ok=hidden");
}

/** Show on site (must already be APPROVED). */
export async function showArkansasFestivalOnPublicFeedAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirectAfterAction(formData, "?error=id");
  await prisma.arkansasFestivalIngest.update({
    where: { id },
    data: { isVisibleOnSite: true, reviewStatus: FestivalIngestReviewStatus.APPROVED },
  });
  revalidateFestivalSurfaces();
  redirectAfterAction(formData, "?ok=visible");
}

export async function rejectArkansasFestivalIngestAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirectAfterAction(formData, "?error=id");
  await prisma.arkansasFestivalIngest.update({
    where: { id },
    data: {
      reviewStatus: FestivalIngestReviewStatus.REJECTED,
      isVisibleOnSite: false,
    },
  });
  revalidateFestivalSurfaces();
  redirectAfterAction(formData, "?ok=rejected");
}

/** Back to triage. */
export async function resetArkansasFestivalReviewAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirectAfterAction(formData, "?error=id");
  await prisma.arkansasFestivalIngest.update({
    where: { id },
    data: {
      reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW,
      isVisibleOnSite: false,
    },
  });
  revalidateFestivalSurfaces();
  redirectAfterAction(formData, "?ok=reset");
}
