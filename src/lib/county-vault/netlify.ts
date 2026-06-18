import { getRuntimeUploadMaxBytes } from "@/lib/owned-media/limits";

export function validateVaultUploadTotalBytes(totalBytes: number): string | null {
  const max = getRuntimeUploadMaxBytes();
  if (totalBytes <= max) return null;
  const maxMb = (max / (1024 * 1024)).toFixed(1);
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return `Upload exceeds Netlify function limit (${maxMb} MB per request). Split into smaller files or use local ingest with Supabase sync.`;
  }
  return `Upload exceeds limit (${maxMb} MB).`;
}

export function getVaultUploadMaxBytesForClient(): number {
  return getRuntimeUploadMaxBytes();
}

/** Netlify @netlify/plugin-nextjs — keep in sync with admin intelligence routes. */
export const COUNTY_VAULT_ROUTE_MAX_DURATION = process.env.NETLIFY ? 26 : 300;
