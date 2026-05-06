import { prisma } from "@/lib/db";
import {
  getGmailOAuthConfigStatus,
  getGmailScopePosture,
  getRequestedGmailScopes,
} from "@/lib/gmail/config";
import { isStaffGmailSealedV2 } from "@/lib/gmail/staff-oauth-storage";
import { parseGmailSyncState, type GmailSyncStateV1 } from "@/lib/gmail/gmail-sync-state";
import { checkStaffGmailSyncStateMigration } from "@/lib/gmail/db-readiness";

export type GmailMonitorSnapshot = {
  oauth: ReturnType<typeof getGmailOAuthConfigStatus>;
  requestedScopes: readonly string[];
  scopePosture: ReturnType<typeof getGmailScopePosture>;
  actorResolved: boolean;
  staffRow: null | {
    sendAsDomainHint: string | null;
    isActive: boolean;
    lastError: string | null;
    scopes: string[] | null;
    accessTokenExpiresAtIso: string | null;
    hasRefreshToken: boolean;
    storageFormat: "v2_sealed" | "legacy_plain" | "unknown";
    updatedAtIso: string;
    syncState: GmailSyncStateV1;
  };
  warnings: string[];
};

function domainHint(email: string): string | null {
  const at = email.indexOf("@");
  if (at === -1 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase() || null;
}

/**
 * Admin Gmail monitor read model — no tokens, no secret values.
 */
export async function getGmailMonitorSnapshot(actorUserId: string | null): Promise<GmailMonitorSnapshot> {
  const oauth = getGmailOAuthConfigStatus();
  const requestedScopes = getRequestedGmailScopes();
  const posture = getGmailScopePosture();
  const migration = await checkStaffGmailSyncStateMigration();

  const warnings: string[] = [
    "This monitor does not send email, auto-reply, or mass mail.",
    "Metadata-only sync does not read message bodies; `q` search is unavailable with gmail.metadata — INBOX list + per-message METADATA headers only.",
    "Gmail send from the workbench composer is separate and requires `GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true` on connect — not used by EmailWorkflowItem.",
    "Queue auto-create from live Gmail is a future governed packet — this sync never creates EmailWorkflowItem rows.",
    "Pub/Sub `users.watch` + POST /api/gmail/pubsub scaffold = EMAIL-GMAIL-WATCH-1.2 — set GOOGLE_PUBSUB_TOPIC + verification token; renew watch before expiry.",
    "EMAIL-GMAIL-PRODUCTION-WATCH-HARDENING-1.0 — run `npm run gmail:watch:renewal-check` (dry-run) from RedDirt/ for renewal posture; stale `lastHistoryId` requires safe metadata sync before history preview.",
    "`npm run check` passing does not prove `npx prisma migrate deploy` ran — use `npm run email:command-center:preflight` or `npx prisma migrate deploy && npm run check`.",
  ];

  if (!migration.ok) {
    warnings.push(
      `Database readiness: ${migration.messageSafe} — Gmail monitor persistence may be broken until migrations apply.`
    );
  }

  if (!actorUserId) {
    return {
      oauth,
      requestedScopes,
      scopePosture: posture,
      actorResolved: false,
      staffRow: null,
      warnings,
    };
  }

  const row = await prisma.staffGmailAccount.findUnique({
    where: { userId: actorUserId },
  });

  if (!row) {
    return {
      oauth,
      requestedScopes,
      scopePosture: posture,
      actorResolved: true,
      staffRow: null,
      warnings,
    };
  }

  const json = row.oauthJson as unknown;
  let scopes: string[] | null = null;
  let accessTokenExpiresAtIso: string | null = null;
  let hasRefreshToken = false;
  let storageFormat: "v2_sealed" | "legacy_plain" | "unknown" = "unknown";

  if (isStaffGmailSealedV2(json)) {
    storageFormat = "v2_sealed";
    scopes = [...json.meta.scopes];
    accessTokenExpiresAtIso = json.meta.accessTokenExpiresAtIso;
    hasRefreshToken = json.meta.hasRefreshToken;
  } else if (json && typeof json === "object" && "refresh_token" in json) {
    storageFormat = "legacy_plain";
    hasRefreshToken = Boolean((json as { refresh_token?: string }).refresh_token);
    warnings.push(
      "Stored tokens use a legacy on-disk shape — reconnect via “Reconnect Gmail” to move to encrypted storage (v2)."
    );
  }

  const syncState = parseGmailSyncState(row.gmailSyncState);

  return {
    oauth,
    requestedScopes,
    scopePosture: posture,
    actorResolved: true,
    staffRow: {
      sendAsDomainHint: domainHint(row.sendAsEmail),
      isActive: row.isActive,
      lastError: row.lastError,
      scopes,
      accessTokenExpiresAtIso,
      hasRefreshToken,
      storageFormat,
      updatedAtIso: row.updatedAt.toISOString(),
      syncState,
    },
    warnings,
  };
}

