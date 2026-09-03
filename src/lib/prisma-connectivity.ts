/** True when Prisma failed to connect (dev DB down, wrong DATABASE_URL, etc.). */
export function isPrismaDatabaseUnavailable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const rec = err as { name?: string; code?: string; message?: string };
  if (rec.name === "PrismaClientInitializationError") return true;
  if (rec.code === "P1001" || rec.code === "P1000") return true;
  const msg = typeof rec.message === "string" ? rec.message : "";
  return /Can't reach database server|ECONNREFUSED|connection refused|P1001|P1000|EMAXCONNSESSION|max clients reached|too many connections/i.test(msg);
}

/**
 * True when live metrics queries fail because the DB is unreachable or schema/tables
 * are out of sync — public pages should degrade instead of 500.
 */
export function isPrismaLiveDataUnavailable(err: unknown): boolean {
  if (isPrismaDatabaseUnavailable(err)) return true;
  if (!err || typeof err !== "object") return false;
  const rec = err as { name?: string; code?: string; message?: string };
  if (rec.name === "PrismaClientKnownRequestError") {
    // P2021 table missing · P2022 column missing · P2025 record not found (rare for lists)
    if (rec.code === "P2021" || rec.code === "P2022") return true;
  }
  const msg = typeof rec.message === "string" ? rec.message : "";
  return /does not exist in the current database|P2021|P2022/i.test(msg);
}

/** Server-only: log once per failure class so public pages can degrade without silent failures. */
export function logPrismaDatabaseUnavailable(context: string, err: unknown): void {
  if (!isPrismaLiveDataUnavailable(err) && !isPrismaDatabaseUnavailable(err)) return;
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[kelly-sos:db-unavailable] ${context}: ${msg}`);
}
