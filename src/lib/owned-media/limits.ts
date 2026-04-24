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
