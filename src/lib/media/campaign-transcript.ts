import type { CampaignMediaRecord, CampaignTranscript } from "@/content/media/campaign-media-types";
import { EMPTY_TRANSCRIPT } from "@/content/media/campaign-media-types";

export function isPublicTranscript(media: CampaignMediaRecord): boolean {
  return (
    media.publicationStatus === "PUBLISHED" &&
    media.transcript.status === "PUBLISHED" &&
    media.transcript.plainText.trim().length > 0
  );
}

export function isPublicMedia(media: CampaignMediaRecord): boolean {
  return media.publicationStatus === "PUBLISHED";
}

export function formatTranscriptTimestamp(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const s = Math.floor(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

export function youtubeWatchUrl(videoId: string, startSeconds?: number): string {
  const base = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  if (startSeconds == null || !Number.isFinite(startSeconds) || startSeconds <= 0) return base;
  return `${base}&t=${Math.floor(startSeconds)}s`;
}

export function youtubeNocookieEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
}

export function youtubePosterUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

export function buildVideoObjectJsonLd(
  media: CampaignMediaRecord,
  opts?: { includeTranscript?: boolean },
): Record<string, unknown> {
  const includeTranscript = opts?.includeTranscript ?? isPublicTranscript(media);
  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: media.title,
    description: media.description,
    embedUrl: youtubeNocookieEmbedUrl(media.youtubeVideoId),
    contentUrl: youtubeWatchUrl(media.youtubeVideoId),
  };
  if (media.thumbnailUrl?.trim()) obj.thumbnailUrl = media.thumbnailUrl.trim();
  if (media.uploadDate?.trim()) obj.uploadDate = media.uploadDate.trim();
  if (media.durationIso8601?.trim()) obj.duration = media.durationIso8601.trim();
  if (includeTranscript) obj.transcript = media.transcript.plainText.trim();
  return obj;
}

export function omitUndefinedDeep<T extends Record<string, unknown>>(input: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out as T;
}

export function emptyTranscript(overrides?: Partial<CampaignTranscript>): CampaignTranscript {
  return { ...EMPTY_TRANSCRIPT, ...overrides, segments: overrides?.segments ?? [] };
}
