/**
 * Encrypted file-backed YouTube OAuth connection store.
 * Path: data/integrations/youtube-oauth.sealed.json (gitignored).
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Credentials } from "google-auth-library";
import { getRequestedYouTubeScopes } from "./oauth-config";
import { openYouTubeTokenPayload, sealYouTubeTokenPayload } from "./token-crypto";

export const YOUTUBE_OAUTH_FORMAT_V1 = 1 as const;
export const YOUTUBE_OAUTH_STORE_REL = "data/integrations/youtube-oauth.sealed.json";

export type YouTubeSealedOAuthV1 = {
  formatVersion: typeof YOUTUBE_OAUTH_FORMAT_V1;
  sealed: {
    ciphertextB64: string;
    ivB64: string;
    authTagB64: string;
  };
  meta: {
    scopes: readonly string[];
    connectedAtIso: string;
    updatedAtIso: string;
    accessTokenExpiresAtIso: string | null;
    hasRefreshToken: boolean;
    channelId: string | null;
    channelTitle: string | null;
    accountEmail: string | null;
  };
};

export type YouTubeConnectionPublicStatus = {
  connected: boolean;
  channelId: string | null;
  channelTitle: string | null;
  accountEmail: string | null;
  connectedAtIso: string | null;
  updatedAtIso: string | null;
  hasRefreshToken: boolean;
  accessTokenExpiresAtIso: string | null;
  scopes: readonly string[];
};

function storeAbs(repoRoot: string): string {
  return path.join(repoRoot, YOUTUBE_OAUTH_STORE_REL);
}

export function loadYouTubeSealedOAuth(repoRoot: string = process.cwd()): YouTubeSealedOAuthV1 | null {
  const abs = storeAbs(repoRoot);
  if (!existsSync(abs)) return null;
  try {
    const raw = JSON.parse(readFileSync(abs, "utf8")) as YouTubeSealedOAuthV1;
    if (raw.formatVersion !== YOUTUBE_OAUTH_FORMAT_V1) return null;
    return raw;
  } catch {
    return null;
  }
}

export function saveYouTubeSealedOAuth(record: YouTubeSealedOAuthV1, repoRoot: string = process.cwd()): void {
  const abs = storeAbs(repoRoot);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

export function clearYouTubeOAuthStore(repoRoot: string = process.cwd()): void {
  const abs = storeAbs(repoRoot);
  if (existsSync(abs)) unlinkSync(abs);
}

export function buildYouTubeSealedRecord(
  tokens: Credentials,
  meta?: Partial<YouTubeSealedOAuthV1["meta"]>,
): YouTubeSealedOAuthV1 {
  const now = new Date().toISOString();
  const sealed = sealYouTubeTokenPayload(JSON.stringify(tokens));
  return {
    formatVersion: YOUTUBE_OAUTH_FORMAT_V1,
    sealed,
    meta: {
      scopes: [...getRequestedYouTubeScopes()],
      connectedAtIso: meta?.connectedAtIso ?? now,
      updatedAtIso: now,
      accessTokenExpiresAtIso:
        typeof tokens.expiry_date === "number" ? new Date(tokens.expiry_date).toISOString() : null,
      hasRefreshToken: Boolean(tokens.refresh_token),
      channelId: meta?.channelId ?? null,
      channelTitle: meta?.channelTitle ?? null,
      accountEmail: meta?.accountEmail ?? null,
    },
  };
}

export function extractYouTubeCredentials(record: YouTubeSealedOAuthV1 | null): Credentials | null {
  if (!record) return null;
  try {
    return JSON.parse(openYouTubeTokenPayload(record.sealed)) as Credentials;
  } catch {
    return null;
  }
}

export function getYouTubeConnectionPublicStatus(repoRoot: string = process.cwd()): YouTubeConnectionPublicStatus {
  const rec = loadYouTubeSealedOAuth(repoRoot);
  if (!rec) {
    return {
      connected: false,
      channelId: null,
      channelTitle: null,
      accountEmail: null,
      connectedAtIso: null,
      updatedAtIso: null,
      hasRefreshToken: false,
      accessTokenExpiresAtIso: null,
      scopes: [],
    };
  }
  return {
    connected: true,
    channelId: rec.meta.channelId,
    channelTitle: rec.meta.channelTitle,
    accountEmail: rec.meta.accountEmail,
    connectedAtIso: rec.meta.connectedAtIso,
    updatedAtIso: rec.meta.updatedAtIso,
    hasRefreshToken: rec.meta.hasRefreshToken,
    accessTokenExpiresAtIso: rec.meta.accessTokenExpiresAtIso,
    scopes: rec.meta.scopes,
  };
}
