/**
 * EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0 — operator-facing readiness + renewal planning.
 * Postgres + env names only; no tokens; no Gmail sends; no body ingestion.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getGmailOAuthConfigStatus } from "@/lib/gmail/config";
import {
  mergeGmailSyncStatePatch,
  parseGmailSyncState,
  resolveDisplayWatchStatus,
} from "@/lib/gmail/gmail-sync-state";
import {
  DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS,
  listGmailWatchRenewalCandidates,
  type WatchRenewalCandidate,
} from "@/lib/gmail/watch-renewal";
import { startOrRenewGmailWatchForAccount } from "@/lib/gmail/watch";
import { getConnectedStaffGmailRow } from "@/lib/gmail/client";
import {
  getGmailWatchConfigStatus,
  getGmailWatchRenewalPolicy,
  isGmailPubSubVerificationConfigured,
  isGmailWatchConfigured,
} from "@/lib/gmail/watch-config";

const EXPIRING_SOON_MS = 48 * 60 * 60 * 1000;
const DRY_RUN_CLI = "npm run gmail:watch:renewal-check";
const MONITOR_PATH = "/admin/workbench/email-command-center/gmail";

export type GmailWatchProductionReadiness = {
  oauthPipelineConfigured: boolean;
  topicConfigured: boolean;
  verificationTokenConfigured: boolean;
  /** True when topic + verifier allow POST /api/gmail/pubsub to accept pushes. */
  pubsubReceiverConfigured: boolean;
  renewalPolicyDays: number;
  maxWatchLifetimeDays: number;
  renewalLookaheadHours: number;
  dryRunRenewalCli: string;
  subscriberRoute: string;
  /** Operator-safe bullets — no secret values. */
  runbookNotesSafe: string[];
};

export function getGmailWatchProductionReadiness(): GmailWatchProductionReadiness {
  const oauth = getGmailOAuthConfigStatus();
  const watchCfg = getGmailWatchConfigStatus();
  const policy = getGmailWatchRenewalPolicy();
  const topicOk = watchCfg.topicConfigured;
  const verifierOk = watchCfg.verificationTokenConfigured;

  const runbookNotesSafe = [
    "Renew users.watch before expiration (Google max ~7 days per registration).",
    "After history.list returns 404 on lastHistoryId, run safe metadata sync then optional history preview — counts only.",
    `Dry-run all mailboxes: ${DRY_RUN_CLI} (default). Execute renewals only with --execute and GMAIL_WATCH_RENEWAL_EXECUTE=1.`,
    "POST /api/gmail/pubsub must reject traffic until verification token env is set — avoids unauthenticated writes.",
  ];

  return {
    oauthPipelineConfigured: oauth.isConfigured,
    topicConfigured: topicOk,
    verificationTokenConfigured: verifierOk,
    pubsubReceiverConfigured: topicOk && verifierOk,
    renewalPolicyDays: policy.recommendedIntervalDays,
    maxWatchLifetimeDays: policy.maxWatchLifetimeDays,
    renewalLookaheadHours: Math.round(DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS / 3600000),
    dryRunRenewalCli: DRY_RUN_CLI,
    subscriberRoute: "POST /api/gmail/pubsub",
    runbookNotesSafe,
  };
}

/** Accounts whose watch should be renewed soon (same rules as watch-renewal.ts). */
export async function listGmailWatchAccountsNeedingRenewal(
  lookaheadMs: number = DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS
): Promise<WatchRenewalCandidate[]> {
  const all = await listGmailWatchRenewalCandidates(lookaheadMs);
  return all.filter((c) => c.needsRenewal);
}

export type GmailWatchRenewalPlanAccount = {
  userId: string;
  sendAsEmailDomainHint: string | null;
  displayStatus: WatchRenewalCandidate["displayStatus"];
  reasonSafe: string;
};

export type GmailWatchRenewalPlan = {
  missingEnvVarNames: string[];
  lookaheadMs: number;
  accounts: GmailWatchRenewalPlanAccount[];
  stepsSafe: string[];
};

