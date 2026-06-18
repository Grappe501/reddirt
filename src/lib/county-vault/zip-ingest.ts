import JSZip from "jszip";
import path from "node:path";
import { inferOwnedMediaKind } from "@/lib/owned-media/storage";

export type ZipExtractedFile = {
  relativePath: string;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
  kind: ReturnType<typeof inferOwnedMediaKind>;
};

const SKIP_DIR_PREFIXES = ["__MACOSX/", ".git/", "node_modules/"];
const SKIP_FILE_NAMES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

function shouldSkipEntry(name: string): boolean {
  const norm = name.replace(/\\/g, "/");
  if (norm.startsWith(".") && !norm.includes("/")) return true;
  if (SKIP_FILE_NAMES.has(path.basename(norm))) return true;
  return SKIP_DIR_PREFIXES.some((p) => norm.startsWith(p));
}

function guessMime(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".heic": "image/heic",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".m4v": "video/mp4",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".csv": "text/csv",
  };
  return map[ext] ?? "application/octet-stream";
}

function isMediaMime(mime: string, fileName: string): boolean {
  if (mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("audio/")) return true;
  if (mime === "application/pdf" || mime.startsWith("text/")) return true;
  const ext = path.extname(fileName).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".mp4", ".mov", ".webm", ".m4v", ".mp3", ".wav", ".pdf"].includes(
    ext,
  );
}

/**
 * Extract media files from a zip buffer. Skips macOS metadata and non-media entries.
 */
export async function extractMediaFromZipBuffer(
  zipBuffer: Buffer,
  zipFileName: string,
): Promise<{ files: ZipExtractedFile[]; skipped: string[] }> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const files: ZipExtractedFile[] = [];
  const skipped: string[] = [];

  const entries = Object.entries(zip.files).filter(([, entry]) => !entry.dir);

  for (const [relativePath, entry] of entries) {
    const norm = relativePath.replace(/\\/g, "/");
    if (shouldSkipEntry(norm)) {
      skipped.push(norm);
      continue;
    }
    const fileName = path.basename(norm);
    const mimeType = guessMime(fileName);
    if (!isMediaMime(mimeType, fileName)) {
      skipped.push(norm);
      continue;
    }
    const buffer = Buffer.from(await entry.async("arraybuffer"));
    if (buffer.length === 0) {
      skipped.push(`${norm} (empty)`);
      continue;
    }
    files.push({
      relativePath: norm,
      fileName,
      buffer,
      mimeType,
      kind: inferOwnedMediaKind(mimeType),
    });
  }

  if (files.length === 0) {
    throw new Error(`No supported media files found in ${zipFileName}. Include photos, videos, audio, or PDFs.`);
  }

  return { files, skipped };
}
