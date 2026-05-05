import { prisma } from "@/lib/db";

export type StaffGmailSyncStateColumnStatus =
  | { ok: true }
  | { ok: false; code: "db_unreachable" | "column_missing"; messageSafe: string };

/**
 * Runtime check for EMAIL-GMAIL-SYNC-1.1 migration (`gmailSyncState` on StaffGmailAccount).
 * Safe for operator surfaces — no secret values.
 */
export async function checkStaffGmailSyncStateMigration(): Promise<StaffGmailSyncStateColumnStatus> {
  try {
    const r = await prisma.$queryRaw<{ ok: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'StaffGmailAccount'
          AND column_name = 'gmailSyncState'
      ) AS ok;
    `;
    const first = Array.isArray(r) ? r[0] : null;
    if (first?.ok === true) return { ok: true };
    return {
      ok: false,
      code: "column_missing",
      messageSafe: "StaffGmailAccount.gmailSyncState missing — run npx prisma migrate deploy",
    };
  } catch (e: unknown) {
    const msg =
      e instanceof Error
        ? e.message.replace(/ postgres\.[a-zA-Z0-9._-]+/gi, " [host]").slice(0, 220)
        : "db_check_failed";
    return { ok: false, code: "db_unreachable", messageSafe: msg };
  }
}
