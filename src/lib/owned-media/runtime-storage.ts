import path from "node:path";
import { OwnedMediaStorageBackend } from "@prisma/client";
import { uploadObject } from "@/lib/owned-media/ingest/supabase-storage";
import { storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";
import type { SavedOwnedFile } from "@/lib/owned-media/storage";
import { inferOwnedMediaKind, saveOwnedMediaBuffer } from "@/lib/owned-media/storage";

function supabaseStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** True on Netlify serverless — local disk is ephemeral; prefer Supabase when configured. */
export function isEphemeralRuntimeStorage(): boolean {
  return Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function sanitizeFileNameForKey(name: string): string {
  return path
    .basename(name)
    .replace(/[^\w.\-()\s]/gi, "_")
    .replace(/\s+/g, "_")
    .slice(0, 200) || "file.bin";
}

async function buildUniqueSupabasePath(fileName: string): Promise<string> {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `media/${y}/${m}/${sanitizeFileNameForKey(fileName)}`;
}

/**
 * Persists owned media for county vault + admin uploads.
 * Netlify/production: Supabase when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set.
 * Local dev: disk under `data/owned-campaign-media/`.
 */
export async function saveOwnedMediaForRuntime(params: {
  assetId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<SavedOwnedFile & { storageBackend: OwnedMediaStorageBackend; publicUrl: string | null }> {
  const useSupabase = supabaseStorageConfigured() && (isEphemeralRuntimeStorage() || process.env.OWNED_MEDIA_STORAGE === "supabase");

  if (useSupabase) {
    const objectPath = await buildUniqueSupabasePath(params.fileName);
    const uploaded = await uploadObject({
      path: objectPath,
      data: params.buffer,
      contentType: params.mimeType || "application/octet-stream",
    });
    return {
      storageKey: uploaded.path,
      absolutePath: uploaded.path,
      fileName: path.basename(params.fileName),
      fileSizeBytes: params.buffer.length,
      mimeType: params.mimeType || "application/octet-stream",
      kind: inferOwnedMediaKind(params.mimeType || "application/octet-stream"),
      storageBackend: OwnedMediaStorageBackend.SUPABASE,
      publicUrl: uploaded.publicUrl,
    };
  }

  if (isEphemeralRuntimeStorage()) {
    throw new Error(
      "County vault uploads on Netlify require SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (local disk is not persistent in serverless).",
    );
  }

  const saved = await saveOwnedMediaBuffer({
    assetId: params.assetId,
    fileName: params.fileName,
    mimeType: params.mimeType,
    buffer: params.buffer,
  });
  return {
    ...saved,
    storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
    publicUrl: null,
  };
}

/** Resolve absolute path for Whisper — download Supabase object to /tmp when needed. */
export async function resolveOwnedMediaAbsolutePath(asset: {
  storageBackend: OwnedMediaStorageBackend;
  storageKey: string;
  fileName: string;
}): Promise<string> {
  if (asset.storageBackend === OwnedMediaStorageBackend.LOCAL_DISK) {
    return storageKeyToAbsoluteFilePath(asset.storageKey);
  }
  const { getSupabaseServiceClient, getCampaignMediaBucketName } = await import("@/lib/owned-media/ingest/supabase-storage");
  const { mkdtemp, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const supabase = getSupabaseServiceClient();
  const bucket = getCampaignMediaBucketName();
  const { data, error } = await supabase.storage.from(bucket).download(asset.storageKey);
  if (error || !data) throw new Error(error?.message ?? "Failed to download media from Supabase for transcription.");
  const dir = await mkdtemp(join(tmpdir(), "owned-media-"));
  const abs = join(dir, path.basename(asset.fileName) || "media.bin");
  await writeFile(abs, Buffer.from(await data.arrayBuffer()));
  return abs;
}
