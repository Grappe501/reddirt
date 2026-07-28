/**
 * Editorial workflow helpers — review / approve / reject / archive / publish.
 * Publishing never runs automatically from sync or AI.
 */

import type { TranscriptSegment, TranscriptStatus } from "@/content/media/campaign-media-types";
import { appendNotification } from "./notifications";
import { publishWorkspaceTranscript } from "./publish-overlay";
import {
  loadWorkspaceRecord,
  saveWorkspaceRecord,
  type TranscriptWorkspaceRecord,
} from "./workspace-store";
import { uploadCaptionTrack } from "./captions-api";
import { segmentsToSrt } from "./normalize-transcript";

export function setWorkspaceStatus(
  youtubeVideoId: string,
  status: TranscriptStatus,
  actor: string,
  reason: string,
  repoRoot: string = process.cwd(),
): TranscriptWorkspaceRecord {
  const ws = loadWorkspaceRecord(youtubeVideoId, repoRoot);
  if (!ws) throw new Error(`No workspace for ${youtubeVideoId}`);
  const now = new Date().toISOString();
  const next: TranscriptWorkspaceRecord = {
    ...ws,
    status,
    reviewedAt: status === "REVIEW_REQUIRED" || status === "APPROVED" || status === "PUBLISHED" ? now : ws.reviewedAt,
    reviewedBy: actor,
    approvedAt: status === "APPROVED" || status === "PUBLISHED" ? now : ws.approvedAt,
    approvedBy: status === "APPROVED" || status === "PUBLISHED" ? actor : ws.approvedBy,
  };
  const saved = saveWorkspaceRecord(next, { author: actor, reason }, repoRoot);
  if (status === "APPROVED") {
    appendNotification(
      {
        type: "PUBLISHING_READY",
        youtubeVideoId,
        message: "Transcript approved — ready for explicit publish.",
      },
      repoRoot,
    );
  }
  if (status === "REVIEW_REQUIRED") {
    appendNotification(
      { type: "REVIEW_COMPLETE", youtubeVideoId, message: "Marked review required." },
      repoRoot,
    );
  }
  return saved;
}

export function saveEditorDraft(opts: {
  youtubeVideoId: string;
  plainText: string;
  segments: TranscriptSegment[];
  chapters?: TranscriptWorkspaceRecord["chapters"];
  actor: string;
  reason?: string;
  repoRoot?: string;
}): TranscriptWorkspaceRecord {
  const repoRoot = opts.repoRoot ?? process.cwd();
  const ws = loadWorkspaceRecord(opts.youtubeVideoId, repoRoot);
  if (!ws) throw new Error(`No workspace for ${opts.youtubeVideoId}`);
  return saveWorkspaceRecord(
    {
      ...ws,
      plainText: opts.plainText,
      segments: opts.segments,
      chapters: opts.chapters ?? ws.chapters,
      status: ws.status === "PUBLISHED" || ws.status === "APPROVED" ? "DRAFT" : ws.status === "NOT_REQUESTED" ? "DRAFT" : ws.status,
    },
    { author: opts.actor, reason: opts.reason ?? "Editor save" },
    repoRoot,
  );
}

export function publishTranscriptForPublic(
  youtubeVideoId: string,
  actor: string,
  repoRoot: string = process.cwd(),
) {
  let ws = loadWorkspaceRecord(youtubeVideoId, repoRoot);
  if (!ws) throw new Error(`No workspace for ${youtubeVideoId}`);
  if (ws.status !== "APPROVED" && ws.status !== "PUBLISHED") {
    throw new Error("Approve the transcript before publishing.");
  }
  const published = publishWorkspaceTranscript(ws, actor, repoRoot);
  ws = saveWorkspaceRecord(
    { ...ws, status: "PUBLISHED", approvedBy: actor, approvedAt: published.approvedAt },
    { author: actor, reason: "Published to public overlay" },
    repoRoot,
  );
  return { workspace: ws, published };
}

/** Optional manual caption sync-back — never automatic. */
export async function uploadCorrectedCaptionsToYouTube(opts: {
  youtubeVideoId: string;
  actor: string;
  language?: string;
  name?: string;
  repoRoot?: string;
}): Promise<{ captionId: string | null }> {
  const repoRoot = opts.repoRoot ?? process.cwd();
  const ws = loadWorkspaceRecord(opts.youtubeVideoId, repoRoot);
  if (!ws) throw new Error(`No workspace for ${opts.youtubeVideoId}`);
  if (ws.status !== "APPROVED" && ws.status !== "PUBLISHED") {
    throw new Error("Only approved/published transcripts may be uploaded to YouTube.");
  }
  const srt = segmentsToSrt(ws.segments.length ? ws.segments : [{ id: "1", text: ws.plainText }]);
  const result = await uploadCaptionTrack({
    videoId: opts.youtubeVideoId,
    language: opts.language ?? (ws.language || "en"),
    name: opts.name ?? "Campaign corrected transcript",
    captionBody: srt,
    repoRoot,
  });
  saveWorkspaceRecord(
    ws,
    { author: opts.actor, reason: `Uploaded corrected captions to YouTube (${result.id ?? "ok"})` },
    repoRoot,
  );
  return { captionId: result.id };
}
