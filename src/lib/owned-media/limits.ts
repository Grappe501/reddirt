/**
 * Single source for owned-media size limits (uploads, CLI ingest, local index copy).
 * Keep `next.config.ts` `experimental.serverActions.bodySizeLimit` ≥ absolute max.
 */

/** Default when `OWNED_MEDIA_MAX_BYTES` / `CAMPAIGN_MEDIA_INDEX_MAX_BYTES` unset (2 GiB). */
export const DEFAULT_OWNED_MEDIA_MAX_BYTES = 2 * 1024 * 1024 * 1024;

/** Hard ceiling even when env overrides are set (4 GiB). */
export const ABSOLUTE_OWNED_MEDIA_MAX_BYTES = 4 * 1024 * 1024 * 1024;

/** Next.js server actions — must accept the largest allowed upload. */
export const OWNED_MEDIA_SERVER_ACTION_BODY_LIMIT = "4gb" as const;

/** Netlify synchronous function request body cap (~6 MiB). Override with NETLIFY_UPLOAD_MAX_BYTES. */
export const NETLIFY_SYNC_UPLOAD_MAX_BYTES = 6 * 1024 * 1024;

/** Effective max for API route multipart uploads in the current runtime. */
export function getRuntimeUploadMaxBytes(): number {
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const envCap = Number(process.env.NETLIFY_UPLOAD_MAX_BYTES);
    if (Number.isFinite(envCap) && envCap > 0) return Math.min(envCap, ABSOLUTE_OWNED_MEDIA_MAX_BYTES);
    return NETLIFY_SYNC_UPLOAD_MAX_BYTES;
  }
  return Math.min(Number(process.env.OWNED_MEDIA_MAX_BYTES) || DEFAULT_OWNED_MEDIA_MAX_BYTES, ABSOLUTE_OWNED_MEDIA_MAX_BYTES);
}
