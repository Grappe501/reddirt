import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { ABSOLUTE_OWNED_MEDIA_MAX_BYTES, DEFAULT_OWNED_MEDIA_MAX_BYTES } from "./limits";
import { buildOwnedStorageKey, storageKeyToAbsoluteFilePath } from "./paths";

const MAX_UPLOAD_BYTES = Math.min(
  Number(process.env.OWNED_MEDIA_MAX_BYTES) || DEFAULT_OWNED_MEDIA_MAX_BYTES,
  ABSOLUTE_OWNED_MEDIA_MAX_BYTES
);

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "application/pdf",
  "text/plain",
  "text/html",
  "text/html; charset=utf-8",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

function inferOwnedMediaKind(mime: string): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER" {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (
    mime === "application/pdf" ||
    mime.startsWith("text/") ||
    mime === "text/csv" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) {
    return "DOCUMENT";
  }
  return "OTHER";
}

export { inferOwnedMediaKind, MAX_UPLOAD_BYTES, ALLOWED_MIME };

export type SavedOwnedFile = {
  storageKey: string;
  absolutePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  kind: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER";
};

/**
 * Persists a binary to disk under the project data directory and returns metadata.
 * Pre-generate `assetId` (cuid) so the path includes the id.
 */
export async function saveOwnedMediaFile(
  params: { assetId: string; file: File; allowMimeSet?: Set<string> }
): Promise<SavedOwnedFile> {
  const { assetId, file } = params;
  const size = file.size;
  if (size <= 0) throw new Error("Empty file.");
  if (size > MAX_UPLOAD_BYTES) throw new Error("File is too large.");

  const mimeType = (file.type && file.type.length ? file.type : "application/octet-stream") as string;
  const allow = params.allowMimeSet ?? ALLOWED_MIME;
  if (!allow.has(mimeType) && !mimeType.startsWith("image/") && !mimeType.startsWith("video/") && !mimeType.startsWith("audio/")) {
    throw new Error(`Unsupported or missing MIME type: ${mimeType}`);
  }

  const year = new Date().getUTCFullYear();
  const originalName = file.name || "upload.bin";
  const storageKey = buildOwnedStorageKey({ assetId, year, fileName: originalName });
  const abs = storageKeyToAbsoluteFilePath(storageKey);
  await mkdir(path.dirname(abs), { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buf);

  const st = await stat(abs);
  return {
    storageKey,
    absolutePath: abs,
    fileName: path.basename(originalName),
    fileSizeBytes: st.size,
    mimeType,
    kind: inferOwnedMediaKind(mimeType),
  };
}

export async function readOwnedMediaFile(storageKey: string): Promise<Buffer> {
  return readFile(storageKeyToAbsoluteFilePath(storageKey));
}

/**
 * Exposed path for the Next route handler; uses forward slashes in URL segments.
 */
export function getOwnedFilePublicPath(assetId: string): string {
  return `/api/owned-campaign-media/${encodeURIComponent(assetId)}/file`;
}
