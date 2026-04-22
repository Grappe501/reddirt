/** True when Prisma failed to connect (dev DB down, wrong DATABASE_URL, etc.). */
export function isPrismaDatabaseUnavailable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const rec = err as { name?: string; code?: string; message?: string };
  if (rec.name === "PrismaClientInitializationError") return true;
  if (rec.code === "P1001" || rec.code === "P1000") return true;
  const msg = typeof rec.message === "string" ? rec.message : "";
  return /Can't reach database server|ECONNREFUSED|connection refused|P1001|P1000/i.test(msg);
}

/** Server-only: log once per failure class so public pages can degrade without silent failures. */
export function logPrismaDatabaseUnavailable(context: string, err: unknown): void {
  if (!isPrismaDatabaseUnavailable(err)) return;
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[reddirt:db-unavailable] ${context}: ${msg}`);
}
