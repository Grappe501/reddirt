import path from "node:path";
import type { IngestLogger } from "./logger";

type SharpModule = typeof import("sharp");

/**
 * Resized preview for images. Video: stub — wire ffmpeg/ffprobe in a follow-up.
 */
export async function tryBuildImageThumbnail(
  buffer: Buffer,
  _mime: string,
  _fileName: string,
  log: IngestLogger
): Promise<Buffer | null> {
  let sharp: SharpModule;
  try {
    const mod = await import("sharp");
    sharp = mod.default;
  } catch (e) {
    log.warn("sharp not available; skip image thumbnail", { err: String(e) });
    return null;
  }
  try {
    return await sharp(buffer)
      .rotate()
      .resize(640, 640, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 84, chromaSubsampling: "4:4:4" })
      .toBuffer();
  } catch (e) {
    log.warn("image thumbnail failed", { err: String(e) });
    return null;
  }
}

export function videoFrameThumbnailStub(
  _buffer: Buffer,
  _fileName: string,
  log: IngestLogger
): null {
  void _buffer;
  void _fileName;
  log.info("Video first-frame thumbnail not implemented (ffmpeg hook reserved).");
  return null;
}

export function isProbablyVideo(fileName: string, mime: string): boolean {
  if (mime.startsWith("video/")) return true;
  const ext = path.extname(fileName).toLowerCase();
  return [".mp4", ".mov", ".webm", ".m4v"].includes(ext);
}
