"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  publishTranscriptForPublic,
  saveEditorDraft,
  setWorkspaceStatus,
  uploadCorrectedCaptionsToYouTube,
} from "@/lib/media/youtube-transcripts/editorial-workflow";
import { restoreRevision } from "@/lib/media/youtube-transcripts/workspace-store";
import type { TranscriptSegment, TranscriptStatus } from "@/content/media/campaign-media-types";
import { generateAiTranscriptAdvisory, saveAiAdvisory } from "@/lib/media/youtube-transcripts/ai-extraction";
import { loadWorkspaceRecord } from "@/lib/media/youtube-transcripts/workspace-store";
import {
  buildTranscriptSearchIndex,
  persistTranscriptSearchIndex,
} from "@/lib/media/youtube-transcripts/search-index";
import { listPublishedWithTranscript } from "@/content/media/campaign-media-registry";

async function actorLabel(): Promise<string> {
  await requireAdminAction();
  return "admin-editor";
}

export async function saveTranscriptEditorAction(formData: FormData) {
  await requireAdminAction();
  const youtubeVideoId = String(formData.get("youtubeVideoId") ?? "").trim();
  const plainText = String(formData.get("plainText") ?? "");
  const segmentsRaw = String(formData.get("segmentsJson") ?? "[]");
  let segments: TranscriptSegment[] = [];
  try {
    segments = JSON.parse(segmentsRaw) as TranscriptSegment[];
  } catch {
    segments = plainText
      .split(/\n{2,}/)
      .map((t, i) => ({ id: `seg-${i + 1}`, text: t.trim() }))
      .filter((s) => s.text);
  }
  saveEditorDraft({
    youtubeVideoId,
    plainText,
    segments,
    actor: await actorLabel(),
  });
  revalidatePath("/admin/media/youtube");
  revalidatePath(`/admin/media/youtube/${youtubeVideoId}`);
}

export async function setTranscriptStatusAction(formData: FormData) {
  await requireAdminAction();
  const youtubeVideoId = String(formData.get("youtubeVideoId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as TranscriptStatus;
  setWorkspaceStatus(youtubeVideoId, status, await actorLabel(), `Status → ${status}`);
  revalidatePath("/admin/media/youtube");
  revalidatePath(`/admin/media/youtube/${youtubeVideoId}`);
}

export async function publishTranscriptAction(formData: FormData) {
  await requireAdminAction();
  const youtubeVideoId = String(formData.get("youtubeVideoId") ?? "").trim();
  publishTranscriptForPublic(youtubeVideoId, await actorLabel());
  const index = buildTranscriptSearchIndex(listPublishedWithTranscript());
  persistTranscriptSearchIndex(index);
  revalidatePath("/admin/media/youtube");
  revalidatePath(`/admin/media/youtube/${youtubeVideoId}`);
  revalidatePath("/kelly-speaks");
}

export async function restoreTranscriptRevisionAction(formData: FormData) {
  await requireAdminAction();
  const youtubeVideoId = String(formData.get("youtubeVideoId") ?? "").trim();
  const revisionId = String(formData.get("revisionId") ?? "").trim();
  restoreRevision(youtubeVideoId, revisionId, await actorLabel());
  revalidatePath(`/admin/media/youtube/${youtubeVideoId}`);
}

export async function uploadCaptionsToYouTubeAction(formData: FormData) {
  await requireAdminAction();
  const youtubeVideoId = String(formData.get("youtubeVideoId") ?? "").trim();
  await uploadCorrectedCaptionsToYouTube({
    youtubeVideoId,
    actor: await actorLabel(),
  });
  revalidatePath(`/admin/media/youtube/${youtubeVideoId}`);
}

export async function generateAiAdvisoryAction(formData: FormData) {
  await requireAdminAction();
  const youtubeVideoId = String(formData.get("youtubeVideoId") ?? "").trim();
  const ws = loadWorkspaceRecord(youtubeVideoId);
  if (!ws?.plainText.trim()) throw new Error("No transcript text for AI advisory.");
  const result = await generateAiTranscriptAdvisory({
    youtubeVideoId,
    title: ws.title ?? youtubeVideoId,
    plainText: ws.plainText,
  });
  if (!result.ok) throw new Error(result.error);
  saveAiAdvisory(result.advisory);
  revalidatePath(`/admin/media/youtube/${youtubeVideoId}`);
}
