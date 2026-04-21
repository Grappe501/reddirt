import path from "node:path";

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".m4v": "video/mp4",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
};

const SUPPORTED_EXT = new Set(Object.keys(EXT_TO_MIME));

export function isSupportedExt(filePath: string): boolean {
  return SUPPORTED_EXT.has(path.extname(filePath).toLowerCase());
}

export function guessMimeType(filePath: string): string {
  return EXT_TO_MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export function kindFromMime(mime: string): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER" {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (mime === "application/pdf" || mime.startsWith("text/")) return "DOCUMENT";
  return "OTHER";
}

export { SUPPORTED_EXT };
