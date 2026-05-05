/**
 * Gmail OAuth + Command Center monitor configuration (env names only in UI; never log values).
 * Supports both legacy `GOOGLE_GMAIL_*` / `GOOGLE_CALENDAR_*` and packet-style `GOOGLE_CLIENT_ID` aliases.
 */

import { isGmailTokenEncryptionConfigured } from "./token-crypto";

const GMAIL_SCOPE_METADATA = "https://www.googleapis.com/auth/gmail.metadata";
const GMAIL_SCOPE_SEND = "https://www.googleapis.com/auth/gmail.send";

/**
 * When `true`, OAuth consent includes `gmail.send` for the existing workbench human composer.
 * Default `false` — monitor-only connects use **`gmail.metadata` only** (narrowest for this packet).
 */
export function isComposerGmailSendScopeRequested(): boolean {
  return process.env.GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH === "true";
}

/**
 * Scopes requested on **new** connect/reconnect. Monitoring does not use `gmail.send`.
 * Workbench Gmail send requires `GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH=true` then reconnect.
 */
export function getRequestedGmailScopes(): readonly string[] {
  if (isComposerGmailSendScopeRequested()) {
    return [GMAIL_SCOPE_METADATA, GMAIL_SCOPE_SEND] as const;
  }
  return [GMAIL_SCOPE_METADATA] as const;
}

export function getGmailScopePosture() {
  return {
    monitorScopes: [GMAIL_SCOPE_METADATA] as const,
    optionalComposerSendScope: GMAIL_SCOPE_SEND,
    composerSendRequestedViaEnv: isComposerGmailSendScopeRequested(),
  };
}

export type GmailOAuthConfigGap = {
  /** Env var name(s) that are missing; client-friendly (no values). */
  missingEnvVars: string[];
};

export type GmailOAuthConfigStatus = {
  isConfigured: boolean;
  gaps: GmailOAuthConfigGap[];
  /** Names only — which related vars are present */
  present: {
    clientId: boolean;
    clientSecret: boolean;
    redirectUri: boolean;
    tokenEncryptionKey: boolean;
    oauthStateSecret: boolean;
    pubsubTopic: boolean;
  };
};

function resolveClientId(): string {
  return (
    process.env.GOOGLE_GMAIL_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim() ||
    ""
  );
}

function resolveClientSecret(): string {
  return (
    process.env.GOOGLE_GMAIL_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim() ||
    ""
  );
}

/**
 * Redirect URI for `/api/gmail/oauth/callback` — must match Google Cloud Console.
 */
export function getGmailRedirectUri(): string {
  const explicit = process.env.GOOGLE_GMAIL_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  return site ? `${site}/api/gmail/oauth/callback` : "";
}

export function getGmailEnvForOAuth() {
  return {
    clientId: resolveClientId(),
    clientSecret: resolveClientSecret(),
    redirectUri: getGmailRedirectUri(),
  };
}

/** Client credentials + redirect only (token exchange, API client). */
export function isGmailOAuthCoreConfigured(): boolean {
  const e = getGmailEnvForOAuth();
  return Boolean(e.clientId && e.clientSecret && e.redirectUri);
}

/** @deprecated Use `isGmailOAuthCoreConfigured` or `getGmailOAuthConfigStatus().isConfigured`. */
export function isGmailOAuthConfigured(): boolean {
  return isGmailOAuthCoreConfigured();
}

export function getGmailPubSubTopicEnv(): string {
  return process.env.GOOGLE_PUBSUB_TOPIC?.trim() ?? "";
}

export function isGmailPubSubTopicConfigured(): boolean {
  return Boolean(getGmailPubSubTopicEnv());
}

function stateSecretPresent(): boolean {
  return Boolean(process.env.GMAIL_OAUTH_STATE_SECRET?.trim() || process.env.ADMIN_SECRET?.trim());
}

export function getGmailOAuthConfigStatus(): GmailOAuthConfigStatus {
  const e = getGmailEnvForOAuth();
  const missing: string[] = [];
  if (!e.clientId) {
    missing.push("GOOGLE_GMAIL_CLIENT_ID or GOOGLE_CLIENT_ID or GOOGLE_CALENDAR_CLIENT_ID");
  }
  if (!e.clientSecret) {
    missing.push("GOOGLE_GMAIL_CLIENT_SECRET or GOOGLE_CLIENT_SECRET or GOOGLE_CALENDAR_CLIENT_SECRET");
  }
  if (!e.redirectUri) {
    missing.push("GOOGLE_GMAIL_REDIRECT_URI or NEXT_PUBLIC_SITE_URL (for default callback URL)");
  }
  const enc = isGmailTokenEncryptionConfigured();
  if (!enc) {
    missing.push("GMAIL_TOKEN_ENCRYPTION_KEY");
  }
  const st = stateSecretPresent();
  if (!st) {
    missing.push("GMAIL_OAUTH_STATE_SECRET or ADMIN_SECRET");
  }

  const coreOk = Boolean(e.clientId && e.clientSecret && e.redirectUri && enc && st);
  return {
    isConfigured: coreOk,
    gaps: [{ missingEnvVars: missing }],
    present: {
      clientId: Boolean(e.clientId),
      clientSecret: Boolean(e.clientSecret),
      redirectUri: Boolean(e.redirectUri),
      tokenEncryptionKey: enc,
      oauthStateSecret: st,
      pubsubTopic: isGmailPubSubTopicConfigured(),
    },
  };
}
