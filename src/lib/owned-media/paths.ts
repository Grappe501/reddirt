import path from "node:path";

/** Logical prefix for all campaign-owned files (S3 or local disk). */
export const OWNED_CAMPAIGN_PREFIX = "campaign-owned";

/**
 * Returns the relative key under the storage root: `campaign-owned/{year}/{assetId}/{safeFileName}`.
 */
export function buildOwnedStorageKey(params: { assetId: string; year: number; fileName: string }): string {
  const base = path.basename(params.fileName).replace(/[^\w.\-() ]+/g, "_").slice(0, 200);
  const safe = base.length ? base : "upload.bin";
  return path.posix.join(OWNED_CAMPAIGN_PREFIX, String(params.year), params.assetId, safe);
}

export function getDataRootDir(): string {
  return process.env.OWNED_MEDIA_DATA_ROOT
    ? path.resolve(process.env.OWNED_MEDIA_DATA_ROOT)
    : path.join(process.cwd(), "data", "owned-campaign-media");
}

export function storageKeyToAbsoluteFilePath(storageKey: string): string {
  return path.join(getDataRootDir(), ...storageKey.split("/"));
}
