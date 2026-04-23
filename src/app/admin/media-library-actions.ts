"use server";

import { revalidatePath } from "next/cache";
import { SocialContentMediaRefPurpose } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getMediaRefsForSocialContentItem, queryMediaLibrary } from "@/lib/media-library/queries";
import type { MediaLibraryListResult } from "@/lib/media-library/dto";
import type { MediaLibraryListFilters } from "@/lib/media-library/types";
import { indexLocalMediaRootsFromEnv } from "@/lib/owned-media/index-local-roots";
import { getAllowedMediaIndexRootsFromEnv } from "@/lib/owned-media/index-local-roots";

export { getAllowedMediaIndexRootsFromEnv } from "@/lib/owned-media/index-local-roots";

export async function listMediaLibraryAction(input: MediaLibraryListFilters): Promise<MediaLibraryListResult> {
  await requireAdminAction();
  return queryMediaLibrary(input);
}

export async function listMediaRefsForSocialItemAction(socialContentItemId: string) {
  await requireAdminAction();
  if (!socialContentItemId) return { ok: true as const, items: [] };
  const items = await getMediaRefsForSocialContentItem(socialContentItemId);
  return { ok: true as const, items };
}

export type AttachResult = { ok: true; refId: string } | { ok: false; error: string };

export async function attachOwnedMediaToSocialAction(
  socialContentItemId: string,
  ownedMediaId: string,
  purpose: SocialContentMediaRefPurpose,
  options?: { socialPlatformVariantId?: string | null; note?: string; confirmUnapproved?: boolean }
): Promise<AttachResult> {
  await requireAdminAction();
  if (!socialContentItemId || !ownedMediaId) {
    return { ok: false, error: "Missing ids." };
  }
  const [item, media] = await Promise.all([
    prisma.socialContentItem.findUnique({ where: { id: socialContentItemId } }),
    prisma.ownedMediaAsset.findUnique({ where: { id: ownedMediaId } }),
  ]);
  if (!item) return { ok: false, error: "Social work item not found." };
  if (!media) return { ok: false, error: "Media not found." };
  if (!media.approvedForSocial && !options?.confirmUnapproved) {
    return { ok: false, error: "UNAPPROVED_NEEDS_CONFIRM" };
  }
  if (options?.socialPlatformVariantId) {
    const v = await prisma.socialPlatformVariant.findFirst({
      where: { id: options.socialPlatformVariantId, socialContentItemId },
    });
    if (!v) return { ok: false, error: "Platform variant not found for this work item." };
  }
  if (purpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT && !options?.socialPlatformVariantId) {
    return { ok: false, error: "Pick a platform variant for this purpose." };
  }
  if (purpose !== SocialContentMediaRefPurpose.PLATFORM_VARIANT) {
    const dup = await prisma.socialContentMediaRef.findFirst({
      where: {
        socialContentItemId,
        ownedMediaId,
        purpose,
        socialPlatformVariantId: options?.socialPlatformVariantId ?? null,
      },
    });
    if (dup) {
      return { ok: true, refId: dup.id };
    }
  } else {
    const dup = await prisma.socialContentMediaRef.findFirst({
      where: {
        socialContentItemId,
        ownedMediaId,
        purpose: SocialContentMediaRefPurpose.PLATFORM_VARIANT,
        socialPlatformVariantId: options?.socialPlatformVariantId ?? undefined,
      },
    });
    if (dup) return { ok: true, refId: dup.id };
  }
  const actor = await getAdminActorUserId();
  const last = await prisma.socialContentMediaRef.findFirst({
    where: { socialContentItemId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;
  const row = await prisma.socialContentMediaRef.create({
    data: {
      socialContentItemId,
      ownedMediaId,
      socialPlatformVariantId: options?.socialPlatformVariantId ?? null,
      purpose,
      note: options?.note?.trim() || null,
      sortOrder,
      createdByUserId: actor,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/owned-campaign-library");
  return { ok: true, refId: row.id };
}

export type UpdateRefResult = { ok: true } | { ok: false; error: string };

/**
 * Update purpose, note, or platform variant on an existing `SocialContentMediaRef`.
 * Does not re-check duplicate rules on purpose change; callers should prefer detach + attach for complex moves.
 */
export async function updateSocialContentMediaRefAction(
  refId: string,
  input: { purpose?: SocialContentMediaRefPurpose; note?: string | null; socialPlatformVariantId?: string | null; confirmUnapproved?: boolean }
): Promise<UpdateRefResult> {
  await requireAdminAction();
  const id = String(refId ?? "").trim();
  if (!id) return { ok: false, error: "Missing ref id." };
  const row = await prisma.socialContentMediaRef.findUnique({
    where: { id },
  });
  if (!row) return { ok: false, error: "Ref not found." };
  const media = await prisma.ownedMediaAsset.findUnique({
    where: { id: row.ownedMediaId },
    select: { id: true, approvedForSocial: true },
  });
  if (!media) return { ok: false, error: "Owned media not found for this ref." };
  const nextPurpose = input.purpose ?? row.purpose;
  const nextVariantId =
    input.socialPlatformVariantId === undefined ? row.socialPlatformVariantId : input.socialPlatformVariantId;
  const assignsToPlatform =
    nextPurpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT && nextVariantId != null && String(nextVariantId).length > 0;
  if (assignsToPlatform && !media.approvedForSocial && !input.confirmUnapproved) {
    return { ok: false, error: "UNAPPROVED_NEEDS_CONFIRM" };
  }
  if (input.purpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT || input.socialPlatformVariantId != null) {
    const vId = input.socialPlatformVariantId === undefined ? row.socialPlatformVariantId : input.socialPlatformVariantId;
    if (vId) {
      const v = await prisma.socialPlatformVariant.findFirst({
        where: { id: vId, socialContentItemId: row.socialContentItemId },
      });
      if (!v) return { ok: false, error: "Platform variant not found for this work item." };
    }
  }
  if (input.purpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT && !input.socialPlatformVariantId && !row.socialPlatformVariantId) {
    return { ok: false, error: "Select a platform variant for this purpose." };
  }
  try {
    await prisma.socialContentMediaRef.update({
      where: { id },
      data: {
        purpose: input.purpose ?? row.purpose,
        note: input.note === undefined ? row.note : input.note,
        socialPlatformVariantId:
          input.socialPlatformVariantId === undefined
            ? row.socialPlatformVariantId
            : input.socialPlatformVariantId,
      },
    });
  } catch {
    return { ok: false, error: "Update failed." };
  }
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/owned-campaign-library");
  return { ok: true };
}

export type DetachResult = { ok: true } | { ok: false; error: string };

export async function detachSocialMediaRefAction(refId: string): Promise<DetachResult> {
  await requireAdminAction();
  if (!refId) return { ok: false, error: "Missing ref id." };
  try {
    await prisma.socialContentMediaRef.delete({ where: { id: refId } });
  } catch {
    return { ok: false, error: "Not found." };
  }
  revalidatePath("/admin/workbench/social");
  return { ok: true };
}

export type IndexRootsResult = {
  ok: true;
  created: number;
  skipped: number;
  duplicateCount: number;
  skippedOtherCount: number;
  importBatchId: string | null;
  errors: string[];
} | { ok: false; error: string };

/** Run from admin UI; uses server env for approved paths only. */
export async function runLocalMediaIndexFromEnvAction(dryRun: boolean): Promise<IndexRootsResult> {
  await requireAdminAction();
  const r = await indexLocalMediaRootsFromEnv({ rootLabel: "env CAMPAIGN_MEDIA_INDEX_ROOTS", dryRun });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/owned-media/grid");
  revalidatePath("/admin/owned-media/batches");
  if (r.errors.length && r.created === 0 && r.skipped === 0) {
    return { ok: false, error: r.errors.join(" ") };
  }
  return {
    ok: true,
    created: r.created,
    skipped: r.skipped,
    duplicateCount: r.duplicateCount,
    skippedOtherCount: r.skippedOtherCount,
    importBatchId: r.importBatchId,
    errors: r.errors,
  };
}

/** Returns approved roots from env (labels only, not full path listing to client). */
export async function getMediaIndexRootsMetaAction() {
  await requireAdminAction();
  const roots = getAllowedMediaIndexRootsFromEnv();
  return { count: roots.length, configured: roots.length > 0 };
}

export async function listCountiesForMediaFilterAction() {
  await requireAdminAction();
  try {
    const rows = await prisma.county.findMany({
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true, slug: true, fips: true },
    });
    return { ok: true as const, counties: rows };
  } catch {
    return { ok: true as const, counties: [] as { id: string; displayName: string; slug: string; fips: string }[] };
  }
}

export async function listCampaignEventsForMediaFilterAction() {
  await requireAdminAction();
  try {
    const rows = await prisma.campaignEvent.findMany({
      orderBy: { startAt: "desc" },
      take: 200,
      select: { id: true, title: true, startAt: true },
    });
    return { ok: true as const, events: rows };
  } catch {
    return { ok: true as const, events: [] as { id: string; title: string; startAt: Date }[] };
  }
}
