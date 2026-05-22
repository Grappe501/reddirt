import type { HotWashMediaType } from "./hot-wash-media-types";

const IMAGE = /^image\//i;
const VIDEO = /^video\//i;
const AUDIO = /^audio\//i;

const DOC_EXT = new Set(["pdf", "doc", "docx", "txt", "md"]);

export const HOT_WASH_ACCEPTED_MIME_PREFIXES = ["image/", "video/", "audio/"] as const;

export const HOT_WASH_ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".md"] as const;

export function classifyHotWashMedia(filename: string, mimeType: string): HotWashMediaType {
  const lower = filename.toLowerCase();
  const ext = lower.includes(".") ? lower.split(".").pop() ?? "" : "";

  if (IMAGE.test(mimeType)) return "image";
  if (VIDEO.test(mimeType)) return "video";
  if (AUDIO.test(mimeType)) return "audio";
  if (DOC_EXT.has(ext)) return "document";
  if (lower.includes("speech") || lower.includes("remarks")) return "speech";
  return "other";
}

export function isAcceptedHotWashUpload(filename: string, mimeType: string): boolean {
  const lower = filename.toLowerCase();
  if (HOT_WASH_ACCEPTED_MIME_PREFIXES.some((p) => mimeType.toLowerCase().startsWith(p))) return true;
  return HOT_WASH_ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function mediaTypeMatchesPanel(mediaType: HotWashMediaType, panel: string): boolean {
  switch (panel) {
    case "photos":
      return mediaType === "image";
    case "videos":
      return mediaType === "video";
    case "speeches":
      return mediaType === "speech" || mediaType === "audio";
    case "documents":
      return mediaType === "document" || mediaType === "other";
    default:
      return true;
  }
}