export async function buildGmailWatchRenewalPlan(
  lookaheadMs: number = DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS
): Promise<GmailWatchRenewalPlan> {
  const oauth = getGmailOAuthConfigStatus();
  const watchCfg = getGmailWatchConfigStatus();
  const missingEnvVarNames: string[] = [];
  if (!watchCfg.topicConfigured) missingEnvVarNames.push(watchCfg.topicEnvVarName);
  if (!watchCfg.verificationTokenConfigured) {
    missingEnvVarNames.push("GMAIL_PUBSUB_VERIFICATION_TOKEN or GOOGLE_PUBSUB_VERIFICATION_TOKEN");
  }
  if (!oauth.isConfigured && oauth.gaps[0]?.missingEnvVars?.length) {
    missingEnvVarNames.push(...oauth.gaps[0].missingEnvVars);
  }

  const needs = await listGmailWatchAccountsNeedingRenewal(lookaheadMs);
  const accounts: GmailWatchRenewalPlanAccount[] = needs.map((c) => ({
    userId: c.userId,
    sendAsEmailDomainHint: c.sendAsEmailDomainHint,
    displayStatus: c.displayStatus,
    reasonSafe: c.reasonSafe,
  }));

  const stepsSafe = [
    "Confirm GOOGLE_PUBSUB_TOPIC and Pub/Sub verification token env are set (names only in logs).",
    "Confirm Gmail monitor shows connected Staff Gmail row for each mailbox.",
    "Run metadata sync if history cursor is stale before relying on incremental history.",
    `Run ${DRY_RUN_CLI} from RedDirt/ to list mailboxes in the renewal window.`,
    "To call users.watch from CLI: GMAIL_WATCH_RENEWAL_EXECUTE=1 npm run gmail:watch:renewal-check -- --execute",
    "Alternatively use Gmail monitor → Start / renew Gmail watch per mailbox (no send).",
  ];

  return { missingEnvVarNames, lookaheadMs, accounts, stepsSafe };
}

/**
 * Renews Gmail push watch for a staff mailbox (`StaffGmailAccount.userId`).
 * Calls existing `users.watch` helper — **no** mail send, **no** body reads.
 */
export async function renewGmailWatchForAccount(accountId: string) {
  return startOrRenewGmailWatchForAccount(accountId);
}

/**
 * Marks the stored profile/history cursor as stale so operators run metadata sync before history.list.
 * Does not delete data.
 */
export async function markGmailCursorStale(accountId: string): Promise<{ ok: true } | { ok: false; messageSafe: string }> {
  const row = await getConnectedStaffGmailRow(accountId);
  if (!row) {
    return { ok: false, messageSafe: "no_active_staff_gmail_row" };
  }
  const next = mergeGmailSyncStatePatch(row.gmailSyncState, {
    historyCursorStale: true,
    requiresFullSync: true,
  });
  await prisma.staffGmailAccount.update({
    where: { userId: accountId },
    data: { gmailSyncState: next as unknown as Prisma.InputJsonValue },
  });
  return { ok: true };
}

export type GmailHistoryProcessingSummary = {
  activeStaffAccounts: number;
  withProfileHistoryId: number;
  historyCursorStaleCount: number;
  requiresFullSyncCount: number;
  /** lastHistoryDryRunStatus === 404_need_full_sync */
  lastDryRun404Count: number;
  /** Accounts with a Pub/Sub signal but no profile cursor yet. */
  pendingSignalWithoutProfileCursor: number;
  /** ACTIVE watch expiring within 48h. */
  watchesExpiringWithin48h: number;
};

