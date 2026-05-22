"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { setMediaApproval, uploadHotWashMedia } from "@/lib/campaign-events/media/media-storage";
import { saveHotWashNotes, type HotWashNotes } from "@/lib/campaign-events/hot-wash-notes";

const PATHS = [
  "/admin/campaign-events",
  "/admin/campaign-events/media-approval",
  "/admin/campaign-calendar",
] as const;

function revalidateMediaSurfaces(recordId?: string) {
  for (const p of PATHS) revalidatePath(p, "layout");
  if (recordId) revalidatePath(`/admin/campaign-events/${recordId}`);
}

export async function uploadHotWashMediaAction(formData: FormData) {
  await requireAdminAction();
  const eventRecordId = String(formData.get("eventRecordId") ?? "");
  const file = formData.get("file");
  if (!eventRecordId || !(file instanceof File)) {
    return { ok: false as const, error: "Missing event or file." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const record = await uploadHotWashMedia({
      eventRecordId,
      bytes,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      uploaderName: String(formData.get("uploaderName") ?? "Campaign admin"),
      uploaderEmail: String(formData.get("uploaderEmail") ?? "admin@campaign.local"),
      uploaderPhone: String(formData.get("uploaderPhone") ?? "") || undefined,
      uploadSource: "admin",
      caption: String(formData.get("caption") ?? "") || undefined,
    });
    revalidateMediaSurfaces(eventRecordId);
    return { ok: true as const, record };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

export async function approveHotWashMediaAction(mediaId: string, actor = "campaign_manager") {
  await requireAdminAction();
  const record = await setMediaApproval({ mediaId, status: "approved", actor });
  revalidateMediaSurfaces(record.eventRecordId);
  return { ok: true as const, record };
}

export async function rejectHotWashMediaAction(mediaId: string, reason?: string, actor = "campaign_manager") {
  await requireAdminAction();
  const record = await setMediaApproval({
    mediaId,
    status: "rejected",
    actor,
    rejectionReason: reason,
  });
  revalidateMediaSurfaces(record.eventRecordId);
  return { ok: true as const, record };
}

export async function needsReviewHotWashMediaAction(mediaId: string) {
  await requireAdminAction();
  const record = await setMediaApproval({ mediaId, status: "needs_review", actor: "campaign_manager" });
  revalidateMediaSurfaces(record.eventRecordId);
  return { ok: true as const, record };
}

export async function saveHotWashNotesAction(recordId: string, notes: HotWashNotes) {
  await requireAdminAction();
  await saveHotWashNotes(recordId, notes);
  revalidateMediaSurfaces(recordId);
  return { ok: true as const };
}
