import { STALE_CHUNK_CLAIM_MINUTES } from "./contracts";

export function isChunkClaimable(
  chunk: { status: string; claimedAt?: Date | string | null },
  now = Date.now(),
  staleMinutes = STALE_CHUNK_CLAIM_MINUTES,
): boolean {
  const claimedAt = chunk.claimedAt ? new Date(chunk.claimedAt).getTime() : null;
  const stale = claimedAt != null && now - claimedAt >= staleMinutes * 60_000;
  if (chunk.status === "PENDING" || chunk.status === "FAILED") {
    return claimedAt == null || stale;
  }
  if (chunk.status === "RUNNING") {
    return Boolean(stale);
  }
  return false;
}
