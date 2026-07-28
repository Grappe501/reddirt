/**
 * Published transcript overlays (committed under src/content/media/transcripts).
 * Public pages merge these onto registry records. Never write PUBLISHED without editorial action.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CampaignTranscript } from "@/content/media/campaign-media-types";
import { getCommittedTranscriptOverlay } from "@/content/media/transcripts/overlays";
import { isPublicTranscript } from "@/lib/media/campaign-transcript";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { workspaceToCampaignTranscript, type TranscriptWorkspaceRecord } from "./workspace-store";

export const PUBLISHED_TRANSCRIPTS_REL = "src/content/media/transcripts";

function overlayAbs(youtubeVideoId: string, repoRoot: string): string {
  return path.join(repoRoot, PUBLISHED_TRANSCRIPTS_REL, `${youtubeVideoId}.json`);
}

export function loadPublishedTranscriptOverlay(
  youtubeVideoId: string,
  repoRoot: string = process.cwd(),
): CampaignTranscript | null {
  const committed = getCommittedTranscriptOverlay(youtubeVideoId);
  if (committed) return committed;

  const abs = overlayAbs(youtubeVideoId, repoRoot);
  if (!existsSync(abs)) return null;
  try {
    const raw = JSON.parse(readFileSync(abs, "utf8")) as CampaignTranscript;
    if (raw.status !== "PUBLISHED") return null;
    if (!raw.plainText?.trim()) return null;
    return raw;
  } catch {
    return null;
  }
}

export function listPublishedTranscriptOverlayIds(repoRoot: string = process.cwd()): string[] {
  const dir = path.join(repoRoot, PUBLISHED_TRANSCRIPTS_REL);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

/**
 * Editorial publish: writes overlay only when workspace is APPROVED or explicitly forced from APPROVED→PUBLISHED.
 * Does NOT auto-publish from download/normalize/AI.
 */
export function publishWorkspaceTranscript(
  ws: TranscriptWorkspaceRecord,
  actor: string,
  repoRoot: string = process.cwd(),
): CampaignTranscript {
  if (ws.status !== "APPROVED" && ws.status !== "PUBLISHED") {
    throw new Error("Transcript must be APPROVED before publish.");
  }
  if (!ws.plainText.trim()) {
    throw new Error("Cannot publish empty transcript.");
  }
  const transcript: CampaignTranscript = {
    ...workspaceToCampaignTranscript(ws),
    status: "PUBLISHED",
    approvedAt: ws.approvedAt ?? new Date().toISOString(),
    approvedBy: ws.approvedBy ?? actor,
    reviewedAt: ws.reviewedAt ?? new Date().toISOString(),
    reviewedBy: ws.reviewedBy ?? actor,
    lastUpdatedAt: new Date().toISOString(),
  };
  const abs = overlayAbs(ws.youtubeVideoId, repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(transcript, null, 2)}\n`, "utf8");
  return transcript;
}

export function unpublishTranscriptOverlay(youtubeVideoId: string, repoRoot: string = process.cwd()): void {
  const abs = overlayAbs(youtubeVideoId, repoRoot);
  if (!existsSync(abs)) return;
  const raw = JSON.parse(readFileSync(abs, "utf8")) as CampaignTranscript;
  raw.status = "ARCHIVED";
  writeFileSync(abs, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
}

export function mergeMediaWithPublishedOverlay(
  media: CampaignMediaRecord,
  repoRoot: string = process.cwd(),
): CampaignMediaRecord {
  const overlay = loadPublishedTranscriptOverlay(media.youtubeVideoId, repoRoot);
  if (!overlay) return media;
  const merged = { ...media, transcript: overlay };
  // Safety: never surface overlay unless media itself is PUBLISHED
  if (!isPublicTranscript(merged) && media.publicationStatus !== "PUBLISHED") {
    return media;
  }
  if (media.publicationStatus !== "PUBLISHED") return media;
  return merged;
}