export async function getGmailHistoryProcessingSummary(): Promise<GmailHistoryProcessingSummary> {
  const empty: GmailHistoryProcessingSummary = {
    activeStaffAccounts: 0,
    withProfileHistoryId: 0,
    historyCursorStaleCount: 0,
    requiresFullSyncCount: 0,
    lastDryRun404Count: 0,
    pendingSignalWithoutProfileCursor: 0,
    watchesExpiringWithin48h: 0,
  };
  let rows: { gmailSyncState: Prisma.JsonValue }[];
  try {
    rows = await prisma.staffGmailAccount.findMany({
      where: { isActive: true },
      select: { gmailSyncState: true },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if ((/does not exist/i.test(msg) && /StaffGmailAccount/i.test(msg)) || /P2021|P2010/i.test(msg)) {
      return empty;
    }
    throw e;
  }

  let withProfileHistoryId = 0;
  let historyCursorStaleCount = 0;
  let requiresFullSyncCount = 0;
  let lastDryRun404Count = 0;
  let pendingSignalWithoutProfileCursor = 0;
  let watchesExpiringWithin48h = 0;
  const now = Date.now();

  for (const r of rows) {
    const s = parseGmailSyncState(r.gmailSyncState);
    if (s.lastHistoryId) withProfileHistoryId += 1;
    if (s.historyCursorStale === true) historyCursorStaleCount += 1;
    if (s.requiresFullSync === true) requiresFullSyncCount += 1;
    if (s.lastHistoryDryRunStatus === "404_need_full_sync") lastDryRun404Count += 1;
    const hasSignal = Boolean(s.pendingHistoryId || s.lastPubSubHistoryId);
    if (hasSignal && !s.lastHistoryId) pendingSignalWithoutProfileCursor += 1;
    const disp = resolveDisplayWatchStatus(s);
    if (disp === "ACTIVE" && s.watchExpiration) {
      const exp = Number(s.watchExpiration);
      if (Number.isFinite(exp) && exp > now && exp - now <= EXPIRING_SOON_MS) {
        watchesExpiringWithin48h += 1;
      }
    }
  }

  return {
    activeStaffAccounts: rows.length,
    withProfileHistoryId,
    historyCursorStaleCount,
    requiresFullSyncCount,
    lastDryRun404Count,
    pendingSignalWithoutProfileCursor,
    watchesExpiringWithin48h,
  };
}

export type GmailProductionWatchSnapshot = {
  dbReachable: boolean;
  missingPubsubTopic: boolean;
  missingPubsubVerification: boolean;
  oauthWatchPrereqsOk: boolean;
  activeStaffAccounts: number;
  accountsNeedingRenewalCount: number;
  accountsWithStaleHistoryCursorCount: number;
  watchesExpiringWithin48hCount: number;
  pendingPubsubSignalWithoutProfileCursorCount: number;
  monitorPath: string;
  dryRunRenewalCli: string;
};

export async function buildGmailProductionWatchSnapshot(): Promise<GmailProductionWatchSnapshot> {
  try {
    const readiness = getGmailWatchProductionReadiness();
    const history = await getGmailHistoryProcessingSummary();
    const renewalCandidates = await listGmailWatchRenewalCandidates(DEFAULT_RENEW_IF_EXPIRES_WITHIN_MS);
    const accountsNeedingRenewalCount = renewalCandidates.filter((c) => c.needsRenewal).length;

    return {
      dbReachable: true,
      missingPubsubTopic: !readiness.topicConfigured,
      missingPubsubVerification: !readiness.verificationTokenConfigured,
      oauthWatchPrereqsOk: readiness.oauthPipelineConfigured,
      activeStaffAccounts: history.activeStaffAccounts,
      accountsNeedingRenewalCount,
      accountsWithStaleHistoryCursorCount: history.historyCursorStaleCount,
      watchesExpiringWithin48hCount: history.watchesExpiringWithin48h,
      pendingPubsubSignalWithoutProfileCursorCount: history.pendingSignalWithoutProfileCursor,
      monitorPath: MONITOR_PATH,
      dryRunRenewalCli: DRY_RUN_CLI,
    };
  } catch {
    return {
      dbReachable: false,
      missingPubsubTopic: !isGmailWatchConfigured(),
      missingPubsubVerification: !isGmailPubSubVerificationConfigured(),
      oauthWatchPrereqsOk: getGmailOAuthConfigStatus().isConfigured,
      activeStaffAccounts: 0,
      accountsNeedingRenewalCount: 0,
      accountsWithStaleHistoryCursorCount: 0,
      watchesExpiringWithin48hCount: 0,
      pendingPubsubSignalWithoutProfileCursorCount: 0,
      monitorPath: MONITOR_PATH,
      dryRunRenewalCli: DRY_RUN_CLI,
    };
  }
}
