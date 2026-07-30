"use server";

import { revalidatePath } from "next/cache";
import { PublicMediaPlacementKind } from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import { planDefaultDerivativeJobsForSource } from "@/lib/owned-media/derivative-jobs";
import { canPublicReadOwnedMedia } from "@/lib/owned-media/public-read-access";
import { clampFocalOrThrow } from "@/lib/public-media/focal";
import { getPublicMediaSlotDefinition, isValidPublicMediaSlot } from "@/lib/public-media/slot-registry";

function parseOptionalFocal(raw: FormDataEntryValue | null, label: string): number | null {
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(String(raw));
  return clampFocalOrThrow(n, label);
}

export async function upsertPublicMediaPlacementAction(formData: FormData) {
  await requireAdminAction();
  const slotKey = String(formData.get("slotKey") ?? "").trim();
  const ownedMediaAssetId = String(formData.get("ownedMediaAssetId") ?? "").trim();
  const enabled = String(formData.get("enabled") ?? "true") === "true";
  const placementKindRaw = String(formData.get("placementKind") ?? "IMAGE").toUpperCase();
  const placementKind = (Object.values(PublicMediaPlacementKind) as string[]).includes(placementKindRaw)
    ? (placementKindRaw as PublicMediaPlacementKind)
    : PublicMediaPlacementKind.IMAGE;

  if (!isValidPublicMediaSlot(slotKey)) {
    throw new Error("Invalid public media slot");
  }
  const def = getPublicMediaSlotDefinition(slotKey)!;

  const asset = await prisma.ownedMediaAsset.findUnique({ where: { id: ownedMediaAssetId } });
  if (!asset) throw new Error("Asset not found");

  const focalXOverride = def.focalOverrideAllowed
    ? parseOptionalFocal(formData.get("focalXOverride"), "focalXOverride")
    : null;
  const focalYOverride = def.focalOverrideAllowed
    ? parseOptionalFocal(formData.get("focalYOverride"), "focalYOverride")
    : null;

  const assetFocalX = parseOptionalFocal(formData.get("assetFocalX"), "assetFocalX");
  const assetFocalY = parseOptionalFocal(formData.get("assetFocalY"), "assetFocalY");

  if (assetFocalX != null || assetFocalY != null) {
    await prisma.ownedMediaAsset.update({
      where: { id: asset.id },
      data: {
        focalX: assetFocalX ?? asset.focalX,
        focalY: assetFocalY ?? asset.focalY,
      },
    });
  }

  const actorId = await getAdminActorUserId();

  await prisma.publicMediaPlacement.upsert({
    where: { pageKey_slotKey: { pageKey: def.pageKey, slotKey } },
    create: {
      pageKey: def.pageKey,
      slotKey,
      ownedMediaAssetId: asset.id,
      placementKind,
      enabled,
      focalXOverride,
      focalYOverride,
      captionOverride: String(formData.get("captionOverride") ?? "").trim() || null,
      altTextOverride: String(formData.get("altTextOverride") ?? "").trim() || null,
      createdByUserId: actorId,
    },
    update: {
      ownedMediaAssetId: asset.id,
      placementKind,
      enabled,
      focalXOverride,
      focalYOverride,
      captionOverride: String(formData.get("captionOverride") ?? "").trim() || null,
      altTextOverride: String(formData.get("altTextOverride") ?? "").trim() || null,
    },
  });

  if (canPublicReadOwnedMedia(asset)) {
    await planDefaultDerivativeJobsForSource(asset.id, {
      kinds: ["WEB_JPEG", "THUMBNAIL"],
    });
  }

  revalidatePath("/admin/owned-media/public-placements");
  revalidatePath(`/admin/owned-media/${asset.id}`);
}

export async function disablePublicMediaPlacementAction(formData: FormData) {
  await requireAdminAction();
  const slotKey = String(formData.get("slotKey") ?? "").trim();
  if (!isValidPublicMediaSlot(slotKey)) throw new Error("Invalid slot");
  const def = getPublicMediaSlotDefinition(slotKey)!;
  await prisma.publicMediaPlacement.updateMany({
    where: { pageKey: def.pageKey, slotKey },
    data: { enabled: false },
  });
  revalidatePath("/admin/owned-media/public-placements");
}

export async function runPublicDerivativeWorkerAction() {
  await requireAdminAction();
  const { processOwnedMediaDerivativeJobs } = await import("@/lib/owned-media/process-derivative-jobs");
  await processOwnedMediaDerivativeJobs(10);
  revalidatePath("/admin/owned-media/public-placements");
}
