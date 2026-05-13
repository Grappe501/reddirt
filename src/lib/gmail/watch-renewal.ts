/**
 * Gmail watch renewal **readiness** — lists mailboxes whose watch likely needs start/renew.
 * Does not schedule jobs; use admin action, `tsx` preview script, or a future worker.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseGmailSyncState, resolveDisplayWatchStatus } from "@/lib/gmail/gmail-sync-state";
import { isGmailWatchConfigured } from "@/lib/gmail/watch-config";
import { startOrRenewGmailWatchForAccount } from "@/lib/gmail/watch";

/** Default: renew if expiration within this window (ms). Override via `lookaheadMs`. */
export const DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS = 36 * 60 * 60 * 1000;

export type WatchRenewalCandidate = {
  userId: string;
  sendAsEmailDomainHint: string | null;
  watchExpirationMs: number | null;
  displayStatus: ReturnType<typeof resolveDisplayWatchStatus>;
  needsRenewal: boolean;
  reasonSafe: string;
};

function domainHint(email: string): string | null {
  const at = email.indexOf("@");
  if (at === -1 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase() || null;
}

function evaluateCandidate(
  userId: string,
  sendAsEmail: string,
  gmailSyncState: Prisma.JsonValue,
  lookaheadMs: number
): WatchRenewalCandidate {
  const sync = parseGmailSyncState(gmailSyncState);
  const displayStatus = resolveDisplayWatchStatus(sync);
  const expRaw = sync.watchExpiration != null ? Number(sync.watchExpiration) : NaN;
  const watchExpirationMs = Number.isFinite(expRaw) && expRaw > 0 ? expRaw : null;
  const now = Date.now();

  let needsRenewal = false;
  let reasonSafe = "watch_ok_or_not_applicable";

  if (!isGmailWatchConfigured()) {
    needsRenewal = false;
    reasonSafe = "topic_not_configured_skip_renew";
  } else if (displayStatus === "EXPIRED" || displayStatus === "ERROR") {
    needsRenewal = true;
    reasonSafe =
      displayStatus === "EXPIRED" ? "watch_expired_renew_recommended" : "watch_error_renew_may_help";
  } else if (displayStatus === "ACTIVE" && watchExpirationMs != null) {
    const remaining = watchExpirationMs - now;
    if (remaining <= lookaheadMs) {
      needsRenewal = true;
      reasonSafe = `watch_expires_within_${Math.ceil(lookaheadMs / 3600000)}h_renew_recommended`;
    }
  } else if (displayStatus === "ACTIVE" && watchExpirationMs == null) {
    needsRenewal = true;
    reasonSafe = "active_but_no_expiration_metadata_renew_to_refresh";
  } else if (displayStatus === "NOT_CONFIGURED" || displayStatus === "STOPPED") {
    needsRenewal = false;
    reasonSafe = "no_active_watch_registration";
  }

  return {
    userId,
    sendAsEmailDomainHint: domainHint(sendAsEmail),
    watchExpirationMs,
    displayStatus,
    needsRenewal,
    reasonSafe,
  };
}

export async function listGmailWatchRenewalCandidates(
  lookaheadMs: number = DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS
): Promise<WatchRenewalCandidate[]> {
  try {
    const rows = await prisma.staffGmailAccount.findMany({
      where: { isActive: true },
      select: { userId: true, sendAsEmail: true, gmailSyncState: true },
    });
    return rows.map((r) => evaluateCandidate(r.userId, r.sendAsEmail, r.gmailSyncState, lookaheadMs));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if ((/does not exist/i.test(msg) && /StaffGmailAccount/i.test(msg)) || /P2021|P2010/i.test(msg)) {
      return [];
    }
    throw e;
  }
}

export type RenewManyResult = {
  userId: string;
  ok: boolean;
  code?: string;
  messageSafe?: string;
};

/**
 * Best-effort renewal for candidates. **No** bodies, **no** queue writes, **no** sends (only `users.watch`).
 * Gate with `opts.execute === true` at call sites; scripts must also require `GMAIL_WATCH_RENEWAL_EXECUTE=1`.
 */
export async function executeGmailWatchRenewalsForUserIds(
  userIds: string[],
  opts: { execute: boolean }
): Promise<RenewManyResult[]> {
  const results: RenewManyResult[] = [];
  for (const userId of userIds) {
    if (!opts.execute) {
      results.push({ userId, ok: true, messageSafe: "preview_only_no_api_call" });
      continue;
    }
    const r = await startOrRenewGmailWatchForAccount(userId);
    if (r.ok) {
      results.push({ userId, ok: true });
    } else {
      results.push({ userId, ok: false, code: r.code, messageSafe: r.messageSafe });
    }
  }
  return results;
}
