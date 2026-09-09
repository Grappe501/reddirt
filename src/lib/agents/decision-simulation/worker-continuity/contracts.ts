export const WORKER_CONTINUITY_VERSION = "worker-continuity-1.0" as const;
export const STALE_RUNNING_RECLAIM_VERSION = "stale-running-reclaim-1.0" as const;
export const STALE_CHUNK_CLAIM_MINUTES = 2;
export const WORKER_KICK_ACCEPT_MS = 2500;
export const STALE_RUNNING_CLAIM_SQL =
  "status IN ('PENDING', 'FAILED', 'RUNNING') AND (claimed_at IS NULL OR claimed_at < NOW() - INTERVAL '2 minutes')";
